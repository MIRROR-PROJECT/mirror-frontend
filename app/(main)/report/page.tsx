"use client";

import { useState } from "react";
import { 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  Brain, 
  Clock, 
  ChevronRight, 
  TrendingUp 
} from "lucide-react";

// [Mock Data] 나중에 DB에서 가져올 데이터 형태 예시
const MOCK_REPORTS = [
  {
    id: 1,
    date: "2025.12.28",
    day: "일요일",
    title: "미적분학 - 도함수의 활용 집중 공략",
    studyTime: "3시간 20분",
    achievement: 85, // 달성률 (%)
    subjects: ["수학", "영어"],
    aiSummary: "미분 계수의 기하학적 의미를 묻는 질문이 많았어요. 전반적인 이해도는 높지만, 속도-가속도 응용 문제에서 약간의 실수가 있어 내일은 이 부분을 보완하면 좋겠습니다.",
  },
  {
    id: 2,
    date: "2025.12.27",
    day: "토요일",
    title: "물리1 역학 파트 & 영어 단어 암기",
    studyTime: "4시간 10분",
    achievement: 92,
    subjects: ["물리", "국어"],
    aiSummary: "역학적 에너지 보존 법칙에 대해 완벽하게 설명했어요! 👏 다만 영어 단어 테스트에서는 유의어 파트가 조금 약하니, 내일 아침 복습 때 챙겨주세요.",
  },
  {
    id: 3,
    date: "2025.12.26",
    day: "금요일",
    title: "CS 전공기초 복습 및 알고리즘",
    studyTime: "2시간 50분",
    achievement: 60,
    subjects: ["CS", "코딩"],
    aiSummary: "집중력이 다소 떨어진 날이었어요. AI 튜터와의 대화에서도 '피곤하다'는 언급이 많았네요. 내일은 무리하지 말고 30분 단위로 끊어서 학습해봅시다.",
  },
];

export default function ReportPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* 1. 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-blue-600" />
          학습 리포트
        </h1>
        <p className="text-gray-500 mt-2">
          나의 공부 진척도와 AI 튜터의 피드백을 모아보세요.
        </p>
      </div>

      {/* 2. 상단 요약 스탯 (Dashboard 느낌) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={Calendar} 
          label="총 학습 일수" 
          value="14일" 
          desc="이번 달 꾸준히 했어요!" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={Clock} 
          label="평균 학습 시간" 
          value="3h 20m" 
          desc="지난주보다 30분 늘었어요" 
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="평균 성취도" 
          value="82%" 
          desc="상위 15% 페이스예요" 
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* 3. 리포트 리스트 (타임라인 스타일) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">최근 리포트</h2>
        
        {MOCK_REPORTS.map((report) => (
          <div 
            key={report.id} 
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col md:flex-row gap-6"
          >
            {/* 왼쪽: 날짜 및 성취도 */}
            <div className="md:w-48 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
              <div>
                <span className="text-sm font-medium text-gray-400">{report.day}</span>
                <p className="text-xl font-bold text-gray-900">{report.date}</p>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>오늘의 성취도</span>
                  <span className="font-bold text-blue-600">{report.achievement}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      report.achievement >= 80 ? 'bg-blue-500' : 
                      report.achievement >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} 
                    style={{ width: `${report.achievement}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 내용 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {report.subjects.map((sub, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                        {sub}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.studyTime}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
              </div>

              {/* AI 피드백 영역 */}
              <div className="bg-gray-50 rounded-xl p-4 mt-2 flex gap-3">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm shadow-sm">
                    🤖
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> AI 튜터의 코멘트
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {report.aiSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// [Component] 상단 스탯 카드
function StatCard({ icon: Icon, label, value, desc, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}