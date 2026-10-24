import React, { useState } from 'react';
import { CurrentUser, GradeLevel } from '../types';
import { sound } from '../utils/audio';
import { Shield, KeyRound, User, Lock, ArrowLeft, GraduationCap, AlertTriangle } from 'lucide-react';
import { HERO_BANNER } from '../data/initialData';

interface LoginPageProps {
  onLogin: (user: CurrentUser) => void;
  onOpenComplaints: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onOpenComplaints }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student form state
  const [studentName, setStudentName] = useState<string>('');
  const [studentPasscode, setStudentPasscode] = useState<string>('');

  // Teacher form state
  const [teacherUsername, setTeacherUsername] = useState<string>('');
  const [teacherPassword, setTeacherPassword] = useState<string>('');

  // Error & Status
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      sound.playWarning();
      setErrorMessage('يرجى كتابة اسم الطالب ثلاثياً للمتابعة.');
      return;
    }

    const code = studentPasscode.trim();
    let targetGrade: GradeLevel | null = null;

    if (code === '110000') {
      targetGrade = 'grade1';
    } else if (code === '222000') {
      targetGrade = 'grade2';
    } else if (code === '333300') {
      targetGrade = 'grade3';
    }

    if (!targetGrade) {
      sound.playWarning();
      setErrorMessage('شفرة الدخول غير صحيحة! يرجى مراجعة المهندس محمد علاء للحصول على شفرة صفك الدراسي المعتمدة.');
      return;
    }

    sound.playSuccess();
    onLogin({
      name: studentName.trim(),
      grade: targetGrade,
      role: 'student'
    });
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const u = teacherUsername.trim();
    const p = teacherPassword.trim();

    if (u === 'moking' && p === '12312300') {
      sound.playSuccess();
      onLogin({
        name: 'المهندس محمد علاء',
        role: 'teacher'
      });
    } else {
      sound.playWarning();
      setErrorMessage('بيانات دخول المعلم غير صحيحة! لا يمكن الدخول كأستاذ إلا بالاسم وكلمة السر المعتمدة.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080d19] text-slate-100 relative overflow-hidden">
      {/* Background with physics elements */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img
          src={HERO_BANNER}
          alt="Physics Banner"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-[#080d19]/80 to-[#080d19]" />
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
            ف
          </div>
          <div>
            <div className="font-extrabold text-white text-lg tracking-tight">
              منصة الفدائيين في الفيزياء
            </div>
            <div className="text-xs text-cyan-400 font-medium">
              تحت إشراف: المهندس محمد علاء
            </div>
          </div>
        </div>

        <button
          onClick={onOpenComplaints}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all flex items-center gap-1.5"
        >
          <span>المطور والدعم الفني</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
          {/* Welcome Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>شعارنا: الفدائيين 💪</span>
            </div>
            <h2 className="text-2xl font-black text-white">بوابة تسجيل الدخول</h2>
            <p className="text-xs text-slate-400 mt-1">
              الوصول مشفر ومحمي · أدخل بياناتك وشفرتك الخاصة للمتابعة
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('student');
                setErrorMessage('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>دخول الطالب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('teacher');
                setErrorMessage('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'teacher'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>دخول المستر</span>
            </button>
          </div>

          {/* Error Message if present */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Student Login Form */}
          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم الطالب ثلاثياً
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="اكتب اسمك ثلاثياً..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex justify-between">
                  <span>شفرة الدخول الخاصة بسنتك الدراسية</span>
                  <span className="text-cyan-400 text-[11px]">كود سري محمي</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={studentPasscode}
                    onChange={(e) => setStudentPasscode(e.target.value)}
                    placeholder="أدخل شفرة الدخول الخاصة بك..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  * الشفرة مخصصة لطلاب مجموعات المهندس محمد علاء فقط.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-sm text-white shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/50 transition-all flex items-center justify-center gap-2"
              >
                <span>دخول لمنصة الفيزياء</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Teacher Master Login Form */
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                تسجيل دخول مخصص للمعلم فقط لإدارة الامتحانات والواجبات والمذكرات لجميع الصفوف الدراسية.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    placeholder="اسم المستخدم..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="كلمة المرور السرية..."
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl font-bold text-sm text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>دخول لوحة تحكم المستر</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer Mini Credit */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/60">
        منصة الفدائيين في الفيزياء · المهندس محمد علاء · تطوير م. علاء جهاد (01021462904)
      </footer>
    </div>
  );
};
