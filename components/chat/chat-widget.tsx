"use client";

import {
  Calendar03Icon,
  Cancel01Icon,
  InformationCircleIcon,
  Message01Icon,
  RefreshIcon,
  SentIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  isError?: boolean;
}

const STORAGE_SESSION_KEY = "aura_clinic_chat_session_id";
const STORAGE_MESSAGES_KEY = "aura_clinic_chat_messages";

const INITIAL_GREETING: ChatMessage = {
  id: "initial-greeting",
  role: "assistant",
  text: "Namaste! I am Dr. Rajesh Kulkarni's virtual assistant at Aura Clinic, Pune.\n\nI can help you check OPD timings, learn about clinic services, or book an appointment. How can I assist you today?",
  timestamp: "Just now",
};

const SUGGESTED_QUESTIONS = [
  "I want to book an appointment",
  "What are the clinic OPD timings?",
  "What is Dr. Kulkarni's hospital schedule?",
  "What services & checkups are available?",
];

function generateSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function formatCurrentTime(): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or restore session ID and messages from sessionStorage
  useEffect(() => {
    try {
      let storedSessionId = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        sessionStorage.setItem(STORAGE_SESSION_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);

      const storedMessages = sessionStorage.getItem(STORAGE_MESSAGES_KEY);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      setSessionId(generateSessionId());
    }
  }, []);

  // Sync messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
      } catch {
        // Ignore storage quotas or restrictions
      }
    }
  }, [messages]);

  // Handle ESC key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Scroll to bottom of message thread
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      // Focus input when opened
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const adjustTextareaHeight = (element?: HTMLTextAreaElement | null) => {
    const el = element ?? textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 128);
    el.style.height = `${Math.max(newHeight, 42)}px`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);
  };

  // Handle starting a new conversation
  const handleResetConversation = () => {
    const newSession = generateSessionId();
    setSessionId(newSession);
    const freshMessages: ChatMessage[] = [
      {
        ...INITIAL_GREETING,
        id: `greeting_${Date.now()}`,
        timestamp: formatCurrentTime(),
      },
    ];
    setMessages(freshMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    try {
      sessionStorage.setItem(STORAGE_SESSION_KEY, newSession);
      sessionStorage.setItem(
        STORAGE_MESSAGES_KEY,
        JSON.stringify(freshMessages),
      );
    } catch {
      // Ignore
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) {
      return;
    }

    const currentSession = sessionId || generateSessionId();
    if (!sessionId) {
      setSessionId(currentSession);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      text,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId: currentSession,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorText =
          data?.error ||
          "Sorry, I am unable to connect to the clinic assistant right now. Please try again or call the clinic directly at +91 98220 12345.";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant_err_${Date.now()}`,
            role: "assistant",
            text: errorText,
            timestamp: formatCurrentTime(),
            isError: true,
          },
        ]);

        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
        return;
      }

      const replyText =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "Thank you for reaching out. Please feel free to ask any other questions about Dr. Kulkarni's clinic or appointments.";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          role: "assistant",
          text: replyText,
          timestamp: formatCurrentTime(),
        },
      ]);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_err_${Date.now()}`,
          role: "assistant",
          text: "Network connection issue. Please check your internet connection or call the clinic at +91 98220 12345.",
          timestamp: formatCurrentTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter: allow default newline insertion
        return;
      }
      // Enter without Shift: send message
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-500/30"
          aria-label={
            isOpen
              ? "Close clinic chat"
              : "Open clinic assistant & booking chat"
          }
        >
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-5 transition-transform duration-200"
                strokeWidth={2.2}
              />
            ) : (
              <HugeiconsIcon
                icon={Message01Icon}
                className="size-5 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={2.2}
              />
            )}

            {/* Unread indicator */}
            {!isOpen && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-semibold leading-tight flex items-center gap-1.5">
              <span>Chat & Book</span>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-teal-200 leading-tight">
              Aura Assistant
            </span>
          </div>

          {/* Online green dot for mobile */}
          {!isOpen && unreadCount === 0 && (
            <span className="sm:hidden absolute top-0 right-0 flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500 border-2 border-white" />
            </span>
          )}
        </button>
      </div>

      {/* Large Centered Modal Dialog & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop button */}
          <button
            type="button"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-default -z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close modal backdrop"
            tabIndex={-1}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Aura Clinic Assistant & Appointment Booking"
            className="relative w-full max-w-3xl lg:max-w-4xl h-[680px] max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-teal-700/50 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="relative flex size-11 items-center justify-center rounded-2xl bg-teal-600/80 ring-2 ring-teal-300/30 shadow-inner">
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    className="size-5.5 text-teal-100"
                    strokeWidth={2.2}
                  />
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 border-2 border-teal-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold leading-tight text-white">
                      Aura Clinic Assistant & Booking
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-medium text-teal-200 border border-teal-400/30">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Live AI Concierge
                    </span>
                  </div>
                  <p className="text-xs text-teal-200/90 leading-tight mt-0.5">
                    Dr. Rajesh Kulkarni, MBBS • Consultant Physician • Pune
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* New Conversation Button */}
                <button
                  type="button"
                  onClick={handleResetConversation}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
                  title="Start fresh conversation"
                  aria-label="Start fresh conversation"
                >
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    className="size-4"
                    strokeWidth={2}
                  />
                  <span className="hidden md:inline">New Chat</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close chat dialog"
                  aria-label="Close chat dialog"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="size-5"
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            </div>

            {/* Medical Notice / Guardrail Banner */}
            <div className="flex items-center justify-between gap-2 bg-amber-50/90 border-b border-amber-200/70 px-4 py-2 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="size-4 shrink-0 text-amber-700"
                  strokeWidth={2}
                />
                <span>
                  Assistant provides clinic timings, appointment assistance &
                  FAQs. In medical emergencies, please visit the hospital
                  casualty ward directly.
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-800 font-medium">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  className="size-3.5 text-amber-700"
                />
                <span>Mon–Sat OPD</span>
              </div>
            </div>

            {/* Message Thread (Spacious) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                      msg.role === "user"
                        ? "bg-teal-700 text-white rounded-tr-xs"
                        : msg.isError
                          ? "bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Quick Suggestions (Shown when only initial message exists) */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-3 space-y-2 max-w-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Common Questions & Actions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSendMessage(question)}
                        className="text-left text-xs bg-white hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 rounded-xl px-3.5 py-2.5 transition-all shadow-xs flex items-center justify-between group"
                      >
                        <span>{question}</span>
                        <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing / Loading Indicator */}
              {isLoading && (
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                    <span className="text-xs text-slate-500">
                      Dr. Kulkarni&apos;s assistant is thinking
                    </span>
                    <span className="size-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-1.5 rounded-full bg-teal-600 animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Footer */}
            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2.5"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask about booking an appointment, timings, fees, or services..."
                  maxLength={1000}
                  className="flex-1 min-w-0 resize-none overflow-y-auto max-h-32 min-h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white disabled:opacity-60 transition leading-relaxed"
                />

                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="default"
                  className="h-[42px] px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white shrink-0 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5 self-end"
                  aria-label="Send message"
                >
                  <span className="hidden sm:inline text-xs font-semibold">
                    Send
                  </span>
                  <HugeiconsIcon
                    icon={SentIcon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </Button>
              </form>
              <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
                <span>Press Enter to send • Shift+Enter for newline</span>
                <span>Aura Health Clinic • Pune</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
