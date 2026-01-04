"use client";

import { useState, useMemo } from "react";
import { BarChart2, Users } from "lucide-react";
import DailyReportCard from "@/app/components/report/DailyReportCard";
import ReportStatsSection from "@/app/components/report/ReportStatsSection";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { generateMockReports, calculateMockStats } from "@/app/lib/mockReportData";

// Mock 자녀 데이터
const MOCK_CHILDREN = [
    { id: "child-1", name: "김민준" },
    { id: "child-2", name: "김서연" },
];

export default function ParentReportPage() {
    const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0].id);
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("30days");

    // 선택된 자녀 정보
    const currentChild = MOCK_CHILDREN.find(c => c.id === selectedChild);

    // Mock 데이터 생성 (자녀별로 다른 데이터)
    const allReports = useMemo(() => generateMockReports(30), [selectedChild]);

    // 날짜 필터 적용
    const filteredReports = useMemo(() => {
        if (dateFilter === "7days") return allReports.slice(0, 7);
        if (dateFilter === "30days") return allReports.slice(0, 30);
        return allReports;
    }, [allReports, dateFilter]);

    // 통계 계산
    const stats = useMemo(() => calculateMockStats(filteredReports), [filteredReports]);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">

            {/* 1. 페이지 헤더 + 자녀 선택 */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="w-7 h-7 text-blue-600" />
                        자녀 학습 리포트
                    </h1>
                    <p className="text-gray-500 mt-2">
                        자녀의 학습 현황과 AI 튜터의 피드백을 확인하세요.
                    </p>
                </div>

                {/* 자녀 선택 드롭다운 */}
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                    >
                        {MOCK_CHILDREN.map((child) => (
                            <option key={child.id} value={child.id}>
                                {child.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 2. 자녀 이름 표시 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">현재 보고 있는 자녀</p>
                <h2 className="text-2xl font-bold text-gray-900">{currentChild?.name}의 학습 현황</h2>
            </div>

            {/* 3. 상단 요약 스탯 */}
            <ReportStatsSection stats={stats} />

            {/* 4. 날짜 필터 */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">최근 리포트</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateFilter("7days")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "7days"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        최근 7일
                    </button>
                    <button
                        onClick={() => setDateFilter("30days")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "30days"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        최근 30일
                    </button>
                    <button
                        onClick={() => setDateFilter("all")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        전체
                    </button>
                </div>
            </div>

            {/* 5. 리포트 리스트 */}
            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <DailyReportCard
                        key={report.id}
                        report={report}
                        onClick={() => setSelectedReport(report)}
                    />
                ))}
            </div>

            {/* 6. 상세 보기 모달 */}
            <ReportDetailModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}
