// src/components/Chatbox.tsx
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Send, Settings, ChevronDown, X, Search } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";

type Pastor = {
  id: number;
  slug: string; // e.g. "adeboye"
  name: string; // display name
  era?: string;
  avatar?: string;
};

type Msg = {
  id: number;
  text: string;
  isUser: boolean;
  pastorName?: string; // lock the bot bubble’s label at send time
};

type BackendResponse = { answer?: string };

// Fallback list if fetch fails
const FALLBACK_PASTORS: Pastor[] = [
  { id: 1, slug: "oyedepo",    name: "Bishop David Oyedepo",   era: "The Living Faith Church Worldwide", avatar: "/avatars/oyedepo.jpg" },
  { id: 2, slug: "adeboye",    name: "Pastor Enoch Adeboye",   era: "The Redeem Christian Church of God", avatar: "/avatars/adeboye.jpg" },
  { id: 3, slug: "adefarasin", name: "Pastor Paul Adefarasin", era: "The House on the Rock", avatar: "/avatars/adefarasin.jpg" },
  { id: 4, slug: "ibiyeomie",  name: "Pastor David Ibiyeomie", era: "Salvation Ministries", avatar: "/avatars/ibiyeomie.jpg" },
];

const PASTORS_URL = process.env.NEXT_PUBLIC_PASTORS_URL || "/tools/pastors.json";

// Normalize various shapes: {pastors:[...]} OR [...]
function normalizePastors(payload: unknown): Pastor[] {
  const maybeArray =
    Array.isArray(payload)
      ? payload
      : (typeof payload === "object" && payload !== null && Array.isArray((payload as { pastors?: unknown }).pastors))
      ? (payload as { pastors?: unknown }).pastors
      : [];

  return (maybeArray as unknown[])
    .map((raw, i) => {
      const p = (typeof raw === "object" && raw !== null) ? (raw as Record<string, unknown>) : {};
      return {
        id: Number.isFinite(p.id) ? (p.id as number) : i + 1,
        slug: String((p.slug ?? "") as string).toLowerCase(),
        name: String((p.name ?? "") as string),
        era: typeof p.era === "string" ? p.era : "",
        avatar: typeof p.avatar === "string" ? p.avatar : "/avatars/placeholder.jpg",
      } satisfies Pastor;
    })
    .filter((p) => p.slug && p.name);
}

// accent-insensitive, case-insensitive normalize
const normalize = (s: string) =>
  s?.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ?? "";

export default function Chatbot() {
  const [pastors, setPastors] = useState<Pastor[]>(FALLBACK_PASTORS);
  const [selectedPastor, setSelectedPastor] = useState<Pastor>(FALLBACK_PASTORS[0]);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      text: "Hello! I'm here to provide spiritual guidance and answer questions as if I were a pastor. How can I help you today?",
      isUser: false,
      pastorName: FALLBACK_PASTORS[0].name,
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [showPastorMenu, setShowPastorMenu] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingMessage, setTypingMessage] = useState<string>("");

  // live search state
  const [pastorQuery, setPastorQuery] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch pastors.json once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PASTORS_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        const list = normalizePastors(data);
        if (list.length) {
          setPastors(list);
          setSelectedPastor(list[0]);
          // update greeting label to match first fetched pastor
          setMessages((prev) => prev.map((m, i) => (i === 0 ? { ...m, pastorName: list[0].name } : m)));
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn("Using fallback pastors:", message);
      }
    })();
  }, []);

  // Derived filtered list for live search
  const filteredPastors = useMemo(() => {
    const q = normalize(pastorQuery);
    if (!q) return pastors;
    return pastors.filter(
      (p) => normalize(p.name).includes(q) || normalize(p.slug).includes(q) || normalize(p.era || "").includes(q)
    );
  }, [pastorQuery, pastors]);

  // When menu opens, reset search and focus
  useEffect(() => {
    if (showPastorMenu) {
      setPastorQuery("");
      setActiveIdx(0);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [showPastorMenu]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimer.current) clearInterval(thinkingTimer.current);
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  const fetchAnswerFromBackend = useCallback(async (question: string, pastorSlug: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const res = await fetch(`${apiUrl}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, pastor: pastorSlug }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        throw new Error(typeof err.error === "string" ? err.error : `HTTP ${res.status}`);
      }
      const data = (await res.json()) as BackendResponse;
      return data.answer ?? "Sorry, no response was returned.";
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Error fetching from backend:", message);
      return "Sorry, I couldn't fetch a response. Please try again.";
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || !selectedPastor?.slug) return;

    const current = selectedPastor; // snapshot
    const userMessage: Msg = { id: messages.length + 1, text: input.trim(), isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTypingMessage("");
    setIsTyping(true);

    // Thinking… animation
    let dotCount = 0;
    if (thinkingTimer.current) clearInterval(thinkingTimer.current);
    thinkingTimer.current = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setTypingMessage(`Thinking${".".repeat(dotCount)}`);
    }, 450);

    fetchAnswerFromBackend(userMessage.text, current.slug).then((fullResponse) => {
      if (thinkingTimer.current) clearInterval(thinkingTimer.current);
      setTypingMessage("");

      const words = fullResponse.split(" ");
      let idx = 0;
      setTypingMessage("");
      if (streamTimer.current) clearInterval(streamTimer.current);
      streamTimer.current = setInterval(() => {
        setTypingMessage((prev) => prev + (idx > 0 ? " " : "") + words[idx]);
        idx++;
        if (idx >= words.length) {
          if (streamTimer.current) clearInterval(streamTimer.current);
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: fullResponse, isUser: false, pastorName: current.name },
          ]);
          setIsTyping(false);
          setTypingMessage("");
        }
      }, 120);
    });
  }, [fetchAnswerFromBackend, input, messages.length, selectedPastor]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Analytics />

      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            What Would <span className="text-yellow-300">{selectedPastor?.name || "…"}</span> Say?
          </h1>
          <button className="p-2 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="bg-indigo-600 text-white p-3 relative">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowPastorMenu((s) => !s)}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showPastorMenu}
          >
            <Image
              src={selectedPastor?.avatar || "/avatars/placeholder.jpg"}
              alt={selectedPastor?.name || "Pastor"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
              priority
            />
            <div>
              <div className="font-medium flex items-center">
                {selectedPastor?.name || "Loading…"} <ChevronDown size={16} className="ml-1" />
              </div>
              <div className="text-xs text-indigo-200">{selectedPastor?.era || ""}</div>
            </div>
          </div>

          {showPastorMenu && (
            <div className="absolute top-full left-0 right-0 bg-white text-gray-800 shadow-lg z-10 mt-1 rounded-b-lg">
              <div className="container mx-auto py-2">
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <h3 className="font-medium">Select Pastor</h3>
                  <button
                    onClick={() => setShowPastorMenu(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Live search */}
                <div className="px-4 py-2 border-b">
                  <div className="flex items-center rounded-md border border-gray-300 focus-within:ring-1 focus-within:ring-indigo-500">
                    <Search size={16} className="mx-2 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      value={pastorQuery}
                      onChange={(e) => {
                        setPastorQuery(e.target.value);
                        setActiveIdx(0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveIdx((i) => Math.min(i + 1, Math.max(0, filteredPastors.length - 1)));
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveIdx((i) => Math.max(i - 1, 0));
                        }
                        if (e.key === "Enter") {
                          const p = filteredPastors[activeIdx];
                          if (p) {
                            setSelectedPastor(p);
                            setShowPastorMenu(false);
                          }
                        }
                        if (e.key === "Escape") setShowPastorMenu(false);
                      }}
                      placeholder="Search by name, era, or slug…"
                      className="w-full p-2 pr-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto" role="listbox" aria-label="Pastors">
                  {filteredPastors.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
                  )}
                  {filteredPastors.map((pastor, idx) => {
                    const isActive = idx === activeIdx;
                    const isSelected = selectedPastor?.id === pastor.id;
                    return (
                      <div
                        key={pastor.id}
                        className={`flex items-center space-x-3 px-4 py-3 cursor-pointer ${
                          isActive ? "bg-indigo-50" : "hover:bg-gray-100"
                        }`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          setSelectedPastor(pastor);
                          setShowPastorMenu(false);
                        }}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <Image
                          src={pastor.avatar || "/avatars/placeholder.jpg"}
                          alt={pastor.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{pastor.name}</div>
                          <div className="text-sm text-gray-500">{pastor.era}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-3/4 rounded-lg p-4 ${
                  message.isUser
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 shadow-sm rounded-bl-none"
                }`}
              >
                {!message.isUser && message.pastorName && (
                  <div className="font-medium text-indigo-700 mb-1">{selectedPastor.name}</div>
                )}
                <p className={message.isUser ? "text-white" : "text-gray-700"}>{message.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[75%] bg-white border border-gray-200 shadow-sm rounded-lg p-4 italic text-gray-500">
                <div className="font-medium text-indigo-700 mb-1">{selectedPastor?.name || "…"}</div>
                <p>{typingMessage}</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="fixed bottom-0 w-full border-t bg-white p-4 z-50">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end bg-white rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1 p-3 bg-transparent focus:outline-none resize-none max-h-32"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className={`p-3 rounded-r-lg ${input.trim() ? "text-indigo-600 hover:text-indigo-800" : "text-gray-400"}`}
              aria-label="Send"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Responses are AI-generated interpretations of sermons.
          </div>
        </div>
      </div>
    </div>
  );
}
