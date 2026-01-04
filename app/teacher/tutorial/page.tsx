'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Users, TrendingUp, BookOpen, Sparkles } from 'lucide-react';

// 모의 학생 데이터
const MOCK_STUDENTS = [
    { id: 1, name: '김민준', grade: '고2', subject: '수학', progress: 85, status: 'active', recent: '오늘 3시간 학습' },
    { id: 2, name: '이서윤', grade: '고3', subject: '영어', progress: 72, status: 'active', recent: '어제 2시간 학습' },
    { id: 3, name: '박지호', grade: '고1', subject: '국어', progress: 90, status: 'warning', recent: '3일째 미접속' },
];

type TutorialStep = {
    title: string;
    description: string;
    target: string; // CSS selector or ID
    position: 'top' | 'bottom' | 'left' | 'right';
};

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: '👋 환영합니다!',
        description: 'Mirror AI 선생님 대시보드에 오신 것을 환영합니다. 학생들의 학습 현황을 한눈에 확인하고 관리할 수 있어요.',
        target: 'dashboard-header',
        position: 'bottom'
    },
    {
        title: '📊 학생 목록',
        description: '여기서 담당하는 모든 학생들을 확인할 수 있습니다. 각 학생의 학습 진행도와 최근 활동을 실시간으로 모니터링하세요.',
        target: 'student-list',
        position: 'right'
    },
    {
        title: '📈 학습 통계',
        description: '학생별 성적 추이와 학습 패턴을 분석할 수 있습니다. 클릭하면 상세한 리포트를 확인할 수 있어요.',
        target: 'student-card-0',
        position: 'top'
    },
    {
        title: '➕ 학생 추가',
        description: '새로운 학생을 등록하려면 여기를 클릭하세요. 학생 정보를 입력하고 과목을 배정할 수 있습니다.',
        target: 'add-student-btn',
        position: 'left'
    },
    {
        title: '✨ 준비 완료!',
        description: '이제 시작할 준비가 되셨습니다. 학생들의 성장을 함께 만들어가요!',
        target: 'finish-tutorial',
        position: 'bottom'
    }
];

export default function TeacherTutorialPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const currentTutorial = TUTORIAL_STEPS[currentStep];

    // 하이라이트할 요소의 위치 계산
    useEffect(() => {
        if (currentTutorial.target === 'finish-tutorial') return;

        const targetElement = document.getElementById(currentTutorial.target);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            setSpotlightPosition({
                top: rect.top + window.scrollY - 10,
                left: rect.left + window.scrollX - 10,
                width: rect.width + 20,
                height: rect.height + 20
            });
        }
    }, [currentStep, currentTutorial.target]);

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

    const getTooltipPosition = () => {
        const { position } = currentTutorial;
        const baseClasses = "absolute z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-indigo-200";

        switch (position) {
            case 'top':
                return `${baseClasses} bottom-full mb-4 left-1/2 -translate-x-1/2`;
            case 'bottom':
                return `${baseClasses} top-full mt-4 left-1/2 -translate-x-1/2`;
            case 'left':
                return `${baseClasses} right-full mr-4 top-1/2 -translate-y-1/2`;
            case 'right':
                return `${baseClasses} left-full ml-4 top-1/2 -translate-y-1/2`;
            default:
                return baseClasses;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* Overlay with spotlight effect */}
            {currentTutorial.target !== 'finish-tutorial' && (
                <div className="fixed inset-0 z-40 pointer-events-none">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        <defs>
                            <mask id="spotlight-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <rect
                                    x={spotlightPosition.left}
                                    y={spotlightPosition.top}
                                    width={spotlightPosition.width}
                                    height={spotlightPosition.height}
                                    rx="12"
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            fill="rgba(0, 0, 0, 0.7)"
                            mask="url(#spotlight-mask)"
                        />
                    </svg>
                </div>
            )}

            {/* Mock Teacher Dashboard */}
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div id="dashboard-header" className="mb-8 relative">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">선생님 대시보드</h1>
                    <p className="text-gray-500">학생들의 학습 현황을 확인하세요</p>

                    {currentStep === 0 && (
                        <div className={getTooltipPosition()}>
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="text-gray-500 text-sm">전체 학생</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">24명</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-gray-500 text-sm">평균 진행률</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">78%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-500 text-sm">오늘 활동</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">18명</p>
                    </div>
                </div>

                {/* Student List */}
                <div id="student-list" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">학생 목록</h2>
                        <button id="add-student-btn" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            학생 추가
                        </button>
                    </div>

                    <div className="space-y-4">
                        {MOCK_STUDENTS.map((student, index) => (
                            <div
                                key={student.id}
                                id={`student-card-${index}`}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-bold">{student.name[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{student.name}</h3>
                                        <p className="text-sm text-gray-500">{student.grade} · {student.subject}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{student.progress}%</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{student.recent}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tooltip for student list */}
                    {currentStep === 1 && (
                        <div className={getTooltipPosition()}>
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tooltip for student card */}
                    {currentStep === 2 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-indigo-200">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tooltip for add button */}
                    {currentStep === 3 && (
                        <div className="absolute top-16 right-0 mr-4 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-indigo-200">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                                <button
                                    onClick={handleNext}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Step Modal */}
            {currentStep === 4 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{currentTutorial.title}</h2>
                        <p className="text-gray-600 mb-6">{currentTutorial.description}</p>
                        <button
                            onClick={completeTutorial}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            대시보드 시작하기
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
        </div>
    );
}
