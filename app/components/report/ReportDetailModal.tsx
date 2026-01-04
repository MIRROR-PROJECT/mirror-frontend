"use client";

import { useState } from "react";
import { DailyReport } from "./types";
import { X, Clock, CheckCircle2, XCircle, Brain, TrendingUp, Calendar } from "lucide-react";

interface ReportDetailModalProps {
    report: DailyReport | null;
    onClose: () => void;
}

export default function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
    if (!report) return null;

    const studyTimeHours = Math.floor(report.total_study_time_minutes / 60);
    const studyTimeMinutes = report.total_study_time_minutes % 60;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>{report.day_of_week}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{report.date} 학습 리포트</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* 내용 */}
                <div className="p-6 space-y-6">
                    {/* 요약 통계 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">학습 시간</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {studyTimeHours}h {studyTimeMinutes}m
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">완료 과제</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {report.completed_tasks}/{report.total_tasks}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">성취도</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {report.achievement_rate}%
                            </p>
                        </div>
                    </div>

                    {/* 과목별 미션 완료 현황 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">과목별 미션 완료</h3>
                        <div className="space-y-3">
                            {report.subjects.map((subject, idx) => {
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{subject.name}</span>
                                            <span className="text-sm text-gray-500">
                                                {subject.completed_missions}/{subject.total_missions} ({subject.completion_rate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-full rounded-full transition-all ${subject.completion_rate >= 80 ? 'bg-green-500' :
                                                        subject.completion_rate >= 60 ? 'bg-blue-500' :
                                                            subject.completion_rate >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                                                    }`}
                                                style={{ width: `${subject.completion_rate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI 피드백 */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                🤖
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 flex items-center gap-1">
                                    <Brain className="w-4 h-4" /> AI 튜터의 종합 피드백
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            {report.ai_summary}
                        </p>

                        {report.ai_highlights && report.ai_highlights.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {report.ai_highlights.map((highlight, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <p className="text-sm text-gray-600">{highlight}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 집중도 점수 (부모/강사용) */}
                    {report.focus_score !== undefined && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">집중도 점수</h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">전체 집중도</span>
                                    <span className="text-2xl font-bold text-blue-600">{report.focus_score}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-full rounded-full ${report.focus_score >= 80 ? 'bg-green-500' :
                                            report.focus_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                            }`}
                                        style={{ width: `${report.focus_score}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
