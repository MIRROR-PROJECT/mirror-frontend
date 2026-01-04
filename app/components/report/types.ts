// app/components/report/types.ts

export interface SubjectDetail {
    name: string;
    completed_missions: number;
    total_missions: number;
    // Optional: Keep these if needed for other parts, or rename to snake_case if consistent
    chat_count?: number;
    badge?: string;
}

export interface DailyReport {
    id: string;
    date: string;
    day_of_week: string; // "월", "화" etc.
    user_name: string;

    total_study_time_minutes: number;
    achievement_rate: number;
    completed_tasks: number;
    total_tasks: number;

    focus_score?: number; // Optional for StudentReportCard

    subjects: SubjectDetail[];

    ai_summary_title: string; // [NEW] AI 코멘트 제목
    ai_summary: string;

    // Extra fields from previous mock data (optional/unused in current view but kept for safety)
    passion_temp?: number;
    question_count?: number;
    keywords?: string[];
}

export interface ReportStats {
    total_study_days: number;
    average_study_time_minutes: number;
    average_achievement_rate: number;
    total_completed_tasks: number;
}
