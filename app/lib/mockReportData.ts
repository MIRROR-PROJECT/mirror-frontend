import { DailyReport, SubjectDetail, ReportStats } from "@/app/components/report/types";

// 랜덤 데이터 헬퍼
const SUBJECTS = ["물리", "수학", "영어"];
const KEYWORDS = ["가속도", "미분", "관계대명사", "빈칸추론", "왜?", "다시설명", "그래프"];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const generateMockReports = (count: number): DailyReport[] => {
    return Array.from({ length: count }).map((_, i) => {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - i);
        const date = dateObj.toISOString().split('T')[0];
        const day_of_week = DAYS[dateObj.getDay()];

        const question_count = getRandomInt(0, 30);
        // 질문이 많을수록 온도가 올라가는 로직 (기본 36.5도)
        const passion_temp = Math.min(99, Math.floor(36.5 + question_count * 1.5));

        // 과목별 데이터 생성
        const subjects: SubjectDetail[] = SUBJECTS.map(sub => {
            const chats = getRandomInt(0, 10);
            let badge = "💤 잠잠함";
            if (chats > 7) badge = "💬 질문 폭발";
            else if (chats > 3) badge = "🤔 개념 탐구";
            else if (chats === 0) badge = "🚀 독학 마스터";

            return {
                name: sub,
                total_missions: 5,
                completed_missions: getRandomInt(2, 5),
                chat_count: chats,
                badge
            };
        });

        const total_study_time_minutes = getRandomInt(60, 300); // 1시간~5시간
        const achievement_rate = getRandomInt(40, 100);
        const completed_tasks = subjects.reduce((acc, sub) => acc + sub.completed_missions, 0);
        const total_tasks = subjects.reduce((acc, sub) => acc + sub.total_missions, 0);

        // [NEW] 향상된 AI 피드백 생성 로직
        const { title, content } = generateAiFeedback(
            "김철수",
            total_study_time_minutes,
            achievement_rate,
            question_count,
            subjects
        );

        return {
            id: `report-${i}`,
            date,
            day_of_week,
            user_name: "김철수", // Mock User Name
            total_study_time_minutes,
            achievement_rate,
            completed_tasks,
            total_tasks,
            passion_temp,
            question_count,
            keywords: KEYWORDS.sort(() => 0.5 - Math.random()).slice(0, 3),
            ai_summary_title: title, // [NEW] 제목 연결
            ai_summary: content,     // [NEW] 내용 연결
            subjects,
            focus_score: getRandomInt(40, 100)
        };
    });
};

// [NEW] 상황별 맞춤 피드백 생성 함수 (Modified to return title and content)
const generateAiFeedback = (
    name: string,
    minutes: number,
    rate: number,
    questions: number,
    subjects: SubjectDetail[]
): { title: string, content: string } => { // Return type changed
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeText = `${hours}시간 ${mins}분`;

    // 1. 가장 많이 질문한 과목 찾기
    const mostCuriousSubject = subjects.reduce((prev, current) =>
        (prev.chat_count || 0) > (current.chat_count || 0) ? prev : current
    );

    let title = "";
    let goodPoint = "";
    let improvementPoint = "";

    // 2. 피드백 시나리오 분기
    if (questions >= 15) {
        title = "🔥 열정적인 탐구 정신!";
        goodPoint = `오늘 총 ${questions}번의 질문을 던지며 적극적으로 학습했습니다. 특히 '${mostCuriousSubject.name}' 과목을 깊이 파고든 점이 아주 훌륭해요.`;
        improvementPoint = `💡 **내일의 집중 포인트**\n질문한 내용을 바탕으로 '나만의 정리 노트'를 만들어보세요. 스스로 정리할 때 진짜 내 것이 된답니다!`;
    } else if (questions <= 3 && rate >= 85) {
        title = "🚀 자기주도 학습 능력 탁월!";
        goodPoint = `AI 튜터에게 의존하지 않고 스스로 문제를 해결하며 ${rate}%의 높은 성취도를 기록했어요. 혼자서도 잘 해내는 힘이 돋보입니다.`;
        improvementPoint = `💡 **내일의 집중 포인트**\n지금처럼 하되, 혹시 막히는 부분이 생기면 주저 말고 질문해주세요. 더 효율적인 풀이법을 찾을 수도 있으니까요!`;
    } else if (minutes >= 240) {
        title = "💪 끈기와 성실함의 승리!";
        goodPoint = `무려 ${timeText}이나 집중력을 유지했어요. 꾸준히 책상 앞을 지키는 힘은 그 어떤 재능보다 강력한 무기입니다.`;
        improvementPoint = `💡 **내일의 집중 포인트**\n오래 공부한 만큼 휴식도 중요해요! 내일은 50분 공부하고 10분 쉬는 패턴을 꼭 지켜보세요.`;
    } else if (rate <= 50) {
        title = "🌱 포기하지 않는 태도";
        goodPoint = `목표 달성이 조금 어려웠지만, 그래도 끝까지 학습을 이어나가려 노력한 점을 칭찬해요. 시작이 반입니다!`;
        improvementPoint = `💡 **내일의 집중 포인트**\n학습량을 조금 줄여서 '작은 성공'을 먼저 경험해보는 건 어떨까요? 쉬운 난이도부터 차근차근 정복해봅시다.`;
    } else {
        title = "✨ 균형 잡힌 학습 습관";
        goodPoint = `${timeText} 동안 성실하게 과제를 수행했습니다. 기복 없이 꾸준히 해나가는 모습이 가장 모범적이에요.`;
        improvementPoint = `💡 **내일의 집중 포인트**\n내일은 평소에 어려워했던 과목에 30분만 더 투자해보세요. 꾸준함에 '한 스푼의 도전'을 더하면 실력이 급성장할 거예요!`;
    }

    return {
        title,
        content: `**잘한 점**\n${goodPoint}\n\n${improvementPoint}` // Adjust content format if needed
    };
};


// [FIX] 통계 계산 함수 수정
export const calculateMockStats = (reports: DailyReport[]): ReportStats => {
    // 데이터가 없을 경우 0으로 초기화
    if (!reports || reports.length === 0) {
        return {
            total_study_days: 0,
            average_study_time_minutes: 0,
            average_achievement_rate: 0,
            total_completed_tasks: 0,
        };
    }

    // 1. 총 학습 일수
    const total_study_days = reports.length;

    // 2. 평균 학습 시간 계산
    const totalMinutes = reports.reduce((acc, curr) => acc + curr.total_study_time_minutes, 0);
    const average_study_time_minutes = Math.round(totalMinutes / reports.length);

    // 3. 평균 성취도
    const totalRate = reports.reduce((acc, curr) => acc + curr.achievement_rate, 0);
    const average_achievement_rate = Math.round(totalRate / reports.length);

    // 4. 완료한 총 과제 수
    const total_completed_tasks = reports.reduce((acc, curr) => acc + curr.completed_tasks, 0);

    return {
        total_study_days,
        average_study_time_minutes,
        average_achievement_rate,
        total_completed_tasks,
    };
};
