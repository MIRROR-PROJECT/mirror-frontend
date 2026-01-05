"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart2 } from "lucide-react";
import DailyReportCard from "@/app/components/report/DailyReportCard";
import ReportStatsSection from "@/app/components/report/ReportStatsSection";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { supabase } from "@/app/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mirror-backend-5j11.onrender.com/api';

export default function StudentReportPage() {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("30days");
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 실제 API에서 리포트 목록 가져오기
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log('No user session');
          setIsLoading(false);
          return;
        }

        const days = dateFilter === "7days" ? 7 : dateFilter === "30days" ? 30 : 90;

        const response = await fetch(
          `${API_BASE_URL}/reports/daily/list?user_id=${session.user.id}&days=${days}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const result = await response.json();

        if (result.success && result.data) {
          // API 응답을 UI 포맷으로 변환
          const formattedReports: DailyReport[] = result.data.map((item: any) => ({
            id: item.report_id,
            date: formatDate(item.report_date),
            day_of_week: getDayOfWeek(item.report_date),
            user_name: session.user.user_metadata?.name || '학생',

            total_study_time_minutes: item.total_study_time || 0,
            achievement_rate: item.achievement_rate || 0,
            completed_tasks: calculateCompletedTasks(item.subject_details),
            total_tasks: item.subject_details?.length || 0,

            subjects: formatSubjects(item.subject_details),
            most_immersive_subject: item.most_immersive_subject || '',

            ai_summary_title: item.ai_summary_title || '📝 오늘의 학습',
            ai_summary: `${item.ai_good_point || ''}\n\n${item.ai_improvement_point || ''}`,

            passion_temp: item.passion_temp || 36.5,
            question_count: item.question_count || 0,
            keywords: item.keywords || []
          }));

          setReports(formattedReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [dateFilter]);

  // 날짜 필터링은 API에서 처리하므로 filteredReports는 reports와 동일
  const filteredReports = reports;

  // 통계 계산
  const stats = useMemo(() => {
    if (reports.length === 0) {
      return {
        total_study_days: 0,
        average_study_time_minutes: 0,
        average_achievement_rate: 0,
        total_completed_tasks: 0
      };
    }

    const totalStudyTime = reports.reduce((sum, r) => sum + r.total_study_time_minutes, 0);
    const totalAchievementRate = reports.reduce((sum, r) => sum + r.achievement_rate, 0);
    const totalCompletedTasks = reports.reduce((sum, r) => sum + r.completed_tasks, 0);

    return {
      total_study_days: reports.length,
      average_study_time_minutes: Math.round(totalStudyTime / reports.length),
      average_achievement_rate: Math.round(totalAchievementRate / reports.length),
      total_completed_tasks: totalCompletedTasks
    };
  }, [reports]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">

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
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["7days", "30days", "all"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${dateFilter === filter
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {filter === "7days" ? "7일" : filter === "30days" ? "30일" : "전체"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 리포트 리스트 */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">리포트를 불러오는 중...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">아직 생성된 리포트가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">학습을 시작하면 매일 자동으로 리포트가 생성됩니다!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      {/* 5. 상세 보기 모달 */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

// 헬퍼 함수들
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDayOfWeek(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

function calculateCompletedTasks(subjectDetails: any[]): number {
  if (!subjectDetails) return 0;
  return subjectDetails.filter(s => s.mission_achievement_rate >= 100).length;
}

function formatSubjects(subjectDetails: any[]): any[] {
  if (!subjectDetails) return [];

  return subjectDetails.map(s => ({
    name: s.subject_name,
    completed_missions: Math.round(s.mission_achievement_rate / 100),
    total_missions: 1,
    chat_count: s.question_count || 0,
    badge: s.mission_achievement_rate >= 100 ? '✅' : s.mission_achievement_rate >= 50 ? '🏃‍♂️' : '📝'
  }));
}