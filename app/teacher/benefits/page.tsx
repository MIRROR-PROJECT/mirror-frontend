'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp, Users, Clock, Target, Sparkles, BarChart, MessageSquare, CheckCircle2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function TeacherBenefitsPage() {
    const router = useRouter();
    const { t } = useLanguage();
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
                        {t('teacher.benefits.hero.badge')}
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {t('teacher.benefits.hero.title')} <br className="hidden md:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block md:inline mt-2 md:mt-0">
                            {t('teacher.benefits.hero.titleAccent')}
                        </span>
                    </h1>
                    <p
                        className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t('teacher.benefits.hero.subtitle') }}
                    />
                </div>

                {/* 핵심 이점 카드 */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('teacher.benefits.cards.revenue.title')}</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {t('teacher.benefits.cards.revenue.desc')}
                        </p>
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('teacher.benefits.cards.revenue.footer')}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Clock className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('teacher.benefits.cards.time.title')}</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {t('teacher.benefits.cards.time.desc')}
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('teacher.benefits.cards.time.footer')}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-200 transition-all group">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('teacher.benefits.cards.cost.title')}</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {t('teacher.benefits.cards.cost.desc')}
                        </p>
                        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('teacher.benefits.cards.cost.footer')}
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
                            {t('teacher.benefits.tabs.dashboard')}
                        </button>
                        <button
                            onClick={() => setCurrentPreview('students')}
                            className={`flex-1 px-8 py-6 font-bold text-lg transition-all ${currentPreview === 'students'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="w-5 h-5 inline-block mr-2" />
                            {t('teacher.benefits.tabs.students')}
                        </button>
                    </div>

                    <div className="p-8">
                        {currentPreview === 'dashboard' ? (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('teacher.benefits.preview.dashboard.title')}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {t('teacher.benefits.preview.dashboard.desc')}
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Target className="w-6 h-6 text-indigo-600" />
                                            <h4 className="font-bold text-gray-900">{t('teacher.benefits.preview.dashboard.briefing.title')}</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {t('teacher.benefits.preview.dashboard.briefing.desc')}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MessageSquare className="w-6 h-6 text-purple-600" />
                                            <h4 className="font-bold text-gray-900">{t('teacher.benefits.preview.dashboard.care.title')}</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {t('teacher.benefits.preview.dashboard.care.desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('teacher.benefits.preview.students.title')}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {t('teacher.benefits.preview.students.desc')}
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-lg text-blue-600">{t('teacher.benefits.preview.students.student1.name')[0]}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{t('teacher.benefits.preview.students.student1.name')}</h4>
                                            <p className="text-sm text-gray-500">{t('teacher.benefits.preview.students.student1.desc')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                📞 {t('teacher.benefits.preview.students.call')}
                                            </button>
                                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                📊 {t('teacher.benefits.preview.students.report')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-lg text-indigo-600">{t('teacher.benefits.preview.students.student2.name')[0]}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{t('teacher.benefits.preview.students.student2.name')}</h4>
                                            <p className="text-sm text-gray-500">{t('teacher.benefits.preview.students.student2.desc')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                📞 {t('teacher.benefits.preview.students.call')}
                                            </button>
                                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                📊 {t('teacher.benefits.preview.students.report')}
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
                        <h2 className="text-3xl font-bold mb-4">{t('teacher.benefits.caseStudy.title')}</h2>
                        <p
                            className="text-xl opacity-90 mb-8 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: t('teacher.benefits.caseStudy.quote') }}
                        />
                        <div className="flex justify-center gap-8 text-center">
                            <div>
                                <p className="text-4xl font-black mb-2">{t('teacher.benefits.caseStudy.stat1.value')}</p>
                                <p className="text-sm opacity-75">{t('teacher.benefits.caseStudy.stat1.label')}</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black mb-2">{t('teacher.benefits.caseStudy.stat2.value')}</p>
                                <p className="text-sm opacity-75">{t('teacher.benefits.caseStudy.stat2.label')}</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black mb-2">{t('teacher.benefits.caseStudy.stat3.value')}</p>
                                <p className="text-sm opacity-75">{t('teacher.benefits.caseStudy.stat3.label')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {t('teacher.benefits.cta.title')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        {t('teacher.benefits.cta.desc')}
                    </p>
                    <button
                        onClick={handleStartNow}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center gap-3 mx-auto group"
                    >
                        {t('teacher.benefits.cta.button')}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        {t('teacher.benefits.cta.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
