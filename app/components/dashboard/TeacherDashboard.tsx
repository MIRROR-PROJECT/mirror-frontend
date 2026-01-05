"use client";

import { useState, useEffect } from "react";
import {
  Sparkles, Printer, Calendar, CheckCircle2,
  BarChart, Clock, MessageSquare, ChevronDown,
  Brain, Check, FileText, ArrowRight, User, AlertCircle,
  Plus, X, Search, UserPlus,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addStudentToClass, getMyClasses, ClassInfo } from "@/app/lib/api/teacher";
import { useLanguage } from "@/app/context/LanguageContext";

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

export default function TeacherDashboard({ user }: { user: any }) {
  const router = useRouter();
  const { t, language } = useLanguage(); // i18n hook
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

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
    const hasRedirected = sessionStorage.getItem('teacher_has_redirected');

    // 이미 리다이렉트했으면 무시
    if (hasRedirected) return;

    if (!fromBenefits) {
      // 아직 benefits 페이지를 보지 않았으면 거기로 보냄
      sessionStorage.setItem('teacher_has_redirected', 'true');
      router.push('/teacher/benefits');
    }
  }, [router]);

  useEffect(() => {
    const now = new Date();
    // 언어에 따른 날짜 포맷팅
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    const formatted = new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', options).format(now);
    setCurrentDate(formatted);
  }, [language]);

  useEffect(() => {
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

        // 에러 시 데모 데이터 사용 (언어별 분기)
        if (language === 'ko') {
          setClasses([{
            id: 1,
            name: "고2 수학 심화반",
            studentCount: 12,
            avgProgress: 65,
            briefing: {
              mood: "🔥 자습 열기 고조",
              moodDesc: "어제 밤 10시 이후 접속자가 9명으로, 평소 대비 30% 증가했습니다. 평균 학습시간 2.1시간을 기록했습니다.",
              weakness: "이차함수 최댓값/최솟값",
              weaknessRate: 68,
              careAction: "수업 도입부 10분간 '이차함수 그래프와 최댓값 관계' 시각화 자료로 복습 후 기본 문제 풀이"
            },
            careList: [
              { id: 1, name: "김민수", issue: "성적 급락 (▼18점) + 2일 연속 미접속", urgent: true },
              { id: 2, name: "이지은", issue: "진로 상담 요청 (이과 vs 문과)", urgent: false },
              { id: 3, name: "박서준", issue: "수학 진도율 32% 정체 (1주째)", urgent: true }
            ],
            students: [
              { id: 1, name: "김민수", email: "minsu@example.com", grade: "고2" },
              { id: 2, name: "이지은", email: "jieun@example.com", grade: "고2" },
              { id: 3, name: "박서준", email: "seojun@example.com", grade: "고2" },
              // ... students truncated for brevity
            ]
          }]);
        } else {
          // English Demo Data
          setClasses([{
            id: 1,
            name: "Advanced Math Grade 11",
            studentCount: 12,
            avgProgress: 65,
            briefing: {
              mood: "🔥 High Engagement",
              moodDesc: "9 students active after 10PM yesterday, a 30% increase. Avg study time: 2.1 hours.",
              weakness: "Quadratic Function Max/Min",
              weaknessRate: 68,
              careAction: "Review 'Quadratic Graphs & Max/Min' with visuals for 10 mins, then solve basic problems."
            },
            careList: [
              { id: 1, name: "Minsu Kim", issue: "Score Drop (▼18) + Inactive 2 days", urgent: true },
              { id: 2, name: "Jieun Lee", issue: "Career Consulting Request", urgent: false },
              { id: 3, name: "Seojun Park", issue: "Math Progress Stagnant 32% (1 week)", urgent: true }
            ],
            students: [
              { id: 1, name: "Minsu Kim", email: "minsu@example.com", grade: "G11" },
              { id: 2, name: "Jieun Lee", email: "jieun@example.com", grade: "G11" },
              { id: 3, name: "Seojun Park", email: "seojun@example.com", grade: "G11" },
            ]
          }]);
        }
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [language]); // language가 바뀔 때마다 다시 실행 (데모 데이터 갱신)

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
          grade: `G${newStudentGrade - 2}` // 간단 변환: 10->G1, 11->G2, 12->G3 (데모용)
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

        alert(`${result.data!.student_name} added to ${currentClass.name}!`);
      }
    } catch (error: any) {
      alert(`Failed to add student: ${error.message}`);
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">

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
                <span className="text-xs text-gray-500 font-bold mb-0.5">{t('teacher.dashboard.studentCount')}</span>
                <span className="text-base font-black text-gray-900 flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-400" />
                  {currentClass.studentCount}{t('teacher.dashboard.studentCount')}
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 font-bold mb-0.5 flex items-center gap-1">
                  {t('teacher.dashboard.dailyBriefing.avgCompletion')}
                  <div className="relative group">
                    <Brain className="w-3 h-3 text-blue-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-50">
                      <p className="font-medium leading-relaxed">
                        {language === 'ko' ? '전체 수강생의 평균 학습 진도율입니다.' : 'Average progress rate across all students.'}
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
              {t('teacher.dashboard.modal.addButton')}
            </button>
          </div>
        </div>

        {/* 2. 데일리 학습 브리핑 (간단 요약) */}
        <section className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-white p-6 md:p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <BarChart className="w-7 h-7 text-blue-600" />
                Daily Class Briefing
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                <span className="text-gray-900 font-bold">{currentClass.name}</span> {t('teacher.dashboard.dailyBriefing.subtitle', { class: '' })}
              </p>
            </div>
            <Link href="/teacher/report">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('teacher.dashboard.dailyBriefing.viewReport')}
              </button>
            </Link>
          </div>

          {/* 간단 요약 카드 */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">{t('teacher.dashboard.dailyBriefing.activeStudents')}</p>
                <p className="text-2xl font-bold text-gray-900">9<span className="text-sm text-gray-400">/12{t('teacher.dashboard.studentCount')}</span></p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-gray-500 font-medium mb-1">{t('teacher.dashboard.dailyBriefing.avgStudyTime')}</p>
                <p className="text-2xl font-bold text-blue-600">2.3<span className="text-sm text-gray-400">h</span></p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 font-medium mb-1">{t('teacher.dashboard.dailyBriefing.avgCompletion')}</p>
                <p className="text-2xl font-bold text-green-600">{currentClass.avgProgress}<span className="text-sm text-gray-400">%</span></p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-xs text-gray-500 font-medium mb-1">{t('teacher.dashboard.dailyBriefing.needsCare')}</p>
                <p className="text-2xl font-bold text-red-600">{currentClass.careList.length}<span className="text-sm text-gray-400">{t('teacher.dashboard.studentCount')}</span></p>
              </div>
            </div>

            {/* 핵심 인사이트 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{t('teacher.dashboard.dailyBriefing.weakness')}: {currentClass.briefing.weakness}</p>
                  <p className="text-sm text-gray-600">
                    {t('teacher.dashboard.dailyBriefing.weaknessDesc', { rate: currentClass.briefing.weaknessRate })}
                  </p>
                </div>
                <Link href="/teacher/report">
                  <button className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 shrink-0">
                    자세히 <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 2단 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 3. AI 오답 클리닉 (문제지 생성) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-600" /> {t('teacher.dashboard.aiClinic.title')}
            </h2>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden group transition-all duration-300">
              {/* 배경 애니메이션 효과 */}
              <div className="absolute -right-10 -top-10 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur border border-white/10">
                      {t('teacher.dashboard.aiClinic.exclusive', { class: currentClass.name })}
                    </span>
                    <span className="bg-purple-400/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur border border-purple-300/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t('teacher.dashboard.aiClinic.generated')}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-3">{t('teacher.dashboard.aiClinic.desc', { weakness: '' }).split(':')[0]}</h3>
                  <p className="text-purple-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90">
                    {t('teacher.dashboard.aiClinic.desc', { weakness: currentClass.briefing.weakness })}
                  </p>
                </div>

                <button className="whitespace-nowrap bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-purple-50 hover:scale-105 transition-all flex items-center gap-2 group/btn">
                  <Printer className="w-5 h-5" />
                  {t('teacher.dashboard.aiClinic.button')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 -ml-2 group-hover/btn:ml-0 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. 학생 케어 체크리스트 */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" /> {t('teacher.dashboard.careList.title')} ({currentClass.careList.length})
            </h2>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm h-full min-h-[200px]">
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
                              <Check className="w-3 h-3" /> {t('teacher.dashboard.careList.markComplete')}
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
                  <p className="text-gray-900 font-bold text-base">{t('teacher.dashboard.careList.empty')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('teacher.dashboard.careList.emptyDesc')}</p>
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
                <h3 className="text-xl font-bold text-gray-900">{t('teacher.dashboard.modal.createClassTitle')}</h3>
                <button onClick={() => setShowCreateClassModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.className')}</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder={t('teacher.dashboard.modal.classNamePlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.grade')}</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="고1">Grade 10</option>
                    <option value="고2">Grade 11</option>
                    <option value="고3">Grade 12</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('teacher.dashboard.modal.cancel')}
                </button>
                <button
                  onClick={handleCreateClass}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {t('teacher.dashboard.modal.confirm')}
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
                <h3 className="text-xl font-bold text-gray-900">{t('teacher.dashboard.modal.addStudentTitle')}</h3>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.studentName')} *</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder={language === 'ko' ? "홍길동" : "John Doe"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.studentPhone')} * (010-XXXX-XXXX)</label>
                  <input
                    type="text"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">※ {language === 'ko' ? '기존 학생이면 전화번호로 자동 인식됩니다' : 'Existing students will be recognized by phone number'}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.studentEmail')} ({language === 'ko' ? '선택' : 'Optional'})</label>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('teacher.dashboard.modal.grade')}</label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value={10}>Grade 10</option>
                    <option value={11}>Grade 11</option>
                    <option value={12}>Grade 12</option>
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
                  {t('teacher.dashboard.modal.cancel')}
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={isAddingStudent}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${isAddingStudent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isAddingStudent ? t('teacher.dashboard.modal.adding') : t('teacher.dashboard.modal.addButton')}
                </button>
              </div>

              {currentClass.students.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">{t('teacher.dashboard.modal.registered')} ({currentClass.students.length}{t('teacher.dashboard.studentCount')})</p>
                  <div className="space-y-2">
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
    </div>
  );
}