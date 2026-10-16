import { type NextRequest, NextResponse } from "next/server";
import { chatMessageSchema, chatResponseSchema } from "@/lib/validations/chat";

/**
 * Basic in-memory rate limiter per IP / session ID.
 * Limits to 20 requests per minute to prevent flooding and webhook abuse.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(key: string): boolean {
  const now = Date.now();

  // Opportunistic cleanup if map gets large
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    }
  }

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting by IP or fallback
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "client-unknown";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error:
            "Too many requests sent. Please wait a moment before sending another message.",
        },
        { status: 429 },
      );
    }

    // 2. Parse request JSON body safely
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 },
      );
    }

    // 3. Validate request schema
    const parseResult = chatMessageSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { message, sessionId } = parseResult.data;

    // 4. Check webhook URL configuration
    const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();

    if (
      !webhookUrl ||
      webhookUrl.includes("your-n8n-domain") ||
      webhookUrl.includes("your-webhook-path")
    ) {
      // Graceful fallback for local development before n8n is connected
      return NextResponse.json({
        reply:
          "Namaste! I am Dr. Rajesh Kulkarni's virtual clinic assistant. Aura Clinic is open Monday to Saturday (8:30 AM – 1:00 PM & 5:00 PM – 9:00 PM) at Bharati Vidyapeeth Medical Campus, Pune.\n\n[Note: N8N_WEBHOOK_URL is not yet configured in .env.local. Please configure your live n8n webhook URL to enable dynamic AI responses.]",
      });
    }

    // 5. Send POST request to n8n webhook with 15-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message, sessionId }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      if (
        (fetchErr as Error)?.name === "AbortError" ||
        controller.signal.aborted
      ) {
        return NextResponse.json(
          {
            error:
              "The assistant took too long to respond. Please try again in a moment.",
          },
          { status: 504 },
        );
      }

      // Log error server-side without leaking URL or secrets
      console.error(
        "[Chat API] Network error connecting to assistant webhook:",
        fetchErr instanceof Error ? fetchErr.message : "Unknown error",
      );

      return NextResponse.json(
        {
          error:
            "Unable to connect to the assistant right now. Please try again or call the clinic at +91 98220 12345.",
        },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 6. Handle non-success HTTP status from n8n
    if (!n8nResponse.ok) {
      console.error(
        `[Chat API] Webhook responded with HTTP error status: ${n8nResponse.status}`,
      );
      return NextResponse.json(
        {
          error:
            "The assistant service is currently unavailable. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    // 7. Parse and validate JSON response from n8n
    let responseData: unknown;
    try {
      responseData = await n8nResponse.json();
    } catch {
      console.error("[Chat API] Failed to parse n8n webhook response as JSON.");
      return NextResponse.json(
        {
          error:
            "Received an unreadable response from the assistant. Please try again.",
        },
        { status: 502 },
      );
    }

    // Validate expected format: { "reply": "..." }
    const validatedResponse = chatResponseSchema.safeParse(responseData);
    if (validatedResponse.success) {
      return NextResponse.json({ reply: validatedResponse.data.reply });
    }

    // Tolerant fallback for common alternative n8n output keys ({ output, text, message })
    const rawRecord = responseData as Record<string, unknown> | null;
    const alternateReply =
      typeof rawRecord?.output === "string"
        ? rawRecord.output
        : typeof rawRecord?.text === "string"
          ? rawRecord.text
          : typeof rawRecord?.message === "string"
            ? rawRecord.message
            : null;

    if (alternateReply && alternateReply.trim().length > 0) {
      return NextResponse.json({ reply: alternateReply.trim() });
    }

    console.error(
      "[Chat API] Webhook response did not match { reply: string } schema.",
    );
    return NextResponse.json(
      {
        error:
          "The assistant provided an unrecognized response format. Please try again.",
      },
      { status: 502 },
    );
  } catch (err: unknown) {
    console.error(
      "[Chat API] Unexpected server error in POST /api/chat:",
      err instanceof Error ? err.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          "An unexpected server error occurred. Please try again in a few moments.",
      },
      { status: 500 },
    );
  }
}
