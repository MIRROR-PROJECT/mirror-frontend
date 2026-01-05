'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp, Users, Clock, Target, Sparkles, BarChart, MessageSquare, CheckCircle2, Zap } from 'lucide-react';
import { useState } from 'react';

export default function TeacherBenefitsPage() {
    const router = useRouter();
    const [currentPreview, setCurrentPreview] = useState<'dashboard' | 'students'>('dashboard');

    const handleStartNow = () => {
        localStorage.setItem('teacher_from_benefits', 'true');
        router.push('/payment');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" />
                        AI 선생님 도구 - Mirror
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                        학원의 수익과 효율을<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">동시에 끌어올리세요</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Mirror는 단순한 관리 툴이 아닙니다. 학생 관리부터 AI 피드백까지,<br />
                        학원의 모든 운영을 <span className="font-bold text-indigo-600">자동화하고 고도화</span>하는 완전한 시스템입니다.
                    </p>
                </div>

                {/* 핵심 이점 카드 */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">매출 30% 증가</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            데이터 기반 학습 관리로 학생 성적 향상 → 학부모 만족도 상승 → 재등록률 급증
                        </p>
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            평균 재등록률 87%
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Clock className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">관리 시간 70% 절감</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            수작업 학생 관리, 리포트 작성, 상담 준비가 모두 자동화됩니다
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            하루 3시간 절약
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">학생 1명당 관리비 80% 감소</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            AI가 24시간 학생을 케어하고, 선생님은 정말 중요한 일에만 집중
                        </p>
                        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            수강생 200% 증가 가능
                        </div>
                    </div>
                </div>

                {/* 기능 미리보기 탭 */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 mb-16">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setCurrentPreview('dashboard')}
                            className={`flex-1 px-8 py-6 font-bold text-lg transition-all ${currentPreview === 'dashboard'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <BarChart className="w-5 h-5 inline-block mr-2" />
                            워크스페이스 대시보드
                        </button>
                        <button
                            onClick={() => setCurrentPreview('students')}
                            className={`flex-1 px-8 py-6 font-bold text-lg transition-all ${currentPreview === 'students'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="w-5 h-5 inline-block mr-2" />
                            수강생 통합 관리
                        </button>
                    </div>

                    <div className="p-8">
                        {currentPreview === 'dashboard' ? (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 실시간 학급 분석 대시보드</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    매일 아침 눈을 뜨면, AI가 어제 밤 학생들의 학습 패턴을 분석해 오늘의 수업 전략을 제시합니다.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Target className="w-6 h-6 text-indigo-600" />
                                            <h4 className="font-bold text-gray-900">Daily Briefing</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            "어제 밤 30명 이상이 삼각함수 합성에서 막혔습니다. 오늘 수업 도입부 10분 복습 권장합니다."
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MessageSquare className="w-6 h-6 text-purple-600" />
                                            <h4 className="font-bold text-gray-900">케어 알림</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            "박민수 학생 성적 20점 급락. 3일 연속 미접속. 즉시 상담 필요"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">👥 수강생 한눈에 관리</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    모든 학생의 진도율, 취약점, 최근 활동을 실시간으로 확인하고, 클릭 한 번으로 전화 상담까지.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-lg text-blue-600">박</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">박민수 · 고2</h4>
                                            <p className="text-sm text-gray-500">진도율 42% ▼ · 취약점: 삼각함수</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                📞 전화
                                            </button>
                                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                📊 리포트
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-lg text-indigo-600">이</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">이영희 · 고2</h4>
                                            <p className="text-sm text-gray-500">진도율 87% ▲ · 취약점: 미분계수</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                📞 전화
                                            </button>
                                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                📊 리포트
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 실제 사례 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center mb-16">
                    <div className="max-w-3xl mx-auto">
                        <Zap className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">강남 A학원의 실제 사례</h2>
                        <p className="text-xl opacity-90 mb-8 leading-relaxed">
                            "Mirror 도입 3개월 만에 학생 수 40명 → 82명 증가.<br />
                            학부모 상담 시간만 하루 2시간 절약되면서<br />
                            더 많은 학생을 받을 수 있게 되었습니다."
                        </p>
                        <div className="flex justify-center gap-8 text-center">
                            <div>
                                <p className="text-4xl font-black mb-2">+105%</p>
                                <p className="text-sm opacity-75">수강생 증가</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black mb-2">-70%</p>
                                <p className="text-sm opacity-75">관리 시간</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black mb-2">87%</p>
                                <p className="text-sm opacity-75">재등록률</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        지금 시작하고, 학원을 한 단계 업그레이드하세요
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        월 15,000원으로 시작하는 학원 혁신. 첫 달 무료입니다.
                    </p>
                    <button
                        onClick={handleStartNow}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center gap-3 mx-auto group"
                    >
                        지금 바로 시작하기
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        💳 결제 후 즉시 모든 기능 사용 가능 · 언제든 해지 가능
                    </p>
                </div>
            </div>
        </div>
    );
}
