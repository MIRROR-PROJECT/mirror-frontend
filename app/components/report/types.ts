// 공통 리포트 타입 정의
export interface DailyReport {
    id: string;
    user_id: string;
    user_name: string; // 강사용
    date: string; // "2026-01-04"
    day_of_week: string;

    // 학습 데이터
    total_study_time_minutes: number;
    completed_tasks: number;
    total_tasks: number;
    achievement_rate: number; // 0-100

    // 과목별 데이터 (미션 완료 개수 기반)
    subjects: {
        name: string;
        completed_missions: number;
        total_missions: number;
        completion_rate: number; // 0-100
    }[];

    // AI 피드백
    ai_summary: string;
    ai_highlights: string[]; // ["잘한 점", "개선할 점"]

    // 추가 정보
    focus_score?: number; // 0-100 (부모/강사용)
    streak_days?: number; // 연속 학습 일수
    best_subject?: string; // 가장 잘한 과목
    needs_improvement_subject?: string; // 개선 필요 과목
}

export interface ReportStats {
    total_study_days: number;
    average_study_time_minutes: number;
    average_achievement_rate: number;
    total_completed_tasks: number;
    current_streak: number; // 현재 연속 학습 일수
    longest_streak: number; // 최장 연속 학습 일수
    weekly_goal_achievement: number; // 주간 목표 달성률 (0-100)
}
