import { useState, useRef, useEffect } from 'react';
import { Send, Settings, ChevronDown, X } from 'lucide-react';

const pastors = [
  { id: 1, name: "Bishop David Oyedepo", era: "The Living Faith Church Worldwide", avatar: "/avatars/oyedepo.jpg" },
  { id: 2, name: "Pastor Enoch Adeboye", era: "The Redeem Christian Church of God", avatar: "/avatars/adeboye.jpg" },
  { id: 3, name: "Pastor Paul Adefarasin", era: "The House on the Rock", avatar: "/avatars/adefarasin.jpg" },
  { id: 4, name: "Pastor David Ibiyeomie", era: "Salvation Ministries", avatar: "/avatars/ibiyeomie.jpg" },
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm here to provide spiritual guidance and answer questions as if I were a pastor. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [selectedPastor, setSelectedPastor] = useState(pastors[0]);
  const [showPastorMenu, setShowPastorMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  const fetchAnswerFromBackend = async (question: string, pastor: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, pastor })
      });
      const data = await res.json();
      return data.answer;
    } catch (err) {
      console.error('Error fetching from backend:', err);
      return "Sorry, I couldn't fetch a response. Please try again.";
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTypingMessage("");
    setIsTyping(true);

    // Show waiting message first
    let dotCount = 0;
    const waitingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      setTypingMessage(`Thinking${dots}`);
    }, 500);

    fetchAnswerFromBackend(input, selectedPastor.name).then((fullResponse) => {
      clearInterval(waitingInterval);
      setTypingMessage("");

      const safeResponse = fullResponse || "Sorry, no response was returned.";
      const words = safeResponse.split(" ");
      let index = 0;

      const interval = setInterval(() => {
        setTypingMessage((prev) => prev + (index > 0 ? " " : "") + words[index]);
        index++;
        if (index === words.length) {
          clearInterval(interval);
          setMessages(prev => [...prev, { id: prev.length + 1, text: fullResponse, isUser: false }]);
          setIsTyping(false);
          setTypingMessage("");
        }
      }, 150);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">What Would <span className="text-yellow-300">{selectedPastor.name}</span> Say?</h1>
          <button className="p-2 rounded-full hover:bg-indigo-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="bg-indigo-600 text-white p-3 relative">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowPastorMenu(!showPastorMenu)}
          >
            <img
              src={selectedPastor.avatar}
              alt={selectedPastor.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <div className="font-medium flex items-center">
                {selectedPastor.name} <ChevronDown size={16} className="ml-1" />
              </div>
              <div className="text-xs text-indigo-200">{selectedPastor.era}</div>
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
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {pastors.map(pastor => (
                    <div
                      key={pastor.id}
                      className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                        selectedPastor.id === pastor.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedPastor(pastor);
                        setShowPastorMenu(false);
                      }}
                    >
                      <img
                        src={pastor.avatar}
                        alt={pastor.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{pastor.name}</div>
                        <div className="text-sm text-gray-500">{pastor.era}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 rounded-lg p-4 ${
                  message.isUser
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
                }`}
              >
                {!message.isUser && (
                  <div className="font-medium text-indigo-700 mb-1">{selectedPastor.name}</div>
                )}
                <p className={message.isUser ? 'text-white' : 'text-gray-700'}>
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-3/4 bg-white border border-gray-200 shadow-sm rounded-lg p-4 italic text-gray-500">
                <div className="font-medium text-indigo-700 mb-1">{selectedPastor.name}</div>
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Pastor anything..."
              className="flex-1 p-3 bg-transparent focus:outline-none resize-none max-h-32"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className={`p-3 rounded-r-lg ${
                input.trim()
                  ? 'text-indigo-600 hover:text-indigo-800'
                  : 'text-gray-400'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Responses are AI-generated interpretations and not authentic spiritual guidance.
          </div>
        </div>
      </div>
    </div>
  );
}
