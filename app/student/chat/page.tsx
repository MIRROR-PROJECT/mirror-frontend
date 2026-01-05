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
    // 모바일 최적화: 화면에 딱 맞게
    <div className="flex flex-col h-[100dvh] bg-gray-50 w-full max-w-full overflow-hidden">

      {/* 1. 채팅방 헤더 - 모바일 최적화 */}
      <header className="bg-white border-b border-gray-200 px-3 py-2.5 flex justify-between items-center shrink-0 z-10 shadow-sm w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-gray-900 text-sm truncate">Mirror AI {t('chat.title')}</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-medium">{t('chat.available')}</span>
              {language === 'en' && (
                <span className="ml-1 text-[9px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full border border-yellow-200">
                  Korean only
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메시지 영역 - 카카오톡 스타일 */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3 w-full">

        {/* 날짜 구분선 */}
        <div className="flex justify-center my-2">
          <span className="bg-gray-200 text-gray-500 text-[10px] px-2.5 py-1 rounded-full">{t('chat.today')}</span>
        </div>

        {messages.map((msg) => {
          const isAi = msg.role === "ai";
          return (
            <div
              key={msg.id}
              className={`flex gap-2 items-start w-full ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}

              <div className={`flex flex-col ${isAi ? "items-start" : "items-end"}`} style={{ maxWidth: 'calc(100% - 40px)' }}>
                {/* 말풍선 */}
                <div
                  className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isAi
                    ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    : "bg-blue-600 text-white rounded-tr-none"
                    }`}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    width: 'fit-content'
                  }}
                >
                  {msg.text}
                </div>
                {/* 시간 표시 */}
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* AI 타이핑 중 */}
        {isAiTyping && (
          <div className="flex gap-2 items-start justify-start">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 3. 하단 입력 영역 - 모바일 최적화 */}
      <footer className="bg-white border-t border-gray-200 px-3 py-2 pb-20 md:pb-3 shrink-0 z-10 w-full">
        <div className="w-full space-y-2">

          {/* 추천 질문 칩 - 가로 스크롤 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full shrink-0 border border-blue-100">
              <Sparkles className="w-2.5 h-2.5" /> {t('chat.suggestions')}
            </div>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt.replace(/^[📸📅🧪😫] /, ""))}
                className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] rounded-full hover:bg-gray-100 transition-colors border border-gray-200 whitespace-nowrap shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* 입력창 */}
          <div className="relative flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-inner">
            <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-200 rounded-lg transition-colors shrink-0">
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-transparent border-none focus:ring-0 py-1.5 text-gray-800 placeholder-gray-400 text-sm min-w-0"
              autoComplete="off"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isAiTyping}
              className={`p-2 rounded-lg transition-all shrink-0 ${input.trim()
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-[9px] text-gray-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              {t('chat.disclaimer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}