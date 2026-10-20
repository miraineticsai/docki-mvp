import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_SENDER_EMAIL,
  getResendClient,
} from "@/lib/email/client";

// Define Constants for Reusability
const SENDER_EMAIL = DEFAULT_SENDER_EMAIL;
const ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL;

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body." },
        { status: 400 },
      );
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const company = body.company ? String(body.company).trim() : "";
    const help = body.help ? String(body.help).trim() : "";
    const message = body.message ? String(body.message).trim() : "";

    // Simple Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing." },
        { status: 400 },
      );
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        {
          success: false,
          message: "RESEND_API_KEY is not configured on server.",
        },
        { status: 500 },
      );
    }

    // --- 1. Admin Notification ---
    const adminEmailTask = resend.emails.send({
      from: SENDER_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email, // Click 'Reply' in inbox to email the customer directly!
      subject: `🚀 New Lead: ${name} (${company || "Individual"})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #000; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "Not provided"}</p>
          <p><strong>Topic:</strong> ${help || "General"}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <strong>Message:</strong><br/>
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    });

    // --- 2. Professional Auto-Reply ---
    const userEmailTask = resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      replyTo: ADMIN_EMAIL, // Directs them to your inbox
      subject: "Thanks for reaching out to Mirainetics",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; color: #444;">
          <h2 style="color: #1a1a1a;">Hello ${name},</h2>
          <p>We’ve received your message regarding <strong>${help || "your inquiry"}</strong>. Our team is currently reviewing your details and we'll get back to you shortly.</p>
          
          <p>If your matter is urgent, feel free to reply directly to this email.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <table style="width: 100%;">
            <tr>
              <td style="width: 60px;">
                <div style="width: 50px; height: 50px; background: #000; color: #fff; text-align: center; line-height: 50px; border-radius: 8px; font-weight: bold; font-size: 20px;">
                  M
                </div>
              </td>
              <td style="vertical-align: middle;">
                <div style="font-weight: bold; color: #1a1a1a; font-size: 16px;">Mirainetics Team</div>
                <div style="font-size: 13px; color: #777;">Innovative Tech Solutions</div>
                <div style="font-size: 13px; color: #0070f3; margin-top: 2px;">
                  <a href="https://mirainetics.com" style="color: #0070f3; text-decoration: none;">mirainetics.com</a>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    // Run both email sends in parallel for better performance
    await Promise.all([adminEmailTask, userEmailTask]);

    return NextResponse.json({ success: true, message: "Emails sent!" });
  } catch (error: unknown) {
    console.error("Resend Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}
