// Mock 데이터 생성 함수
import { DailyReport, ReportStats } from "../components/report/types";

export function generateMockReports(count: number = 14): DailyReport[] {
    const reports: DailyReport[] = [];
    const today = new Date();

    const subjects = ["수학", "영어", "물리", "화학", "국어"];
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

    for (let i = 0; i < count; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        const dayOfWeek = days[date.getDay()];

        const totalTasks = Math.floor(Math.random() * 5) + 5; // 5-10
        const completedTasks = Math.floor(Math.random() * totalTasks) + Math.floor(totalTasks * 0.5);
        const achievementRate = Math.round((completedTasks / totalTasks) * 100);

        const numSubjects = Math.floor(Math.random() * 3) + 2; // 2-4 과목
        const selectedSubjects = subjects
            .sort(() => Math.random() - 0.5)
            .slice(0, numSubjects);

        const subjectData = selectedSubjects.map(name => {
            const totalMissions = Math.floor(Math.random() * 5) + 3; // 3-7 미션
            const completedMissions = Math.floor(Math.random() * (totalMissions + 1)); // 0-total
            const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

            return {
                name,
                completed_missions: completedMissions,
                total_missions: totalMissions,
                completion_rate: completionRate
            };
        });

        const totalStudyTime = Math.floor(Math.random() * 180) + 60; // 60-240분

        // 가장 잘한 과목 / 개선 필요 과목
        const sortedByCompletion = [...subjectData].sort((a, b) => b.completion_rate - a.completion_rate);
        const bestSubject = sortedByCompletion[0]?.name;
        const needsImprovementSubject = sortedByCompletion[sortedByCompletion.length - 1]?.name;

        const aiSummaries = [
            "오늘은 특히 집중력이 좋았어요! 어려운 문제도 끈기있게 풀어냈습니다. 👏",
            "개념 이해도가 높아지고 있어요. 다만 실수가 조금 있으니 검산을 꼭 해주세요.",
            "피곤해 보였지만 끝까지 완주했어요. 내일은 조금 더 여유있게 공부해봐요.",
            "완벽한 하루였어요! 모든 과제를 정확하게 완료했습니다. 🎉",
            "집중력이 다소 떨어진 날이었어요. 충분한 휴식을 취하고 내일 다시 시작해요."
        ];

        reports.push({
            id: `report-${i}`,
            user_id: "student-1",
            user_name: "학생 이름",
            date: dateStr,
            day_of_week: dayOfWeek,
            total_study_time_minutes: totalStudyTime,
            completed_tasks: completedTasks,
            total_tasks: totalTasks,
            achievement_rate: achievementRate,
            subjects: subjectData,
            ai_summary: aiSummaries[Math.floor(Math.random() * aiSummaries.length)],
            ai_highlights: [
                "문제 풀이 속도가 빨라졌어요",
                "개념 이해도가 향상되었습니다"
            ],
            focus_score: Math.floor(Math.random() * 30) + 70, // 70-100
            streak_days: i === 0 ? Math.floor(Math.random() * 10) + 1 : undefined, // 최신 리포트만
            best_subject: bestSubject,
            needs_improvement_subject: needsImprovementSubject
        });
    }

    return reports;
}

export function calculateMockStats(reports: DailyReport[]): ReportStats {
    const totalStudyDays = reports.length;
    const totalMinutes = reports.reduce((sum, r) => sum + r.total_study_time_minutes, 0);
    const totalAchievement = reports.reduce((sum, r) => sum + r.achievement_rate, 0);
    const totalCompleted = reports.reduce((sum, r) => sum + r.completed_tasks, 0);

    // 연속 학습 일수 계산 (간단한 mock)
    const currentStreak = Math.floor(Math.random() * 7) + 3; // 3-10일
    const longestStreak = currentStreak + Math.floor(Math.random() * 5); // current보다 조금 더

    // 주간 목표 달성률 (mock)
    const weeklyGoalAchievement = Math.floor(Math.random() * 30) + 70; // 70-100%

    return {
        total_study_days: totalStudyDays,
        average_study_time_minutes: Math.round(totalMinutes / totalStudyDays),
        average_achievement_rate: Math.round(totalAchievement / totalStudyDays),
        total_completed_tasks: totalCompleted,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        weekly_goal_achievement: weeklyGoalAchievement
    };
}
