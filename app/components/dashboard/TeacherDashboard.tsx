"use client";

import { useState, useEffect } from "react";
import {
  Sparkles, Printer, Calendar, CheckCircle2,
  BarChart, Clock, MessageSquare, ChevronDown,
  Brain, Check, FileText, ArrowRight, User, AlertCircle,
  Plus, X, Search, UserPlus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addStudentToClass, getMyClasses, ClassInfo } from "@/app/lib/api/teacher";

// --- 타입 정의 ---
interface StudentCare {
  id: number;
  name: string;
  issue: string;
  urgent: boolean;
}

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
}

interface ClassData {
  id: number;
  name: string;
  studentCount: number;
  avgProgress: number;
  briefing: {
    mood: string;
    moodDesc: string;
    weakness: string;
    weaknessRate: number;
    careAction: string;
  };
  careList: StudentCare[];
  students: Student[];
}

// 더미 학생 데이터 (검색용)
const DUMMY_STUDENTS: Student[] = [
  { id: 1, name: "김민수", email: "minsu@example.com", grade: "고2" },
  { id: 2, name: "이지은", email: "jieun@example.com", grade: "고2" },
  { id: 3, name: "박서준", email: "seojun@example.com", grade: "고1" },
  { id: 4, name: "최유나", email: "yuna@example.com", grade: "고3" },
  { id: 5, name: "정하늘", email: "haneul@example.com", grade: "고2" },
];

export default function TeacherDashboard({ user, isTutorial = false }: { user: any; isTutorial?: boolean }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(!isTutorial);

  const [selectedClassId, setSelectedClassId] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // 모달 상태
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // 반 생성 폼
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("고2");

  // 학생 추가 폼
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState<number>(11);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // 첫 방문 시 benefits 페이지로 리다이렉트 (결제 이전)
  useEffect(() => {
    const fromBenefits = localStorage.getItem('teacher_from_benefits');
    const tutorialCompleted = localStorage.getItem('teacher_tutorial_completed');
    const hasRedirected = sessionStorage.getItem('teacher_has_redirected');

    // 이미 리다이렉트했으면 무시
    if (hasRedirected) return;

    if (!fromBenefits) {
      // 아직 benefits 페이지를 보지 않았으면 거기로 보냄
      sessionStorage.setItem('teacher_has_redirected', 'true');
      router.push('/teacher/benefits');
    } else if (!tutorialCompleted) {
      // benefits는 봤지만 튜토리얼은 안 했으면 튜토리얼로
      sessionStorage.setItem('teacher_has_redirected', 'true');
      router.push('/teacher/tutorial');
    }
  }, [router]);

  useEffect(() => {
    const now = new Date();
    const formatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][now.getDay()]})`;
    setCurrentDate(formatted);
  }, []);

  // 실제 API에서 반 목록 가져오기 (튜토리얼 모드가 아닐 때만)
  useEffect(() => {
    // 튜토리얼 모드면 mock 데이터 사용
    if (isTutorial) {
      setClasses([{
        id: 1,
        name: "고2 수리논술 심화반 A",
        studentCount: 3,
        avgProgress: 78,
        briefing: {
          mood: "🔥 자습 열기 고조",
          moodDesc: "어제 밤 10시 이후 접속자가 30명 이상이었습니다.",
          weakness: "삼각함수 합성",
          weaknessRate: 65,
          careAction: "수업 도입부 '합성 공식' 10분 복습"
        },
        careList: [
          { id: 101, name: "박민수", issue: "성적 급락 (▼20점)", urgent: true },
          { id: 102, name: "최유리", issue: "진로 상담 요청", urgent: false }
        ],
        students: [
          { id: 1, name: "김민수", email: "minsu@example.com", grade: "고2" },
          { id: 2, name: "이지은", email: "jieun@example.com", grade: "고2" },
          { id: 5, name: "정하늘", email: "haneul@example.com", grade: "고2" },
        ]
      }]);
      setIsLoadingClasses(false);
      return;
    }

    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const result = await getMyClasses();

        if (result.success && result.data) {
          // API 응답을 UI 포맷으로 변환
          const formattedClasses: ClassData[] = result.data.classes.map((cls, index) => ({
            id: index + 1,
            name: cls.class_name,
            studentCount: cls.student_count,
            avgProgress: 0, // TODO: 실제 진도율 API 연동 필요
            briefing: {
              mood: "📊 데이터 수집 중",
              moodDesc: "학생들의 학습 데이터를 분석하고 있습니다.",
              weakness: "-",
              weaknessRate: 0,
              careAction: "학생 데이터가 쌓이면 AI 분석이 시작됩니다."
            },
            careList: [],
            students: [] // TODO: 학생 목록은 별도 API로 조회
          }));

          setClasses(formattedClasses);

          // 첫 번째 반 선택
          if (formattedClasses.length > 0) {
            setSelectedClassId(1);
          }
        }
      } catch (error) {
        console.error('반 목록 조회 실패:', error);
        // 에러 시에도 기본 데이터 사용
        setClasses([{
          id: 1,
          name: "내 반",
          studentCount: 0,
          avgProgress: 0,
          briefing: {
            mood: "🎯 새로운 시작",
            moodDesc: "반을 만들고 학생을 추가해보세요.",
            weakness: "-",
            weaknessRate: 0,
            careAction: "학생을 추가하여 시작하세요."
          },
          careList: [],
          students: []
        }]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // 반 생성 핸들러
  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      alert("반 이름을 입력해주세요.");
      return;
    }

    const newClass: ClassData = {
      id: classes.length + 1,
      name: newClassName,
      studentCount: 0,
      avgProgress: 0,
      briefing: {
        mood: "🎯 새로운 반",
        moodDesc: "아직 학생이 등록되지 않았습니다.",
        weakness: "-",
        weaknessRate: 0,
        careAction: "학생을 추가하여 시작하세요."
      },
      careList: [],
      students: []
    };

    setClasses([...classes, newClass]);
    setNewClassName("");
    setNewClassGrade("고2");
    setShowCreateClassModal(false);
    setSelectedClassId(newClass.id);
    alert(`"${newClassName}" 반이 생성되었습니다!`);
  };

  // 학생 추가 핸들러 (실제 API 호출)
  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      alert("학생 이름과 전화번호를 입력해주세요.");
      return;
    }

    // 전화번호 형식 체크 (010-XXXX-XXXX)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(newStudentPhone)) {
      alert("전화번호는 010-XXXX-XXXX 형식으로 입력해주세요.");
      return;
    }

    try {
      setIsAddingStudent(true);

      const result = await addStudentToClass({
        student_name: newStudentName,
        phone_number: newStudentPhone,
        class_name: currentClass.name,
        email: newStudentEmail || undefined,
        school_grade: newStudentGrade
      });

      if (result.success) {
        // 로컬 상태 업데이트
        const newStudent: Student = {
          id: Date.now(),
          name: result.data!.student_name,
          email: result.data!.email,
          grade: `고${newStudentGrade - 9}`
        };

        const updatedClasses = classes.map(cls => {
          if (cls.id === selectedClassId) {
            return {
              ...cls,
              students: [...cls.students, newStudent],
              studentCount: cls.studentCount + 1
            };
          }
          return cls;
        });

        setClasses(updatedClasses);

        // 폼 초기화
        setNewStudentName("");
        setNewStudentPhone("");
        setNewStudentEmail("");
        setNewStudentGrade(11);
        setShowAddStudentModal(false);

        alert(`${result.data!.student_name} 학생이 ${currentClass.name}에 추가되었습니다!`);
      }
    } catch (error: any) {
      alert(`학생 추가 실패: ${error.message}`);
    } finally {
      setIsAddingStudent(false);
    }
  };

  // 로딩 중이거나 반이 없으면 로딩 화면 표시
  if (isLoadingClasses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">반 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 반이 없으면 생성 유도
  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">아직 반이 없습니다</h2>
          <p className="text-gray-600 mb-6">첫 번째 반을 만들고 학생들을 추가해보세요!</p>
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            + 새 반 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50/50 min-h-screen">

      {/* 1. 상단 헤더 & 반 선택기 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full w-fit">
            <Calendar className="w-4 h-4" /> {currentDate || "날짜 로딩 중..."}
          </span>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 text-3xl font-black text-gray-900 hover:text-blue-700 transition-colors"
            >
              {currentClass.name}
              <ChevronDown className={`w-7 h-7 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-left">
                  <div className="p-2">
                    <p className="text-xs font-bold text-gray-400 px-3 py-2 uppercase tracking-wider">My Classes</p>
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex justify-between items-center transition-colors
                          ${selectedClassId === cls.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        {cls.name}
                        {selectedClassId === cls.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowCreateClassModal(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        새 반 만들기
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 우측 클래스 요약 정보 */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-bold mb-0.5">총 수강생</span>
              <span className="text-base font-black text-gray-900 flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                {currentClass.studentCount}명
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                평균 진도율
                <div className="relative group">
                  <Brain className="w-3 h-3 text-blue-500 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-50">
                    <p className="font-medium leading-relaxed">
                      전체 수강생의 평균 학습 진도율입니다.
                      각 학생의 커리큘럼 완료 비율을 기준으로 계산됩니다.
                    </p>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </span>
              <span className={`text-xl font-black ${currentClass.avgProgress >= 70 ? 'text-blue-600' : 'text-orange-500'}`}>
                {currentClass.avgProgress}%
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            학생 추가
          </button>
        </div>
      </div>

      {/* 2. 데일리 학습 브리핑 (메인 섹션) */}
      <section data-tutorial="daily-briefing" className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gray-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BarChart className="w-7 h-7 text-yellow-400" />
              Daily Class Briefing
            </h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              <span className="text-white font-bold underline decoration-yellow-400/50 underline-offset-4">{currentClass.name}</span> 학생들의 어제 활동 분석 리포트입니다.
            </p>
          </div>
          <Link href="/report">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all flex items-center gap-2 backdrop-blur-sm">
              <FileText className="w-4 h-4" />
              상세 리포트 보기
            </button>
          </Link>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

          {/* A. 학습 요약 (왼쪽) */}
          <div className="flex flex-col h-full lg:border-r lg:border-gray-100 lg:pr-12">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-lg">
              <Clock className="w-5 h-5 text-blue-600" /> 어제 학습 요약
            </h3>

            <div className="space-y-4 flex-1">
              {/* Mood Card */}
              <div data-tutorial="briefing-mood" className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl shadow-sm shrink-0">
                  {currentClass.avgProgress >= 70 ? '🔥' : '💧'}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 mb-1">{currentClass.briefing.mood}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentClass.briefing.moodDesc}
                  </p>
                </div>
              </div>

              {/* Weakness Card */}
              <div data-tutorial="briefing-weakness" className="flex gap-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white border border-red-100 flex items-center justify-center shadow-sm shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 mb-1">
                    최대 취약점: <span className="text-red-600 underline decoration-red-200 underline-offset-2">{currentClass.briefing.weakness}</span>
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    해당 유형 오답률이 <span className="text-red-600 font-black">{currentClass.briefing.weaknessRate}%</span>에 달합니다. 집중적인 개념 보충이 필요합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. 오늘의 케어 가이드 (오른쪽) */}
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6 text-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> 오늘의 추천 액션
            </h3>

            <div data-tutorial="ai-recommendation" className="flex-1 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-blue-600" />
              </div>

              <div className="relative z-10">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-3 inline-block">AI Recommendation</span>
                <h4 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                  "{currentClass.briefing.careAction}"
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  AI가 분석한 데이터를 바탕으로 가장 효과적인 수업 도입부 활동을 제안합니다.
                </p>

                <button className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2">
                  수업 자료에 추가하기 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 하단 2단 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 3. AI 오답 클리닉 (문제지 생성) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-600" /> AI 오답 클리닉
          </h2>

          <div data-tutorial="ai-clinic" className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* 배경 애니메이션 효과 */}
            <div className="absolute -right-10 -top-10 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur border border-white/10">
                    {currentClass.name} 전용
                  </span>
                  <span className="bg-purple-400/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur border border-purple-300/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-3">맞춤형 보충 문제지 생성</h3>
                <p className="text-purple-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90">
                  취약 유형인 <span className="font-bold text-white underline decoration-purple-300 underline-offset-4">{currentClass.briefing.weakness}</span> 관련 문항을
                  자동으로 선별하여 PDF로 생성합니다.
                </p>
              </div>

              <button className="whitespace-nowrap bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-purple-50 hover:scale-105 transition-all flex items-center gap-2 group/btn">
                <Printer className="w-5 h-5" />
                문제지 만들기
                <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 -ml-2 group-hover/btn:ml-0 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. 학생 케어 체크리스트 */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-500" /> 케어 필요 학생 ({currentClass.careList.length})
          </h2>

          <div data-tutorial="care-list" className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm h-full min-h-[200px]">
            {currentClass.careList.length > 0 ? (
              <div className="space-y-3">
                {currentClass.careList.map((student) => (
                  <div key={student.id} className="group">
                    <div className={`p-4 border rounded-2xl flex gap-3 items-start transition-all duration-200
                        ${student.urgent
                        ? 'bg-red-50/50 border-red-100 hover:border-red-200 hover:shadow-md'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-sm'}
                      `}>
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 animate-pulse ${student.urgent ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-gray-900">{student.name}</p>
                          <button className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors flex items-center gap-1">
                            <Check className="w-3 h-3" /> 완료 처리
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{student.issue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-gray-900 font-bold text-base">모든 케어 완료!</p>
                <p className="text-gray-500 text-sm mt-1">오늘도 완벽하게 관리하셨네요 👏</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 반 생성 모달 */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">새 반 만들기</h3>
              <button onClick={() => setShowCreateClassModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">반 이름</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 고2 수학 심화반"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">학년</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="고1">고1</option>
                  <option value="고2">고2</option>
                  <option value="고3">고3</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateClass}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학생 추가 모달 */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">학생 추가</h3>
              <button onClick={() => {
                setShowAddStudentModal(false);
                setNewStudentName("");
                setNewStudentPhone("");
                setNewStudentEmail("");
                setNewStudentGrade(11);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">학생 이름 *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">전화번호 * (010-XXXX-XXXX)</label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">※ 기존 학생이면 전화번호로 자동 인식됩니다</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">이메일 (선택)</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">학년</label>
                <select
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value={10}>고1</option>
                  <option value={11}>고2</option>
                  <option value={12}>고3</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudentName("");
                  setNewStudentPhone("");
                  setNewStudentEmail("");
                  setNewStudentGrade(11);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddStudent}
                disabled={isAddingStudent}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${isAddingStudent
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isAddingStudent ? '추가 중...' : '추가하기'}
              </button>
            </div>

            {currentClass.students.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-3">현재 등록된 학생 ({currentClass.students.length}명)</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentClass.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{student.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}