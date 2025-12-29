"use client";
import { Clock, Calendar, CreditCard } from "lucide-react";

export default function ParentDashboard() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">자녀 학습 현황 📊</h1>
      
      {/* 자녀 요약 카드 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">김민수 학생</h2>
        <p className="text-indigo-100 text-sm mb-6">고등수학 집중반 | 출석률 98%</p>
        
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-indigo-200 mb-1">이번 주 학습 시간</p>
            <p className="text-3xl font-bold">14시간 30분</p>
          </div>
          <div className="h-full w-px bg-white/20"></div>
          <div>
            <p className="text-xs text-indigo-200 mb-1">최근 모의고사</p>
            <p className="text-3xl font-bold">상위 12% <span className="text-sm font-normal text-green-300">▲</span></p>
          </div>
        </div>
      </div>

      {/* 알림 사항 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
           <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-400"/> 결제 예정 내역</h3>
           <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
             <div>
               <p className="font-bold text-gray-800">1월 수강료 (수학)</p>
               <p className="text-xs text-gray-500">결제일: 12월 29일 (오늘)</p>
             </div>
             <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold">결제하기</button>
           </div>
        </div>
      </div>
    </div>
  );
}