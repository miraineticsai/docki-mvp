import { z } from "zod";

/**
 * Zod validation schema for patient chatbot messages.
 * Enforces non-empty strings, realistic max character limits,
 * and valid session identifiers.
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty." })
    .max(1000, { message: "Message cannot exceed 1,000 characters." }),
  sessionId: z
    .string()
    .trim()
    .min(1, { message: "Session ID cannot be empty." })
    .max(128, { message: "Session ID is too long." }),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const chatResponseSchema = z.object({
  reply: z.string().min(1, { message: "Reply cannot be empty." }),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
