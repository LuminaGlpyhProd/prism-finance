"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { replyToUser } from "@/lib/ai/assistant";
import { useFinanceStore } from "@/store/finance-store";

const QUICK_PROMPTS = [
  "What's my total balance?",
  "How much did I spend this month?",
  "Give me savings tips",
  "What's my financial health score?",
];

export function AssistantView() {
  const chatMessages = useFinanceStore((s) => s.chatMessages);
  const addChatMessage = useFinanceStore((s) => s.addChatMessage);
  const accounts = useFinanceStore((s) => s.accounts);
  const expenses = useFinanceStore((s) => s.expenses);
  const goals = useFinanceStore((s) => s.goals);
  const budget = useFinanceStore((s) => s.budget);
  const getInsights = useFinanceStore((s) => s.getInsights);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const insights = getInsights();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    addChatMessage("user", text);
    const reply = replyToUser(text, { accounts, expenses, goals, budget });
    setTimeout(() => addChatMessage("assistant", reply), 400);
    setInput("");
  };

  return (
    <div className="space-y-6 h-[calc(100dvh-8rem)] flex flex-col">
      <header>
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-400" />
          <h1 className="text-2xl font-bold">AI Assistant</h1>
        </div>
        <p className="text-white/50 text-sm">
          Personalized, friendly financial guidance
        </p>
      </header>

      {insights.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
          {insights.slice(0, 3).map((ins) => (
            <div
              key={ins.id}
              className="glass rounded-xl px-3 py-2 text-xs shrink-0 max-w-[200px]"
            >
              <p className="font-medium text-violet-300/90">{ins.title}</p>
              <p className="text-white/50 mt-0.5 line-clamp-2">{ins.message}</p>
            </div>
          ))}
        </div>
      )}

      <GlassCard className="flex-1 flex flex-col min-h-0 overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-white"
                    : "glass text-white/90"
                }`}
              >
                <MessageContent content={msg.content} />
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-[10px] px-2 py-1 rounded-full glass hover:bg-white/10"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              className="flex-1 glass rounded-xl px-4 py-2.5 text-sm bg-white/5"
              placeholder="Ask about spending, savings, budget..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" size="md">
              <Send size={16} />
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
