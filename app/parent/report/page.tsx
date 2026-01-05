"use client";

import { useState, useMemo } from "react";
import { BarChart2, Users } from "lucide-react";
import DailyReportCard from "@/app/components/report/DailyReportCard";
import ReportStatsSection from "@/app/components/report/ReportStatsSection";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { generateMockReports, calculateMockStats } from "@/app/lib/mockReportData";
import { useLanguage } from "@/app/context/LanguageContext";

// Mock 자녀 데이터
interface Child {
    id: string;
    name: string;
}

const MOCK_CHILDREN: Child[] = [
    { id: "child-1", name: "김민준" },
    { id: "child-2", name: "김서연" },
    { id: "child-3", name: "김도윤" },
];

export default function ParentReportPage() {
    const { t, language } = useLanguage();
    const [selectedChild, setSelectedChild] = useState<Child>(MOCK_CHILDREN[0]);
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
    const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("30days");

    // 선택된 자녀 정보
    // selectedChild is already the object, so currentChild is just selectedChild
    const currentChild = selectedChild;

    // 선택된 자녀의 전체 리포트 생성 (Mock)
    const allReports = useMemo(() => generateMockReports(30, language as 'ko' | 'en'), [selectedChild, language]);

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
                        {t('parent.report.title')}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {t('parent.report.subtitle')}
                    </p>
                </div>

                {/* 자녀 선택 드롭다운 */}
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedChild.id}
                        onChange={(e) => {
                            const child = MOCK_CHILDREN.find(c => c.id === e.target.value);
                            if (child) setSelectedChild(child);
                        }}
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
                <p className="text-sm text-gray-600 mb-1">{t('parent.report.currentChild')}</p>
                <h2 className="text-2xl font-bold text-gray-900">{t('parent.report.childStatus', { name: currentChild?.name || '' })}</h2>
            </div>

            {/* 3. 상단 요약 스탯 */}
            <ReportStatsSection stats={stats} />

            {/* 4. 날짜 필터 */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">{t('parent.report.recentReports')}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateFilter("7days")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "7days"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {t('parent.report.filter7days')}
                    </button>
                    <button
                        onClick={() => setDateFilter("30days")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "30days"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {t('parent.report.filter30days')}
                    </button>
                    <button
                        onClick={() => setDateFilter("all")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateFilter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {t('parent.report.filterAll')}
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
