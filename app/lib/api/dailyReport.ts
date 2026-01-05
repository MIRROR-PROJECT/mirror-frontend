// app/lib/api/dailyReport.ts
import { supabase } from "../supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mirror-backend-5j11.onrender.com/api';

export interface CreateDailyReportRequest {
    user_id: string;
    report_date?: string; // YYYY-MM-DD, 기본값: 오늘
    total_study_time: number; // 분 단위
    achievement_rate: number; // 0-100
    question_count: number;
    most_immersive_subject: string;
    subject_details: {
        subject_name: string;
        mission_achievement_rate: number; // 0-100
        question_count: number;
    }[];
}

export interface DailyReportResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        report_id: string;
        user_id: string;
        report_date: string;
        ai_summary_title: string;
        ai_good_point: string;
        ai_improvement_point: string;
        keywords: string[];
        passion_temp: number;
        subject_badges: string[];
        created_at: string;
    } | null;
}

/**
 * 일간 리포트 생성/조회
 * - 같은 날짜의 리포트가 없으면 새로 생성 (201)
 * - 이미 있으면 기존 리포트 반환 (200)
 */
export async function createDailyReport(
    request: CreateDailyReportRequest
): Promise<DailyReportResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${API_BASE_URL}/reports/daily`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error(`Failed to create daily report: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * 특정 날짜의 일간 리포트 조회
 */
export async function getDailyReport(
    userId: string,
    reportDate: string // YYYY-MM-DD
): Promise<DailyReportResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
        `${API_BASE_URL}/reports/daily?user_id=${userId}&report_date=${reportDate}`,
        {
            headers: {
                'Authorization': `Bearer ${session?.access_token || ''}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get daily report: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * 여러 날짜의 리포트 목록 조회 (최근 N일)
 */
export async function getDailyReports(
    userId: string,
    days: number = 30
): Promise<DailyReportResponse[]> {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
        `${API_BASE_URL}/reports/daily/list?user_id=${userId}&days=${days}`,
        {
            headers: {
                'Authorization': `Bearer ${session?.access_token || ''}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get daily reports: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
}
