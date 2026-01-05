"use client";

import { useState, useRef, useEffect } from "react";
import { useStudy } from "../../context/StudyContext";
import { supabase } from "@/app/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  Send,
  Bot,
  MoreVertical,
  Image as ImageIcon,
  Sparkles,
  User,
  AlertCircle
} from "lucide-react";

// --- API 타입 정의 ---
// Request Body
interface ChatRequest {
  message: string;
  problem_log_id: string | null;
}

// Student Sentiment
interface StudentSentiment {
  understanding_level: string;
  emotional_state: string;
  engagement_level: string;
  confusion_points: string[];
  question_type: string;
  learning_signal: string;
  needs_intervention: boolean;
  confidence_score: number;
}

// Response Data
interface ChatResponseData {
  user_message_id: string;
  assistant_message_id: string;
  user_message: string;
  assistant_message: string;
  student_sentiment: StudentSentiment;
  created_at: string;
}

// Response Body
interface ChatResponse {
  success: boolean;
  code: number;
  message: string;
  data: ChatResponseData | null;
}

// --- UI 메시지 타입 정의 ---
type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  isTyping?: boolean;
};

export default function ChatPage() {
  const { userInfo } = useStudy();
  const { t, language } = useLanguage();
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // 스크롤 제어를 위한 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 대화
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "ai",
      text: t('chat.welcome', { name: userInfo.name || t('common.student') }),
      timestamp: language === 'ko' ? '오전 10:00' : '10:00 AM',
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
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageText = input;

    // 1. 유저 메시지 추가 (임시 ID 사용)
    const tempUserMsgId = `temp-user-${Date.now()}`;
    const newUserMsg: Message = {
      id: tempUserMsgId,
      role: "user",
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsAiTyping(true);

    try {
      // 2. 인증 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }

      // 3. API 호출
      console.log("📡 [Chat API] 요청 전송:", { message: userMessageText });

      const response = await fetch("https://mirror-backend-5j11.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userMessageText,
          problem_log_id: null  // 현재는 특정 문제 컨텍스트 없음
        } as ChatRequest)
      });

      console.log(`📥 [Chat API] 응답 상태: ${response.status}`);

      const json: ChatResponse = await response.json();
      console.log("📦 [Chat API] 응답 데이터:", json);

      // 4. 에러 처리
      if (!response.ok || !json.success) {
        throw new Error(json.message || "채팅 요청에 실패했습니다.");
      }

      // 5. 성공 응답 처리
      if (json.data) {
        const aiMsg: Message = {
          id: json.data.assistant_message_id,
          role: "ai",
          text: json.data.assistant_message,
          timestamp: new Date(json.data.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // 학생 감정 분석 데이터 로깅 (필요시 UI에 표시 가능)
        console.log("🧠 [Student Sentiment]:", json.data.student_sentiment);

        // 교사 개입 필요 시 경고 (선택사항)
        if (json.data.student_sentiment.needs_intervention) {
          console.warn("⚠️ [Alert] 교사 개입이 필요한 상태입니다.");
        }
      }

    } catch (error) {
      console.error("❌ [Chat API] 에러 발생:", error);

      // 에러 메시지 표시
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "ai",
        text: `죄송합니다. 오류가 발생했습니다.\n${error instanceof Error ? error.message : "네트워크 오류가 발생했습니다."}`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
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
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base md:text-lg">Mirror AI {t('chat.title')}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 font-medium">{t('chat.available')}</span>
              {language === 'en' && (
                <span className="ml-2 text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                  Korean only
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* 2. 메시지 영역 (flex-1로 남은 공간 차지 + overflow-y-auto로 스크롤) */}
      <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

        {/* 날짜 구분선 예시 */}
        <div className="flex justify-center my-4">
          <span className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">{t('chat.today')}</span>
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

              <div className={`max-w-[85%] md:max-w-[60%] space-y-1 ${isAi ? "items-start" : "items-end flex flex-col"}`}>
                {/* 말풍선 */}
                <div
                  className={`px-3 md:px-5 py-2.5 md:py-3 rounded-2xl text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${isAi
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
      <footer className="bg-white border-t border-gray-200 p-3 md:p-4 pb-safe shrink-0 z-10">
        <div className="max-w-4xl mx-auto space-y-3">

          {/* 추천 질문 칩 (가로 스크롤) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full shrink-0 border border-blue-100">
              <Sparkles className="w-3 h-3" /> {t('chat.suggestions')}
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
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-gray-800 placeholder-gray-400 text-sm"
              autoComplete="off"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isAiTyping}
              className={`p-2 rounded-xl transition-all ${input.trim()
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
              {t('chat.disclaimer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}