import { DailyReport, SubjectDetail, ReportStats } from "@/app/components/report/types";

// 다국어 데이터
const DATA = {
    ko: {
        subjects: ["물리", "수학", "영어"],
        keywords: ["가속도", "미분", "관계대명사", "빈칸추론", "왜?", "다시설명", "그래프"],
        days: ["일", "월", "화", "수", "목", "금", "토"],
        badges: {
            veryActive: "💬 질문 폭발",
            active: "🤔 개념 탐구",
            selfStudy: "🚀 독학 마스터",
            quiet: "💤 잠잠함"
        },
        userName: "김철수",
        feedback: {
            passionate: {
                title: "🔥 열정적인 탐구 정신!",
                good: (q: number, subject: string) => `오늘 총 ${q}번의 질문을 던지며 적극적으로 학습했습니다. 특히 '${subject}' 과목을 깊이 파고든 점이 아주 훌륭해요.`,
                improve: "💡 **내일의 집중 포인트**\\n질문한 내용을 바탕으로 '나만의 정리 노트'를 만들어보세요. 스스로 정리할 때 진짜 내 것이 된답니다!"
            },
            selfDirected: {
                title: "🚀 자기주도 학습 능력 탁월!",
                good: (rate: number) => `AI 튜터에게 의존하지 않고 스스로 문제를 해결하며 ${rate}%의 높은 성취도를 기록했어요. 혼자서도 잘 해내는 힘이 돋보입니다.`,
                improve: "💡 **내일의 집중 포인트**\\n지금처럼 하되, 혹시 막히는 부분이 생기면 주저 말고 질문해주세요. 더 효율적인 풀이법을 찾을 수도 있으니까요!"
            },
            persistent: {
                title: "💪 끈기와 성실함의 승리!",
                good: (time: string) => `무려 ${time}이나 집중력을 유지했어요. 꾸준히 책상 앞을 지키는 힘은 그 어떤 재능보다 강력한 무기입니다.`,
                improve: "💡 **내일의 집중 포인트**\\n오래 공부한 만큼 휴식도 중요해요! 내일은 50분 공부하고 10분 쉬는 패턴을 꼭 지켜보세요."
            },
            growing: {
                title: "🌱 포기하지 않는 태도",
                good: "목표 달성이 조금 어려웠지만, 그래도 끝까지 학습을 이어나가려 노력한 점을 칭찬해요. 시작이 반입니다!",
                improve: "💡 **내일의 집중 포인트**\\n학습량을 조금 줄여서 '작은 성공'을 먼저 경험해보는 건 어떨까요? 쉬운 난이도부터 차근차근 정복해봅시다."
            },
            balanced: {
                title: "✨ 균형 잡힌 학습 습관",
                good: (time: string) => `${time} 동안 성실하게 과제를 수행했습니다. 기복 없이 꾸준히 해나가는 모습이 가장 모범적이에요.`,
                improve: "💡 **내일의 집중 포인트**\\n내일은 평소에 어려워했던 과목에 30분만 더 투자해보세요. 꾸준함에 '한 스푼의 도전'을 더하면 실력이 급성장할 거예요!"
            }
        }
    },
    en: {
        subjects: ["Physics", "Math", "English"],
        keywords: ["acceleration", "derivative", "relative pronouns", "inference", "why?", "re-explain", "graph"],
        days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        badges: {
            veryActive: "💬 Question Storm",
            active: "🤔 Deep Dive",
            selfStudy: "🚀 Independent Master",
            quiet: "💤 Quiet Session"
        },
        userName: "John Doe",
        feedback: {
            passionate: {
                title: "🔥 Passionate Explorer!",
                good: (q: number, subject: string) => `You asked ${q} questions today, showing active engagement. Your deep dive into '${subject}' was excellent.`,
                improve: "💡 **Tomorrow's Focus**\\nCreate your own summary notes based on the questions you asked. True learning happens when you organize it yourself!"
            },
            selfDirected: {
                title: "🚀 Outstanding Self-Directed Learning!",
                good: (rate: number) => `You solved problems independently without relying on AI tutor and achieved ${rate}% completion rate. Your self-sufficiency is impressive.`,
                improve: "💡 **Tomorrow's Focus**\\nKeep it up, but don't hesitate to ask when stuck. You might discover more efficient methods!"
            },
            persistent: {
                title: "💪 Victory of Persistence!",
                good: (time: string) => `You maintained focus for ${time}! Staying power is more powerful than any talent.`,
                improve: "💡 **Tomorrow's Focus**\\nRest is important too! Try the 50-10 pattern: study 50 minutes, rest 10 minutes."
            },
            growing: {
                title: "🌱 Never Give Up Attitude",
                good: "Achievement was challenging, but your effort to keep going deserves praise. Starting is half the battle!",
                improve: "💡 **Tomorrow's Focus**\\nHow about reducing the load to experience 'small wins' first? Let's conquer easier levels step by step."
            },
            balanced: {
                title: "✨ Balanced Study Habits",
                good: (time: string) => `You worked steadily for ${time}. Consistent daily effort is the most exemplary approach.`,
                improve: "💡 **Tomorrow's Focus**\\nInvest 30 more minutes in a subject you find challenging. Adding 'a touch of challenge' to consistency brings rapid growth!"
            }
        }
    }
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockReports = (count: number, language: 'ko' | 'en' = 'ko'): DailyReport[] => {
    const lang = DATA[language];

    return Array.from({ length: count }).map((_, i) => {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - i);
        const date = dateObj.toISOString().split('T')[0];
        const day_of_week = lang.days[dateObj.getDay()];

        const question_count = getRandomInt(0, 30);
        const passion_temp = Math.min(99, Math.floor(36.5 + question_count * 1.5));

        // 과목별 데이터 생성
        const subjects: SubjectDetail[] = lang.subjects.map(sub => {
            const chats = getRandomInt(0, 10);
            let badge = lang.badges.quiet;
            if (chats > 7) badge = lang.badges.veryActive;
            else if (chats > 3) badge = lang.badges.active;
            else if (chats === 0) badge = lang.badges.selfStudy;

            return {
                name: sub,
                total_missions: 5,
                completed_missions: getRandomInt(2, 5),
                chat_count: chats,
                badge
            };
        });

        const total_study_time_minutes = getRandomInt(60, 300);
        const achievement_rate = getRandomInt(40, 100);
        const completed_tasks = subjects.reduce((acc, sub) => acc + sub.completed_missions, 0);
        const total_tasks = subjects.reduce((acc, sub) => acc + sub.total_missions, 0);

        // 가장 몰입한 과목 찾기
        const mostImmersive = subjects.reduce((prev, current) => {
            const prevScore = prev.completed_missions + (prev.chat_count || 0);
            const currScore = current.completed_missions + (current.chat_count || 0);
            return prevScore > currScore ? prev : current;
        });

        // AI 피드백 생성
        const { title, content } = generateAiFeedback(
            lang.userName,
            total_study_time_minutes,
            achievement_rate,
            question_count,
            subjects,
            language
        );

        return {
            id: `report-${i}`,
            date,
            day_of_week,
            user_name: lang.userName,
            total_study_time_minutes,
            achievement_rate,
            completed_tasks,
            total_tasks,
            passion_temp,
            question_count,
            keywords: lang.keywords.sort(() => 0.5 - Math.random()).slice(0, 3),
            ai_summary_title: title,
            ai_summary: content,
            subjects,
            most_immersive_subject: mostImmersive.name,
            focus_score: getRandomInt(40, 100)
        };
    });
};

const generateAiFeedback = (
    name: string,
    minutes: number,
    rate: number,
    questions: number,
    subjects: SubjectDetail[],
    language: 'ko' | 'en'
): { title: string, content: string } => {
    const lang = DATA[language];
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeText = language === 'ko'
        ? `${hours}시간 ${mins}분`
        : `${hours}h ${mins}m`;

    const mostCuriousSubject = subjects.reduce((prev, current) =>
        (prev.chat_count || 0) > (current.chat_count || 0) ? prev : current
    );

    let title = "";
    let goodPoint = "";
    let improvementPoint = "";

    if (questions >= 15) {
        const fb = lang.feedback.passionate;
        title = fb.title;
        goodPoint = fb.good(questions, mostCuriousSubject.name);
        improvementPoint = fb.improve;
    } else if (questions <= 3 && rate >= 85) {
        const fb = lang.feedback.selfDirected;
        title = fb.title;
        goodPoint = fb.good(rate);
        improvementPoint = fb.improve;
    } else if (minutes >= 240) {
        const fb = lang.feedback.persistent;
        title = fb.title;
        goodPoint = fb.good(timeText);
        improvementPoint = fb.improve;
    } else if (rate <= 50) {
        const fb = lang.feedback.growing;
        title = fb.title;
        goodPoint = fb.good;
        improvementPoint = fb.improve;
    } else {
        const fb = lang.feedback.balanced;
        title = fb.title;
        goodPoint = fb.good(timeText);
        improvementPoint = fb.improve;
    }

    const goodLabel = language === 'ko' ? '**잘한 점**' : '**Well Done**';
    return {
        title,
        content: `${goodLabel}\\n${goodPoint}\\n\\n${improvementPoint}`
    };
};

export const calculateMockStats = (reports: DailyReport[]): ReportStats => {
    if (!reports || reports.length === 0) {
        return {
            total_study_days: 0,
            average_study_time_minutes: 0,
            average_achievement_rate: 0,
            total_completed_tasks: 0,
        };
    }

    const total_study_days = reports.length;
    const totalMinutes = reports.reduce((acc, curr) => acc + curr.total_study_time_minutes, 0);
    const average_study_time_minutes = Math.round(totalMinutes / reports.length);
    const totalRate = reports.reduce((acc, curr) => acc + curr.achievement_rate, 0);
    const average_achievement_rate = Math.round(totalRate / reports.length);
    const total_completed_tasks = reports.reduce((acc, curr) => acc + curr.completed_tasks, 0);

    return {
        total_study_days,
        average_study_time_minutes,
        average_achievement_rate,
        total_completed_tasks,
    };
};
