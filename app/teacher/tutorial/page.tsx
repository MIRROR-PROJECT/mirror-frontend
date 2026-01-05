'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import TeacherDashboard from '../../components/dashboard/TeacherDashboard';

type TutorialStep = {
    title: string;
    description: string;
    target: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: '👋 환영합니다!',
        description: 'Mirror AI 선생님 워크스페이스입니다. 실시간으로 학급의 모든 학습 데이터를 분석하고, AI가 오늘의 수업 전략을 제안합니다.',
        target: 'daily-briefing',
        position: 'bottom'
    },
    {
        title: '📊 학급 분위기 분석',
        description: '어제 밤 학생들의 학습 패턴을 AI가 분석했습니다. 오늘 수업에서 어떤 부분을 먼저 다루면 좋을지 확인하세요.',
        target: 'briefing-mood',
        position: 'right'
    },
    {
        title: '🎯 취약점 발견',
        description: '전체 학생의 오답률이 높은 개념을 실시간으로 찾아냅니다. 오늘 수업 도입부 복습 추천을 받으세요.',
        target: 'briefing-weakness',
        position: 'right'
    },
    {
        title: '✨ AI 추천 액션',
        description: 'AI가 데이터를 바탕으로 가장 효과적인 수업 방법을 제안합니다. 클릭 한 번으로 수업 자료에 추가할 수 있어요.',
        target: 'ai-recommendation',
        position: 'left'
    },
    {
        title: '📝 AI 오답 클리닉',
        description: '취약한 유형의 문제를 자동으로 선별하여 PDF 문제지로 생성합니다. 학생별 맞춤 문제도 가능해요.',
        target: 'ai-clinic',
        position: 'top'
    },
    {
        title: '⚠️ 케어 필요 학생',
        description: '성적 급락, 장기 미접속 등 즉시 관리가 필요한 학생을 AI가 알려줍니다. 전화 한 통으로 학생을 구할 수 있어요.',
        target: 'care-list',
        position: 'left'
    },
    {
        title: '✅ 준비 완료!',
        description: '이제 학생 관리의 효율이 10배 올라갑니다. 데이터 기반으로 학생을 케어하세요!',
        target: 'finish',
        position: 'center'
    }
];

export default function TeacherTutorialWrapper() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [user] = useState({ name: '선생님', email: 'teacher@mirror.com' });

    const currentTutorial = TUTORIAL_STEPS[currentStep];

    useEffect(() => {
        if (currentTutorial.position === 'center') return;

        const targetElement = document.querySelector(`[data-tutorial="${currentTutorial.target}"]`);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            setSpotlightPosition({
                top: rect.top + window.scrollY - 10,
                left: rect.left + window.scrollX - 10,
                width: rect.width + 20,
                height: rect.height + 20
            });

            // 요소가 화면에 보이도록 스크롤
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep, currentTutorial]);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const handleSkip = () => {
        completeTutorial();
    };

    const completeTutorial = () => {
        localStorage.setItem('teacher_tutorial_completed', 'true');
        router.push('/dashboard?role=teacher');
    };

    const getTooltipClasses = () => {
        const { position } = currentTutorial;
        const base = "fixed z-[60] bg-white rounded-2xl shadow-2xl p-6 max-w-md border-2 border-indigo-200";

        switch (position) {
            case 'top':
                return `${base} bottom-[${spotlightPosition.top + spotlightPosition.height + 20}px] left-1/2 -translate-x-1/2`;
            case 'bottom':
                return `${base} top-[${spotlightPosition.top + spotlightPosition.height + 20}px] left-1/2 -translate-x-1/2`;
            case 'left':
                return `${base} right-[calc(100%-${spotlightPosition.left - 20}px)] top-1/2 -translate-y-1/2`;
            case 'right':
                return `${base} left-[${spotlightPosition.left + spotlightPosition.width + 20}px] top-1/2 -translate-y-1/2`;
            default:
                return base;
        }
    };

    return (
        <div className="relative">
            {/* Spotlight Overlay */}
            {currentTutorial.position !== 'center' && (
                <div className="fixed inset-0 z-[55] pointer-events-none">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        <defs>
                            <mask id="spotlight-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <rect
                                    x={spotlightPosition.left}
                                    y={spotlightPosition.top}
                                    width={spotlightPosition.width}
                                    height={spotlightPosition.height}
                                    rx="16"
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.75)" mask="url(#spotlight-mask)" />
                    </svg>
                </div>
            )}

            {/* Tooltip */}
            {currentTutorial.position !== 'center' ? (
                <div
                    className={getTooltipClasses()}
                    style={{
                        top: currentTutorial.position === 'bottom' ? `${spotlightPosition.top + spotlightPosition.height + 20}px` :
                            currentTutorial.position === 'top' ? 'auto' : '50%',
                        bottom: currentTutorial.position === 'top' ? `calc(100% - ${spotlightPosition.top - 20}px)` : 'auto',
                        left: currentTutorial.position === 'right' ? `${spotlightPosition.left + spotlightPosition.width + 20}px` :
                            currentTutorial.position === 'left' ? 'auto' : '50%',
                        right: currentTutorial.position === 'left' ? `calc(100% - ${spotlightPosition.left - 20}px)` : 'auto',
                        transform: currentTutorial.position === 'left' || currentTutorial.position === 'right' ? 'translateY(-50%)' :
                            currentTutorial.position === 'top' || currentTutorial.position === 'bottom' ? 'translateX(-50%)' : 'none'
                    }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                        <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{currentTutorial.description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                        <button
                            onClick={handleNext}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg"
                        >
                            다음 <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                // Final Modal
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md mx-4 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentTutorial.title}</h2>
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{currentTutorial.description}</p>
                        <button
                            onClick={completeTutorial}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                        >
                            워크스페이스 시작하기
                        </button>
                        <button
                            onClick={handleSkip}
                            className="w-full mt-3 text-gray-500 py-2 rounded-lg font-medium hover:text-gray-700"
                        >
                            나중에 다시 보기
                        </button>
                    </div>
                </div>
            )}

            {/* Actual Teacher Dashboard with tutorial markers */}
            <div data-tutorial-wrapper="true">
                <TeacherDashboard user={user} />
            </div>
        </div>
    );
}
