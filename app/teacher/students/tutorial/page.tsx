'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Search, Filter, Download, Plus, MoreHorizontal, ChevronDown, User, Phone, FileText, AlertCircle, Sparkles } from 'lucide-react';

// 모의 학생 데이터
const MOCK_STUDENTS = [
    { id: 1, name: "박민수", className: "고2 수리논술 심화반 A", phone: "010-1234-5678", progressRate: 42, progressTrend: "down", weakness: "삼각함수", status: "danger", lastLogin: "방금 전" },
    { id: 2, name: "이영희", className: "고2 수리논술 심화반 A", phone: "010-9876-5432", progressRate: 87, progressTrend: "up", weakness: "미분계수", status: "active", lastLogin: "1시간 전" },
    { id: 3, name: "김철수", className: "고1 수학 개념완성반 B", phone: "010-5555-4444", progressRate: 23, progressTrend: "down", weakness: "나머지정리", status: "warning", lastLogin: "3일 전" },
];

type TutorialStep = {
    title: string;
    description: string;
    target: string;
    position: 'top' | 'bottom' | 'left' | 'right';
};

const TUTORIAL_STEPS: TutorialStep[] = [
    { title: '📊 수강생 관리 센터', description: '모든 학생의 학습 현황을 한눈에 확인하고 관리할 수 있는 통합 워크스페이스입니다.', target: 'page-header', position: 'bottom' },
    { title: '🔍 검색 & 필터', description: '이름이나 전화번호로 학생을 빠르게 찾을 수 있습니다. 클래스별 필터링도 가능해요.', target: 'search-bar', position: 'bottom' },
    { title: '👤 학생 카드', description: '각 학생의 진도율, 취약점, 최근 접속 기록을 실시간으로 확인하세요. 호버하면 빠른 액션 버튼이 나타납니다.', target: 'student-card-0', position: 'top' },
    { title: '⚡ 빠른 액션', description: '전화 걸기, 상세 리포트 보기, 추가 옵션 등 자주 사용하는 기능에 빠르게 접근할 수 있어요.', target: 'quick-actions', position: 'left' },
    { title: '➕ 학생 등록', description: '신규생을 등록하거나 엑셀로 데이터를 내보낼 수 있습니다.', target: 'add-student-btn', position: 'left' },
    { title: '✨ 시작할 준비 완료!', description: '이제 효율적으로 학생들을 관리할 수 있습니다!', target: 'finish', position: 'bottom' }
];

export default function StudentManagementTutorial() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [selectedClass, setSelectedClass] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const currentTutorial = TUTORIAL_STEPS[currentStep];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-50 text-blue-600';
            case 'warning': return 'bg-yellow-50 text-yellow-600';
            case 'danger': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    useEffect(() => {
        if (currentTutorial.target === 'finish') return;

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
        localStorage.setItem('teacher_students_tutorial_completed', 'true');
        router.push('/teacher/students');
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
            {/* Overlay with spotlight */}
            {currentTutorial.target !== 'finish' && (
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
                        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#spotlight-mask)" />
                    </svg>
                </div>
            )}

            {/* Mock Student Management Page */}
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div id="page-header" className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6 relative">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-6 h-6 text-blue-600" />
                            수강생 통합 관리
                        </h1>
                        <p className="text-gray-500 mt-1">
                            전체 수강생 <span className="font-bold text-gray-900">{MOCK_STUDENTS.length}명</span> 중 <span className="font-bold text-blue-600">{MOCK_STUDENTS.length}명</span>이 표시되고 있습니다.
                        </p>
                    </div>

                    <div id="add-student-btn" className="flex gap-2">
                        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
                            <Download className="w-4 h-4" />
                            엑셀 다운로드
                        </button>
                        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-colors shadow-md">
                            <Plus className="w-4 h-4" />
                            신규생 등록
                        </button>
                    </div>

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
                                <button onClick={handleNext} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search & Filter Toolbar */}
                <div id="search-bar" className="flex flex-col md:flex-row gap-3 relative">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 pl-4 pr-10 py-3 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="All">전체 클래스 보기</option>
                            <option value="심화반">고2 수리논술 심화반 A</option>
                            <option value="개념완성반">고1 수학 개념완성반 B</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="이름 또는 전화번호 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50 shadow-sm">
                        <Filter className="w-4 h-4" />
                        상세 필터
                    </button>

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
                                <button onClick={handleNext} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                                    다음 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Student List */}
                <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-3">학생 정보</div>
                        <div className="col-span-3">소속 클래스</div>
                        <div className="col-span-2">학습 진도율</div>
                        <div className="col-span-2">최대 취약점</div>
                        <div className="col-span-2 text-right">관리</div>
                    </div>

                    {MOCK_STUDENTS.map((student, index) => {
                        const isOnline = student.lastLogin.includes('전') && !student.lastLogin.includes('일');

                        return (
                            <div
                                key={student.id}
                                id={`student-card-${index}`}
                                className="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center relative"
                            >
                                <div className="col-span-3 w-full flex items-center gap-4">
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getStatusColor(student.status)}`}>
                                            {student.name[0]}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                            {student.name}
                                            {student.status === 'danger' && (
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">{student.phone}</p>
                                    </div>
                                </div>

                                <div className="col-span-3 w-full pl-0 md:pl-2">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                        {student.className}
                                    </span>
                                </div>

                                <div className="col-span-2 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-gray-800 text-lg">{student.progressRate}%</span>
                                        <span className={`text-[10px] font-bold flex items-center gap-1 ${student.progressTrend === 'up' ? 'text-blue-600' : 'text-red-500'}`}>
                                            {student.progressTrend === 'up' ? '▲' : '▼'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${student.progressRate >= 70 ? 'bg-blue-500' : student.progressRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${student.progressRate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {student.weakness}
                                        </span>
                                    </div>
                                </div>

                                <div id={index === 0 ? "quick-actions" : undefined} className="col-span-2 w-full flex justify-start md:justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                                    <button className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="전화 걸기">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="상세 리포트">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                {currentStep === 2 && index === 0 && (
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
                                            <button onClick={handleNext} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                                                다음 <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && index === 0 && (
                                    <div className="absolute top-1/2 right-0 mr-4 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-indigo-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                                            <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                                            <button onClick={handleNext} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                                                다음 <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Add Student Button Tooltip */}
                {currentStep === 4 && (
                    <div className="fixed top-24 right-10 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-indigo-200">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{currentTutorial.title}</h3>
                            <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">{currentTutorial.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
                            <button onClick={handleNext} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                                다음 <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Final Step Modal */}
            {currentStep === 5 && (
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
                            수강생 관리 시작하기
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
