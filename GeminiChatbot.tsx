import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  HelpCircle,
  Shirt,
  Ruler,
  TrendingUp,
  ChevronDown,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  theme: "dark" | "light";
  brandName?: string;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  {
    icon: Shirt,
    label: "Style Recommendations",
    prompt: "What colors and outfits pair best with an oversized heavy black tee?",
  },
  {
    icon: Ruler,
    label: "Fit & Sizing Help",
    prompt: "I'm 5'10\" and 72kg. Should I get M or L for a relaxed drop-shoulder look?",
  },
  {
    icon: HelpCircle,
    label: "Fabric & Garment Care",
    prompt: "How should I wash a 240+ GSM combed cotton t-shirt so it doesn't shrink?",
  },
  {
    icon: TrendingUp,
    label: "Reseller Profit Margins",
    prompt: "What retail price and markup margin works best for premium heavyweight blank tees?",
  },
];

export default function GeminiChatbot({
  theme,
  brandName = "THREAD DEN",
  isOpenExternal,
  onCloseExternal,
}: GeminiChatbotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"stylist" | "sizing" | "reseller">("stylist");
  const [selectedModel, setSelectedModel] = useState<"gemini-3.8-flash" | "gemini-3.1-flash-lite">("gemini-3.8-flash");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync external open state if provided
  useEffect(() => {
    if (typeof isOpenExternal === "boolean") {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) {
      onCloseExternal();
    }
  };

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("thread_den_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: "msg_welcome",
        role: "model",
        text: `Hey! I'm **DEN AI**, your personal Streetwear Stylist and Sizing Consultant for **${brandName}**.\n\nWhether you need drop-shoulder sizing advice, outfit matching for heavyweight blanks, garment care, or reseller profit calculations—I've got you covered. What are you looking to style today?`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("thread_den_chat_history", JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMessage("");
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send conversation history to the server endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          model: selectedModel,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const botReply: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: "model",
        text: data.reply || "I'm here to assist with your streetwear questions!",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMessage(err.message || "Failed to connect to DEN AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear this conversation history?")) {
      const resetMessages: ChatMessage[] = [
        {
          id: `msg_${Date.now()}`,
          role: "model",
          text: `Chat cleared! How can I help you with **${brandName}** cuts, styling, or sizing?`,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ];
      setMessages(resetMessages);
      localStorage.removeItem("thread_den_chat_history");
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isDark = theme === "dark";

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-40 px-4 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all border font-bold text-xs cursor-pointer ${
              isDark
                ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 shadow-emerald-500/25"
                : "bg-zinc-950 hover:bg-zinc-800 text-white border-zinc-800 shadow-zinc-950/25"
            }`}
            id="open-gemini-chat-btn"
            title="Chat with DEN AI Stylist"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
              <span className="w-2 h-2 rounded-full bg-emerald-300 absolute -top-1 -right-1 animate-ping" />
            </div>
            <span className="font-display font-extrabold tracking-wide">Ask DEN AI</span>
            <span className="hidden sm:inline-block text-[10px] opacity-80 font-mono px-1.5 py-0.5 rounded bg-black/20 font-normal">
              Stylist
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-Up / Floating Chatbot Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[85vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-xl ${
              isDark
                ? "bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/60"
                : "bg-white/95 border-zinc-200 text-zinc-900 shadow-xl"
            }`}
            id="gemini-chatbot-window"
          >
            {/* Top Header Bar */}
            <div
              className={`p-4 border-b flex items-center justify-between gap-3 ${
                isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50/90 border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
                      isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900 absolute -bottom-0.5 -right-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-black text-sm tracking-tight">DEN AI</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-400 text-zinc-950">
                      Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono -mt-0.5">
                    Streetwear Fit & Style Consultant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear history button */}
                <button
                  type="button"
                  onClick={handleClearChat}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
                  }`}
                  title="Clear conversation"
                  id="clear-chat-history-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
                  }`}
                  title="Close chat"
                  id="close-chat-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Persona Role Switcher & Model Pill */}
            <div
              className={`px-3 py-2 border-b flex items-center justify-between gap-2 text-[10px] font-mono ${
                isDark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-zinc-100/60 border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole("stylist")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedRole === "stylist"
                      ? isDark
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "bg-white text-zinc-950 shadow-xs border border-zinc-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  👟 Stylist
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("sizing")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedRole === "sizing"
                      ? isDark
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "bg-white text-zinc-950 shadow-xs border border-zinc-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  📏 Fit & Sizing
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("reseller")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedRole === "reseller"
                      ? isDark
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "bg-white text-zinc-950 shadow-xs border border-zinc-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  💼 Reseller Margins
                </button>
              </div>

              {/* Model Speed Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSelectedModel(
                    selectedModel === "gemini-3.8-flash" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash"
                  )
                }
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                  selectedModel === "gemini-3.1-flash-lite"
                    ? "bg-amber-400 text-zinc-950"
                    : isDark
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-zinc-200 text-zinc-700"
                }`}
                title="Toggle Gemini Model (Flash vs Flash-Lite)"
              >
                <Zap className="w-2.5 h-2.5" />
                <span>{selectedModel === "gemini-3.1-flash-lite" ? "Lite" : "Flash"}</span>
              </button>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[82%] p-3.5 rounded-2xl leading-relaxed group transition-all ${
                        isUser
                          ? isDark
                            ? "bg-emerald-600 text-white rounded-br-xs"
                            : "bg-zinc-950 text-white rounded-br-xs shadow-sm"
                          : isDark
                          ? "bg-zinc-800/80 border border-zinc-750 text-zinc-200 rounded-bl-xs"
                          : "bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-bl-xs"
                      }`}
                    >
                      {/* Message Content with basic Markdown handling */}
                      <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                        {msg.text.split("\n\n").map((paragraph, pIdx) => (
                          <p key={pIdx}>
                            {paragraph.split("**").map((chunk, cIdx) =>
                              cIdx % 2 === 1 ? (
                                <strong key={cIdx} className="font-bold text-amber-300 dark:text-amber-200">
                                  {chunk}
                                </strong>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        ))}
                      </div>

                      {/* Message Meta: Time & Copy */}
                      <div className="mt-2 flex items-center justify-between text-[10px] opacity-60 font-mono">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:opacity-100 cursor-pointer"
                            title="Copy message"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-center">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div
                    className={`p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5 border ${
                      isDark ? "bg-zinc-800/80 border-zinc-750" : "bg-zinc-100 border-zinc-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="text-[10px] font-mono text-zinc-400 ml-1.5">DEN AI thinking...</span>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Chat Error</p>
                    <p className="text-[11px] opacity-80">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips (when user is at the start or idle) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                {DEFAULT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark
                        ? "bg-zinc-800/60 hover:bg-zinc-800 border-zinc-750 text-zinc-300"
                        : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <item.icon className="w-3 h-3 text-emerald-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-3 border-t flex items-center gap-2 ${
                isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                disabled={isLoading}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about streetwear cuts, size advice, GSM, pairings..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                    : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                }`}
                id="gemini-chat-input"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                    : "bg-zinc-950 hover:bg-zinc-800 text-white"
                }`}
                id="send-gemini-chat-btn"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
