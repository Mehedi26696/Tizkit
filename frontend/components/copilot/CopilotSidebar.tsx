"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";
import { copilotChat } from "@/lib/api/copilot";
import type { CopilotChatResponse } from "@/types/copilot";
import { cn } from "@/lib/utils";

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  latex: string;
  selection?: string;
  errors?: string;
  editorType?: string;
  onInsert: (latexSnippet: string, meta?: { userMessage?: string }) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  insert?: string;
  request?: string;
}

export default function CopilotSidebar({
  isOpen,
  onClose,
  latex,
  selection,
  errors,
  editorType,
  onInsert,
}: CopilotSidebarProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsSending(true);

    try {
      const response: CopilotChatResponse = await copilotChat({
        message: trimmed,
        context: {
          latex,
          selection,
          errors,
          editor_type: editorType,
        },
        provider: "auto",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, insert: response.insert, request: trimmed },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error?.response?.data?.detail || "Copilot failed. Try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 top-24 bottom-6 w-[360px] bg-white border border-[#f1f1f1] rounded-2xl shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f1f1]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FA5F55]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#FA5F55]" />
          </div>
          <div>
            <div className="text-sm font-black">AI Copilot</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">LaTeX Helper</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-gray-400">
            Ask for LaTeX snippets, fixes, or explanations.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={cn(
              "rounded-xl px-3 py-2 text-sm",
              msg.role === "user"
                ? "bg-[#1f1e24] text-white ml-8"
                : "bg-[#f9f4eb] text-[#1f1e24] mr-8"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
            {msg.role === "assistant" && msg.insert && (
              <button
                onClick={() => onInsert(msg.insert || "", { userMessage: msg.request })}
                className="mt-2 text-[10px] uppercase tracking-widest font-black text-[#FA5F55]"
              >
                Insert via Chat
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[#f1f1f1]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot..."
            className="flex-1 px-3 py-2 text-sm border border-[#f1f1f1] rounded-lg outline-none focus:border-[#FA5F55]/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isSending}
            className="p-2 rounded-lg bg-[#FA5F55] text-white disabled:opacity-50"
            title="Send"
          >
            {isSending ? <MessageSquare className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
