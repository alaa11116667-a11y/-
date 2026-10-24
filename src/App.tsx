import React, { useState, useEffect } from 'react';
import {
  CurrentUser,
  GradeLevel,
  AppStateData,
  Exam,
  ExamSubmission,
  Homework,
  PdfDocument,
  EngineerProblem,
  BoardCapture,
  Complaint,
  Announcement
} from './types';
import { initialData, getStoredData, saveStoredData, HERO_BANNER } from './data/initialData';
import { sound } from './utils/audio';

// Components
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './components/LoginPage';
import { CasioCalculator } from './components/CasioCalculator';
import { ExamEngine } from './components/ExamEngine';
import { ExamsSection } from './components/ExamsSection';
import { HomeworkSection } from './components/HomeworkSection';
import { PdfSection } from './components/PdfSection';
import { EngineersSection } from './components/EngineersSection';
import { BoardSection } from './components/BoardSection';
import { TeacherDashboard } from './components/TeacherDashboard';
import { DeveloperFooter } from './components/DeveloperFooter';
import { ComplaintsModal } from './components/ComplaintsModal';

import {
  Atom,
  Shield,
  FileCheck2,
  Image,
  FileText,
  Cpu,
  Presentation,
  Calculator,
  Volume2,
  VolumeX,
  LogOut,
  User,
  GraduationCap,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

import { testFirestoreConnection } from './firebase';
import {
  COLLECTIONS,
  seedInitialCloudDataIfNeeded,
  subscribeToCloudData,
  syncItemToCloud,
  deleteItemFromCloud
} from './utils/cloudSync';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeGrade, setActiveGrade] = useState<GradeLevel>('grade3');
  const [activeSection, setActiveSection] = useState<'exams' | 'homework' | 'pdf' | 'engineers' | 'board' | 'teacher'>('exams');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Calculator modal state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  // Complaints modal state
  const [isComplaintsOpen, setIsComplaintsOpen] = useState<boolean>(false);

  // Cloud status state
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Master Platform Data (initialized from local storage, synced with cloud)
  const [data, setData] = useState<AppStateData>(() => getStoredData());

  // Save to localStorage whenever data changes (local cache)
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Real-time Cloud Synchronization with Firebase Firestore
  useEffect(() => {
    // 1. Verify Firestore connectivity
    testFirestoreConnection();

    // 2. Seed initial physics questions and sheets if cloud is fresh
    seedInitialCloudDataIfNeeded();

    // 3. Real-time listener: any device changes instantly update here
    const unsubscribe = subscribeToCloudData(
      (updater) => {
        setData(updater);
      },
      () => {
        setIsCloudConnected(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // When student logs in, automatically select their grade
  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setActiveGrade(user.grade);
      setActiveSection('exams');
    } else {
      setActiveSection('teacher');
    }
  };

  const handleLogout = () => {
    sound.playClick();
    setCurrentUser(null);
    setActiveExam(null);
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Grade Name labels (Hidden passcodes)
  const gradeLabels: Record<GradeLevel, string> = {
    grade1: 'الصف الأول الثانوي',
    grade2: 'الصف الثاني الثانوي',
    grade3: 'الصف الثالث الثانوي (الثانوية العامة)'
  };

  // ---------------- Handlers for Data Mutations (Teacher/Student with Cloud Sync) ----------------

  const handleFinishExam = (submission: ExamSubmission) => {
    setData((prev) => ({
      ...prev,
      submissions: [submission, ...prev.submissions]
    }));
    syncItemToCloud(COLLECTIONS.SUBMISSIONS, submission);
  };

  const handleGradeSubmission = (subId: string, finalScore: number, teacherNotes?: string) => {
    const existing = data.submissions.find((s) => s.id === subId);
    const updatedSub: ExamSubmission = {
      ...(existing || ({} as ExamSubmission)),
      id: subId,
      score: finalScore,
      isGraded: true,
      teacherNotes: teacherNotes || 'تم تصحيح واعتماد النتيجة من المستر محمد علاء.',
      gradedAt: new Date().toLocaleString('ar-EG')
    };

    setData((prev) => ({
      ...prev,
      submissions: prev.submissions.map((s) =>
        s.id === subId ? updatedSub : s
      )
    }));

    syncItemToCloud(COLLECTIONS.SUBMISSIONS, updatedSub);
  };

  const handleAddExam = (newExam: Exam) => {
    setData((prev) => ({
      ...prev,
      exams: [newExam, ...prev.exams]
    }));
    syncItemToCloud(COLLECTIONS.EXAMS, newExam);
  };

  const handleDeleteExam = (examId: string) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== examId)
    }));
    deleteItemFromCloud(COLLECTIONS.EXAMS, examId);
  };

  const handleAddHomework = (hw: Omit<Homework, 'id' | 'createdAt'>) => {
    const newHw: Homework = {
      ...hw,
      id: `hw-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setData((prev) => ({
      ...prev,
      homeworks: [newHw, ...prev.homeworks]
    }));
    syncItemToCloud(COLLECTIONS.HOMEWORKS, newHw);
  };

  const handleDeleteHomework = (hwId: string) => {
    setData((prev) => ({
      ...prev,
      homeworks: prev.homeworks.filter((h) => h.id !== hwId)
    }));
    deleteItemFromCloud(COLLECTIONS.HOMEWORKS, hwId);
  };

  const handleAddPdf = (pdf: Omit<PdfDocument, 'id' | 'createdAt'>) => {
    const newPdf: PdfDocument = {
      ...pdf,
      id: `pdf-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setData((prev) => ({
      ...prev,
      pdfs: [newPdf, ...prev.pdfs]
    }));
    syncItemToCloud(COLLECTIONS.PDFS, newPdf);
  };

  const handleDeletePdf = (pdfId: string) => {
    setData((prev) => ({
      ...prev,
      pdfs: prev.pdfs.filter((p) => p.id !== pdfId)
    }));
    deleteItemFromCloud(COLLECTIONS.PDFS, pdfId);
  };

  const handleAddEngineerProblem = (prob: Omit<EngineerProblem, 'id'>) => {
    const newProb: EngineerProblem = {
      ...prob,
      id: `eng-${Date.now()}`
    };
    setData((prev) => ({
      ...prev,
      engineerProblems: [newProb, ...prev.engineerProblems]
    }));
    syncItemToCloud(COLLECTIONS.ENGINEER_PROBLEMS, newProb);
  };

  const handleDeleteEngineerProblem = (probId: string) => {
    setData((prev) => ({
      ...prev,
      engineerProblems: prev.engineerProblems.filter((p) => p.id !== probId)
    }));
    deleteItemFromCloud(COLLECTIONS.ENGINEER_PROBLEMS, probId);
  };

  const handleAddBoard = (board: Omit<BoardCapture, 'id'>) => {
    const newBoard: BoardCapture = {
      ...board,
      id: `board-${Date.now()}`
    };
    setData((prev) => ({
      ...prev,
      boardCaptures: [newBoard, ...prev.boardCaptures]
    }));
    syncItemToCloud(COLLECTIONS.BOARD_CAPTURES, newBoard);
  };

  const handleDeleteBoard = (boardId: string) => {
    setData((prev) => ({
      ...prev,
      boardCaptures: prev.boardCaptures.filter((b) => b.id !== boardId)
    }));
    deleteItemFromCloud(COLLECTIONS.BOARD_CAPTURES, boardId);
  };

  const handleAddAnnouncement = (title: string, content: string, priority: 'normal' | 'urgent') => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      priority
    };
    setData((prev) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements]
    }));
    syncItemToCloud(COLLECTIONS.ANNOUNCEMENTS, newAnn);
  };

  const handleDeleteSubmission = (subId: string) => {
    setData((prev) => ({
      ...prev,
      submissions: prev.submissions.filter((s) => s.id !== subId)
    }));
    deleteItemFromCloud(COLLECTIONS.SUBMISSIONS, subId);
  };

  const handleSubmitComplaint = (c: Omit<Complaint, 'id' | 'timestamp'>) => {
    const newComplaint: Complaint = {
      ...c,
      id: `comp-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-EG')
    };
    setData((prev) => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints]
    }));
    syncItemToCloud(COLLECTIONS.COMPLAINTS, newComplaint);
  };

  // 1. Initial 3-second splash screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onOpenComplaints={() => setIsComplaintsOpen(true)}
        />
        <ComplaintsModal
          isOpen={isComplaintsOpen}
          onClose={() => setIsComplaintsOpen(false)}
          onSubmitComplaint={handleSubmitComplaint}
        />
      </>
    );
  }

  // 3. Exam In-Progress Screen
  if (activeExam) {
    return (
      <ExamEngine
        exam={activeExam}
        studentName={currentUser.role === 'student' ? currentUser.name : 'المهندس محمد علاء (وضع المعاينة)'}
        onFinishExam={handleFinishExam}
        onExit={() => setActiveExam(null)}
      />
    );
  }

  const isTeacher = currentUser.role === 'teacher';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* ================= Top Bar Contract (3 zones) ================= */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white shadow-md shadow-cyan-600/30">
            ف
          </div>
          <div className="whitespace-nowrap">
            <span className="text-base sm:text-lg font-black text-white tracking-tight">
              الفدائيين في الفيزياء
            </span>
            <span className="text-[11px] text-cyan-400 font-semibold block -mt-0.5">
              إشراف: المهندس محمد علاء
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, no wrapping) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('exams');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeSection === 'exams'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-extrabold'
                : 'hover:text-white'
            }`}
          >
            الامتحانات المحمية
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('homework');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeSection === 'homework'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-extrabold'
                : 'hover:text-white'
            }`}
          >
            شيتات الواجب
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('pdf');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeSection === 'pdf'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-extrabold'
                : 'hover:text-white'
            }`}
          >
            مذكرات الـ PDF
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('engineers');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeSection === 'engineers'
                ? 'text-amber-400 border-b-2 border-amber-400 font-extrabold'
                : 'hover:text-amber-300'
            }`}
          >
            قسم المهندسين 💪
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('board');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeSection === 'board'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-extrabold'
                : 'hover:text-white'
            }`}
          >
            تصوير السبورة
          </button>

          {isTeacher && (
            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('teacher');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeSection === 'teacher'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-black'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              لوحة تحكم المستر
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Casio Calculator, Cloud Indicator & User Control) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Sync Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isCloudConnected
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
            }`}
            title={
              isCloudConnected
                ? 'متصل بالسحابة · البيانات والامتحانات متزامنة مباشرة بين أجهزة المستر والطلاب'
                : 'جاري الاتصال السحابي...'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            ></span>
            <span className="hidden sm:inline">
              {isCloudConnected ? 'سحابة متصلة ⚡' : 'مزامنة...'}
            </span>
          </div>

          {/* Casio Calculator Launcher */}
          <button
            onClick={() => {
              sound.playClick();
              setIsCalculatorOpen(true);
            }}
            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="آلة حاسبة كاسيو FX-991EX الذكية"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">آلة كاسيو</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/60 transition-colors"
            title={isMuted ? 'تشغيل الأصوات' : 'كتم الأصوات'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-xl border border-rose-500/30 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('exams')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeSection === 'exams' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800'
          }`}
        >
          الامتحانات
        </button>
        <button
          onClick={() => setActiveSection('homework')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeSection === 'homework' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800'
          }`}
        >
          الواجب
        </button>
        <button
          onClick={() => setActiveSection('pdf')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeSection === 'pdf' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800'
          }`}
        >
          مذكرات PDF
        </button>
        <button
          onClick={() => setActiveSection('engineers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeSection === 'engineers' ? 'bg-amber-600 text-white' : 'text-slate-400 bg-slate-800'
          }`}
        >
          المهندسين 💪
        </button>
        <button
          onClick={() => setActiveSection('board')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            activeSection === 'board' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800'
          }`}
        >
          السبورة
        </button>
        {isTeacher && (
          <button
            onClick={() => setActiveSection('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeSection === 'teacher' ? 'bg-amber-600 text-white' : 'text-amber-400 bg-slate-800'
            }`}
          >
            لوحة المستر
          </button>
        )}
      </div>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* User Identity & Grade Ribbon */}
        <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
              {isTeacher ? <Award className="w-5 h-5 text-amber-400" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs text-slate-400">
                {isTeacher ? 'المعلم المشرف' : 'الطالب المسجل'}:
                <span className="text-white font-bold mr-1">{currentUser.name}</span>
              </div>
              <div className="text-xs font-semibold text-cyan-400">
                {gradeLabels[activeGrade]}
              </div>
            </div>
          </div>

          {/* Quick grade selector for Teacher */}
          {isTeacher && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">عرض محتوى:</span>
              {(['grade1', 'grade2', 'grade3'] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    sound.playClick();
                    setActiveGrade(g);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeGrade === g
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {g === 'grade1' ? 'أولى' : g === 'grade2' ? 'تانية' : 'تالتة'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Announcements Bar if any urgent */}
        {data.announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {data.announcements.slice(0, 1).map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{ann.title}:</span>
                  <span className="text-slate-200 font-normal">{ann.content}</span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono shrink-0">{ann.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Section View Switching */}
        {activeSection === 'exams' && (
          <ExamsSection
            exams={data.exams}
            submissions={data.submissions}
            grade={activeGrade}
            studentName={currentUser.name}
            isTeacher={isTeacher}
            onStartExam={(ex) => setActiveExam(ex)}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
          />
        )}

        {activeSection === 'homework' && (
          <HomeworkSection
            homeworks={data.homeworks}
            grade={activeGrade}
            isTeacher={isTeacher}
            onAddHomework={handleAddHomework}
            onDeleteHomework={handleDeleteHomework}
          />
        )}

        {activeSection === 'pdf' && (
          <PdfSection
            pdfs={data.pdfs}
            grade={activeGrade}
            isTeacher={isTeacher}
            onAddPdf={handleAddPdf}
            onDeletePdf={handleDeletePdf}
          />
        )}

        {activeSection === 'engineers' && (
          <EngineersSection
            problems={data.engineerProblems}
            grade={activeGrade}
            isTeacher={isTeacher}
            onAddProblem={handleAddEngineerProblem}
            onDeleteProblem={handleDeleteEngineerProblem}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeSection === 'board' && (
          <BoardSection
            boardCaptures={data.boardCaptures}
            grade={activeGrade}
            isTeacher={isTeacher}
            onAddBoard={handleAddBoard}
            onDeleteBoard={handleDeleteBoard}
          />
        )}

        {activeSection === 'teacher' && isTeacher && (
          <TeacherDashboard
            data={data}
            activeGrade={activeGrade}
            onChangeGrade={(g) => setActiveGrade(g)}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteSubmission={handleDeleteSubmission}
            onGradeSubmission={handleGradeSubmission}
          />
        )}
      </main>

      {/* Casio FX-991EX Calculator */}
      <CasioCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Complaints and Support Modal */}
      <ComplaintsModal
        isOpen={isComplaintsOpen}
        onClose={() => setIsComplaintsOpen(false)}
        onSubmitComplaint={handleSubmitComplaint}
        defaultStudentName={currentUser?.name}
      />

      {/* Developer luxury footer */}
      <DeveloperFooter onOpenComplaints={() => setIsComplaintsOpen(true)} />
    </div>
  );
}
