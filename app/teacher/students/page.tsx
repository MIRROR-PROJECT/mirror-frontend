"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Filter, Download, Plus,
  MoreHorizontal, ChevronDown, User,
  Clock, TrendingUp, AlertCircle, Phone, FileText
} from "lucide-react";

const STUDENTS = [
  {
    id: 1,
    name: "박민수",
    className: "고2 수리논술 심화반 A",
    phone: "010-1234-5678",
    progressRate: 42,
    progressTrend: "down",
    weakness: "삼각함수",
    status: "danger",
    lastLogin: "방금 전",
  },
  {
    id: 2,
    name: "이영희",
    className: "고2 수리논술 심화반 A",
    phone: "010-9876-5432",
    progressRate: 87,
    progressTrend: "up",
    weakness: "미분계수",
    status: "active",
    lastLogin: "1시간 전",
  },
  {
    id: 3,
    name: "김철수",
    className: "고1 수학 개념완성반 B",
    phone: "010-5555-4444",
    progressRate: 23,
    progressTrend: "down",
    weakness: "나머지정리",
    status: "warning",
    lastLogin: "3일 전",
  },
  {
    id: 4,
    name: "최유리",
    className: "고2 수리논술 심화반 A",
    phone: "010-1111-2222",
    progressRate: 76,
    progressTrend: "up",
    weakness: "수열의 극한",
    status: "active",
    lastLogin: "20분 전",
  },
];

export default function StudentManagementPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = STUDENTS.filter(student => {
    const matchClass = selectedClass === "All" || student.className.includes(selectedClass);
    const matchSearch = student.name.includes(searchQuery) || student.phone.includes(searchQuery);
    return matchClass && matchSearch;
  });

  // 상태별 컬러 헬퍼 함수 (코드가 훨씬 깔끔해집니다)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-50 text-blue-600';
      case 'warning': return 'bg-yellow-50 text-yellow-600';
      case 'danger': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  // 첫 방문 시 튜토리얼로 리다이렉트 (단, 대시보드 튜토리얼 완료 후)
  useEffect(() => {
    const dashboardTutorialCompleted = localStorage.getItem('teacher_tutorial_completed');
    const studentsTutorialCompleted = localStorage.getItem('teacher_students_tutorial_completed');
    const hasRedirected = sessionStorage.getItem('students_has_redirected');

    // 이미 리다이렉트했으면 무시
    if (hasRedirected) return;

    if (!dashboardTutorialCompleted) {
      // 대시보드 튜토리얼을 먼저 완료해야 함
      sessionStorage.setItem('students_has_redirected', 'true');
      router.push('/dashboard?role=teacher');
    } else if (!studentsTutorialCompleted) {
      // 대시보드는 끝났지만 수강생 관리는 안 끝남
      sessionStorage.setItem('students_has_redirected', 'true');
      router.push('/teacher/students/tutorial');
    }
  }, [router]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* 1. 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            수강생 통합 관리
          </h1>
          <p className="text-gray-500 mt-1">
            전체 수강생 <span className="font-bold text-gray-900">{STUDENTS.length}명</span> 중 <span className="font-bold text-blue-600">{filteredStudents.length}명</span>이 표시되고 있습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </button>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-colors shadow-md">
            <Plus className="w-4 h-4" />
            신규생 등록
          </button>
        </div>
      </div>

      {/* 2. 검색 및 필터 툴바 */}
      <div className="flex flex-col md:flex-row gap-3">
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
      </div>

      {/* 3. 학생 리스트 */}
      <div className="space-y-3">
        {/* 리스트 헤더 (Desktop Only) */}
        {/* ✨ 수정: px-6 -> px-4 (리스트 아이템 패딩과 맞춤) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">학생 정보</div>
          <div className="col-span-3">소속 클래스</div>
          <div className="col-span-2">학습 진도율</div>
          <div className="col-span-2">최대 취약점</div>
          <div className="col-span-2 text-right">관리</div>
        </div>

        {filteredStudents.map((student) => {
          // 최근 접속 여부 (간단 로직)
          const isOnline = student.lastLogin.includes('전') && !student.lastLogin.includes('일');

          return (
            <div
              key={student.id}
              className="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center"
            >

              {/* 1. 학생 정보 (이름, 상태) */}
              <div className="col-span-3 w-full flex items-center gap-4">
                <div className="relative">
                  {/* Avatar Circle */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getStatusColor(student.status)}`}>
                    {student.name[0]}
                  </div>
                  {/* Status Dot */}
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-white rounded-full 
                     ${isOnline ? 'bg-green-500' : 'bg-gray-300'}
                  `}></span>
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

              {/* 2. 클래스 정보 */}
              <div className="col-span-3 w-full pl-0 md:pl-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                  {student.className}
                </span>
              </div>

              {/* 3. 학습 진도율 */}
              <div className="col-span-2 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-800 text-lg">{student.progressRate}%</span>
                  <span className={`text-[10px] font-bold flex items-center gap-1 
                    ${student.progressTrend === 'up' ? 'text-blue-600' : 'text-red-500'}
                  `}>
                    {student.progressTrend === 'up' ? '▲' : '▼'}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${student.progressRate >= 70 ? 'bg-blue-500' :
                      student.progressRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${student.progressRate}%` }}
                  />
                </div>
              </div>

              {/* 4. 취약점 */}
              <div className="col-span-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {student.weakness}
                  </span>
                </div>
              </div>

              {/* 5. 관리 액션 (모바일: 항상 보임 / 데스크탑: 호버 시 보임) */}
              <div className="col-span-2 w-full flex justify-start md:justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
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

            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-bold">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}