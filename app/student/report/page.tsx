"use client";

import { useState, useMemo } from "react";
import { BarChart2 } from "lucide-react";
import DailyReportCard from "@/app/components/report/DailyReportCard";
import ReportStatsSection from "@/app/components/report/ReportStatsSection";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { generateMockReports, calculateMockStats } from "@/app/lib/mockReportData";

export default function StudentReportPage() {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("30days");

  // Mock 데이터 생성
  const allReports = useMemo(() => generateMockReports(30), []);

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

      {/* 2. 상단 요약 스탯 */}
      <ReportStatsSection stats={stats} />

      {/* 3. 날짜 필터 */}
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

      {/* 4. 리포트 리스트 */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <DailyReportCard
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