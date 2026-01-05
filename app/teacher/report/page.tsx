"use client";

import { useState, useMemo } from "react";
import { BarChart2, Users, Calendar, Filter } from "lucide-react";
import StudentReportCard from "@/app/components/report/StudentReportCard";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { generateMockReports } from "@/app/lib/mockReportData";
import { useLanguage } from "@/app/context/LanguageContext";

// Mock 반 데이터
const MOCK_CLASSES = [
    { id: "class-1", name: "1반" },
    { id: "class-2", name: "2반" },
    { id: "class-3", name: "3반" },
];

// Mock 학생 이름
const STUDENT_NAMES = [
    "김민준", "이서연", "박지호", "최유나", "정도윤",
    "강서준", "조은서", "윤시우", "장하은", "임준서",
    "한예진", "오지훈", "신수아", "권민재", "송다은"
];

export default function TeacherReportPage() {
    const { t, language } = useLanguage();
    const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0].id);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [sortBy, setSortBy] = useState<"name" | "achievement" | "time">("achievement");

    // 선택된 반 정보
    const currentClass = MOCK_CLASSES.find(c => c.id === selectedClass);

    // Mock 학생별 리포트 생성
    const studentReports = useMemo(() => {
        return STUDENT_NAMES.map((name, idx) => {
            const reports = generateMockReports(1, language as 'ko' | 'en');
            return {
                ...reports[0],
                id: `student-${idx}`,
                user_id: `student-${idx}`,
                user_name: name,
            };
        });
    }, [selectedClass, selectedDate, language]);

    // 정렬 적용
    const sortedReports = useMemo(() => {
        const sorted = [...studentReports];
        if (sortBy === "achievement") {
            sorted.sort((a, b) => a.achievement_rate - b.achievement_rate); // 낮은 순
        } else if (sortBy === "time") {
            sorted.sort((a, b) => a.total_study_time_minutes - b.total_study_time_minutes); // 적은 순
        } else {
            sorted.sort((a, b) => a.user_name.localeCompare(b.user_name)); // 이름순
        }
        return sorted;
    }, [studentReports, sortBy]);

    // 통계 계산
    const classStats = useMemo(() => {
        const totalStudents = studentReports.length;
        const avgAchievement = Math.round(
            studentReports.reduce((sum, r) => sum + r.achievement_rate, 0) / totalStudents
        );
        const avgTime = Math.round(
            studentReports.reduce((sum, r) => sum + r.total_study_time_minutes, 0) / totalStudents
        );
        const lowAchievers = studentReports.filter(r => r.achievement_rate < 60).length;

        return { totalStudents, avgAchievement, avgTime, lowAchievers };
    }, [studentReports]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">

            {/* 1. 페이지 헤더 + 반/날짜 선택 */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="w-7 h-7 text-blue-600" />
                        반 학습 리포트
                    </h1>
                    <p className="text-gray-500 mt-2">
                        학생들의 학습 현황을 한눈에 확인하세요.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 반 선택 */}
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                        >
                            {MOCK_CLASSES.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 날짜 선택 */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* 2. 반 요약 통계 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{currentClass?.name} 요약</h2>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">전체 학생</p>
                        <p className="text-2xl font-bold text-gray-900">{classStats.totalStudents}명</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">평균 성취도</p>
                        <p className="text-2xl font-bold text-blue-600">{classStats.avgAchievement}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">평균 학습 시간</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {Math.floor(classStats.avgTime / 60)}h {classStats.avgTime % 60}m
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">주의 필요</p>
                        <p className="text-2xl font-bold text-red-600">{classStats.lowAchievers}명</p>
                    </div>
                </div>
            </div>

            {/* 3. 정렬 옵션 */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">학생별 현황</h2>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none cursor-pointer"
                    >
                        <option value="achievement">성취도 낮은 순</option>
                        <option value="time">학습 시간 적은 순</option>
                        <option value="name">이름순</option>
                    </select>
                </div>
            </div>

            {/* 4. 학생 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedReports.map((report) => (
                    <StudentReportCard
                        key={report.id}
                        report={report}
                        onClick={() => setSelectedReport(report)}
                    />
                ))}
            </div>

            {/* 5. 상세 보기 모달 */}
            <ReportDetailModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}
