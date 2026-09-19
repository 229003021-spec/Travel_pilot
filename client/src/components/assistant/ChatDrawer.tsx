import React, { useState, useRef, useEffect } from "react";
import { useTripStore } from "../../store/useTripStore";
import { MessageSquare, X, Send, Bot, User, RefreshCw, Cpu, Sparkles } from "lucide-react";

export const ChatDrawer: React.FC = () => {
  const { isAssistantOpen, toggleAssistant, chatMessages, sendChatMessage, undoLastAction } = useTripStore();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!isAssistantOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const query = inputText.trim();
    setInputText("");
    setIsSending(true);

    await sendChatMessage(query);
    setIsSending(false);
  };

  const quickPrompts = [
    "Remove shopping from Day 2",
    "How much budget is left?",
    "What if it rains tomorrow?",
    "I don't want too much walking",
    "Make this trip cheaper",
    "Why did you choose this restaurant?",
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              AI Trip Assistant
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                <Cpu className="w-3 h-3" /> Offline Engine
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Mutates trip state via validated actions</div>
          </div>
        </div>

        <button
          onClick={toggleAssistant}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${isUser ? "bg-blue-600 text-white" : "bg-indigo-950 text-indigo-300 border border-indigo-800"}`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
                <div className={`p-3.5 rounded-2xl text-xs ${isUser ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none shadow"}`}>
                  {msg.text}
                </div>

                {/* State Mutation Diff Card */}
                {msg.changes && msg.changes.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                    <div className="font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Trip State Updated</span>
                      <button
                        onClick={undoLastAction}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                      >
                        <RefreshCw className="w-3 h-3" /> Undo
                      </button>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {msg.changes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80">
        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Quick State Commands
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask or command state change..."
          disabled={isSending}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
