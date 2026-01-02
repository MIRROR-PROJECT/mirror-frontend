"use client";

import Link from "next/link";
import {
    Map, ListTodo, FileText, BrainCircuit,
    AlertCircle, Hash, Info
} from "lucide-react";

// --- [타입 정의] ---
// --- [타입 정의] ---
interface Task {
    task_id: string;
    sequence: number;
    category: string;
    title: string;
    assigned_minutes: number;
    time_slot: string;
    difficulty_level: string;
    problem_count: number;
    learning_objective: string;
    instruction: string;
    rest_after: number;
    is_completed: boolean;
}

interface DailyPlan {
    date: string;
    day_of_week: string;
    total_available_minutes: number;
    total_planned_minutes: number;
    daily_focus: string;
    tasks: Task[];
    daily_summary: string;
    energy_distribution: string;
}

interface WeeklySummary {
    expected_improvement: string;
    adaptive_notes: string;
    weekly_goals: string[];
}

interface WeeklyPlanResponse {
    plan_id: string;
    student_id: string;
    start_date: string;
    end_date: string;
    total_study_minutes: number;
    subject_distribution: Record<string, number>;
    focus_areas: string[];
    weekly_plan: DailyPlan[];
    weekly_summary: WeeklySummary;
    created_at: string;
}

type PlanItem = {
    day: string;
    isToday: boolean;
    type: "Concept" | "Review";
    subject: string;
    topic: string;
    time: number;
    // 추가된 필드 (API 연동)
    dailyFocus?: string;
    tasks?: Task[];
    date?: string;
    dailySummary?: string;
};

interface AnalysisResult {
    content: string;
    tags: string[];
}

interface UserTypeInfo {
    label: string;
    desc: string;
    fullDesc: string;
}

interface DiagnosisResultProps {
    userName: string;
    grade: string;
    semester: string;
    userType: "A" | "B" | "C";
    userTypeInfo: Record<"A" | "B" | "C", UserTypeInfo>;
    analysisText: string;
    weeklyPlan: PlanItem[];
    weeklyAvailableTime: Record<string, number>;
    ocrAnalysis: Record<string, AnalysisResult>;
    showTooltip: boolean;
    onTooltipShow: () => void;
    onTooltipHide: () => void;
    aiWeeklyData?: WeeklyPlanResponse | null;
}

import { useState, useEffect } from "react";

export default function DiagnosisResult({
    userName,
    grade,
    semester,
    userType,
    userTypeInfo,
    analysisText,
    weeklyPlan,
    weeklyAvailableTime,
    ocrAnalysis,
    showTooltip,
    onTooltipShow,
    onTooltipHide,
    aiWeeklyData,
}: DiagnosisResultProps) {
    // 선택된 요일 인덱스 상태 (기본값: 오늘 또는 첫 번째)
    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

    // weeklyPlan이 로드되면 오늘 날짜를 찾아 선택
    useEffect(() => {
        if (weeklyPlan.length > 0) {
            const todayIdx = weeklyPlan.findIndex(p => p.isToday);
            console.log("📊 [DiagnosisResult] Weekly Plan Loaded:", weeklyPlan);
            console.log("📊 [DiagnosisResult] Finding Today... Index:", todayIdx);

            if (todayIdx !== -1) {
                console.log("✅ [DiagnosisResult] Auto-selecting index:", todayIdx);
                setSelectedDayIndex(todayIdx);
            } else {
                console.warn("⚠️ [DiagnosisResult] Today not found in plan. Defaulting to 0.");
            }
        }
    }, [weeklyPlan]);

    const selectedPlan = weeklyPlan[selectedDayIndex] || weeklyPlan[0];

    return (
        <div className="max-w-6xl w-full space-y-6 animate-scale-in pb-10">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                    {userName}님의 고{grade} {semester}학기 <span className="text-blue-600">Mirror</span> 솔루션
                </h2>
                <div className="relative inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-blue-700">{analysisText}</span>
                    <button
                        onClick={showTooltip ? onTooltipHide : onTooltipShow}
                        className="relative hover:scale-110 transition-transform"
                    >
                        <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                    </button>
                    {showTooltip && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 w-96 bg-gray-900 text-white rounded-xl p-4 shadow-2xl animate-slide-down">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                            <div className="font-bold text-blue-300 text-base mb-2 whitespace-nowrap">{userTypeInfo[userType].label}</div>
                            <div className="text-gray-200 text-sm leading-relaxed break-keep">{userTypeInfo[userType].fullDesc}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-7 flex flex-col gap-6">
                    {/* 1. 주간 커리큘럼 */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Map className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                    이번 주 맞춤 커리큘럼
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">AI Generated</span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="bg-gray-50 rounded-2xl p-4 h-full overflow-y-auto custom-scrollbar">
                                {weeklyPlan.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10">설정된 공부 시간이 없습니다.</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-3">
                                            {weeklyPlan.map((plan, idx) => {
                                                const isSelected = idx === selectedDayIndex;
                                                return (
                                                    <div
                                                        key={`${plan.day}-${idx}`}
                                                        onClick={() => setSelectedDayIndex(idx)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border-2
                                                            ${isSelected
                                                                ? 'bg-blue-50 border-blue-500 shadow-md scale-102 ring-2 ring-blue-100'
                                                                : plan.isToday
                                                                    ? 'bg-white border-blue-200 shadow-sm'
                                                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <div className={`w-12 py-2 rounded-lg text-center font-bold text-sm ${plan.isToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                            {plan.day}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`text-xs font-bold px-1.5 rounded ${plan.type === 'Concept' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                                                    {plan.type === 'Concept' ? "진도" : "복습"}
                                                                </span>
                                                                {plan.isToday && <span className="text-[10px] font-bold text-red-500 animate-pulse">● Today</span>}
                                                            </div>
                                                            <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                                {/* Daily Focus가 있으면 그것을, 없으면 기존 topic 표시 */}
                                                                {plan.dailyFocus || `${plan.subject}: ${plan.topic}`}
                                                            </p>
                                                            {plan.tasks && plan.tasks.length > 0 && (
                                                                <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                                                                    {plan.tasks.map(t => t.title).join(", ")}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right min-w-15">
                                                            <span className="text-xs font-bold text-gray-400 block">목표</span>
                                                            <span className={`text-sm font-bold ${plan.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                                                {plan.time}분
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 flex flex-col gap-6">
                    {/* 2. 오늘의 미션 */}
                    <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-200 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex items-center gap-2 mb-6 relative z-10">
                            <div className="bg-white/20 p-2 rounded-lg"><ListTodo className="w-5 h-5 text-white" /></div>
                            <h3 className="font-bold text-lg">
                                {/* 선택된 날짜의 미션 표시 (날짜 제거, 요일만 표시) */}
                                {selectedPlan.isToday ? "오늘의 미션 (Today)" : `데일리 미션 (${selectedPlan.day})`}
                            </h3>
                        </div>

                        {weeklyPlan.length > 0 && (() => {
                            // 선택된 날짜의 데이터 사용
                            const targetPlan = selectedPlan;

                            // 요일별 가용시간 찾기 key 매핑 필요 (MON -> MONDAY)
                            const fullDayNames: Record<string, string> = { "Mon": "MONDAY", "Tue": "TUESDAY", "Wed": "WEDNESDAY", "Thu": "THURSDAY", "Fri": "FRIDAY", "Sat": "SATURDAY", "Sun": "SUNDAY" };
                            const targetDayFull = fullDayNames[targetPlan.day] || targetPlan.day.toUpperCase();
                            const availableMinutes = weeklyAvailableTime[targetDayFull] || targetPlan.time;

                            return (
                                <div className="space-y-4 relative z-10">
                                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                                        <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-4">
                                            <span className="text-blue-100 text-sm font-medium">{targetPlan.isToday ? "오늘의 가용 시간" : "학습 가용 시간"}</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold">{availableMinutes}분</span>
                                                <span className="text-xs text-blue-200 block">권장 학습 시간</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-4">
                                            {(() => {
                                                if (targetPlan.tasks && targetPlan.tasks.length > 0) {
                                                    return targetPlan.tasks.map((task, idx) => (
                                                        <li key={idx} className={`flex gap-4 ${idx < targetPlan.tasks!.length - 1 ? 'pb-4 border-l-2 border-blue-400/30' : ''} pl-4 relative`}>
                                                            <div className={`absolute -left-2.25 top-0 w-4 h-4 rounded-full border-4 ${task.is_completed ? 'bg-green-400 border-green-600' : 'bg-white border-blue-600'}`}></div>
                                                            <div>
                                                                <span className="text-xs font-bold text-blue-200 block mb-1">
                                                                    {task.time_slot} | {task.category} ({task.assigned_minutes}분)
                                                                </span>
                                                                <p className="font-bold text-lg">{task.title}</p>
                                                                <p className="text-xs text-blue-100 mt-1 opacity-80">{task.learning_objective}</p>
                                                            </div>
                                                        </li>
                                                    ));
                                                }

                                                // Fallback
                                                return (
                                                    <li className="text-center text-blue-200 py-4">
                                                        세부 계획이 없습니다.
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                    <div className="mt-auto">
                                        <Link href="/dashboard" className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-center block hover:bg-blue-50 transition-colors">
                                            {targetPlan.subject} 학습 시작하기
                                        </Link>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 3. [최종] AI 풀이 습관 분석 리포트 */}
                    {Object.keys(ocrAnalysis).length > 0 && (
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-purple-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <BrainCircuit className="w-24 h-24 text-purple-600" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    AI 풀이 습관 분석
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(ocrAnalysis).map(([subject, result]) => (
                                        <div key={subject} className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                                            <h4 className="font-bold text-purple-700 text-sm mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> {subject}
                                            </h4>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium mb-3">
                                                {result.content}
                                            </p>
                                            {/* 태그 (Detected Tags) 표시 */}
                                            {result.tags && result.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.tags.map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-600 shadow-sm">
                                                            <Hash className="w-2.5 h-2.5 opacity-50" /> {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
