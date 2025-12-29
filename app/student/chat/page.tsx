"use client";

import { useState, useRef, useEffect } from "react";
import { useStudy } from "../../context/StudyContext"; // 경로 맞춰주세요 (../context/StudyContext 등)
import { 
  Send, 
  Bot, 
  MoreVertical, 
  Image as ImageIcon,
  Sparkles,
  User,
  AlertCircle
} from "lucide-react";

// 메시지 타입 정의
type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  isTyping?: boolean;
};

export default function ChatPage() {
  const { user } = useStudy();
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // 스크롤 제어를 위한 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // [Mock Data] 초기 대화
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: `안녕하세요, ${user.name}님! Mirror AI 튜터입니다. 🤖\n\n오늘 공부하시면서 막히는 부분이 있으셨나요? 문제 사진을 올려주시거나 개념을 물어봐 주세요!`,
      timestamp: "오전 10:00",
    },
  ]);

  // 추천 질문 칩
  const SUGGESTED_PROMPTS = [
    "📸 이 문제 풀이 과정 알려줘",
    "📅 오늘 내 학습 스케줄 브리핑해줘",
    "🧪 '엔트로피' 개념 쉽게 설명해줘",
    "😫 집중이 안 돼, 동기부여 해줘"
  ];

  // 새 메시지가 오면 맨 아래로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  // 메시지 전송 핸들러
  const handleSend = () => {
    if (!input.trim()) return;

    // 1. 유저 메시지 추가
    const newUserMsg: Message = {
      id: Date.now(),
      role: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsAiTyping(true);

    // 2. AI 응답 시뮬레이션 (1.5초 딜레이)
    setTimeout(() => {
      const newAiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: "질문 확인했습니다! \n(아직 데모 버전이라 실제 답변은 연동되지 않았지만, 곧 똑똑한 답변을 드릴 수 있도록 준비 중이에요! 🚀)",
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newAiMsg]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // [중요] h-screen을 주어 사이드바 옆에서 화면 높이를 꽉 채움 (스크롤은 내부에서 발생)
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* 1. 채팅방 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Mirror AI 튜터</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 font-medium">언제든 질문 가능</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* 2. 메시지 영역 (flex-1로 남은 공간 차지 + overflow-y-auto로 스크롤) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        
        {/* 날짜 구분선 예시 */}
        <div className="flex justify-center my-4">
          <span className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">오늘</span>
        </div>

        {messages.map((msg) => {
          const isAi = msg.role === "ai";
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}
              
              <div className={`max-w-[80%] md:max-w-[60%] space-y-1 ${isAi ? "items-start" : "items-end flex flex-col"}`}>
                {/* 말풍선 */}
                <div 
                  className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isAi 
                      ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none" 
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
                {/* 시간 표시 */}
                <span className="text-[10px] text-gray-400 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* AI 타이핑 애니메이션 */}
        {isAiTyping && (
          <div className="flex gap-3 justify-start animate-fade-in">
             <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
               <Bot className="w-5 h-5 text-blue-600" />
             </div>
             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-0"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        
        {/* 스크롤 하단 앵커 */}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. 하단 입력 영역 (Footer) */}
      <footer className="bg-white border-t border-gray-200 p-4 shrink-0 z-10">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* 추천 질문 칩 (가로 스크롤) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full shrink-0 border border-blue-100">
                <Sparkles className="w-3 h-3" /> 추천 질문
             </div>
             {SUGGESTED_PROMPTS.map((prompt, idx) => (
               <button 
                 key={idx}
                 onClick={() => setInput(prompt.replace(/^[📸📅🧪😫] /, ""))}
                 className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap border border-gray-200"
               >
                 {prompt}
               </button>
             ))}
          </div>

          {/* 입력창 */}
          <div className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-inner">
            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-200 rounded-xl transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 내용을 입력하세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-gray-800 placeholder-gray-400 text-sm"
              autoComplete="off"
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isAiTyping}
              className={`p-2 rounded-xl transition-all ${
                input.trim() 
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center">
             <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
               <AlertCircle className="w-3 h-3" />
               AI는 실수할 수 있습니다. 중요한 정보는 확인이 필요합니다.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}