import React, { useState } from 'react';
import { AppStateData, GradeLevel, ExamSubmission } from '../types';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  Users,
  Award,
  AlertTriangle,
  FileCheck,
  Megaphone,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Trash2,
  MessageSquare,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';

interface TeacherDashboardProps {
  data: AppStateData;
  activeGrade: GradeLevel;
  onChangeGrade: (grade: GradeLevel) => void;
  onAddAnnouncement: (title: string, content: string, priority: 'normal' | 'urgent') => void;
  onDeleteSubmission: (subId: string) => void;
  onGradeSubmission: (subId: string, finalScore: number, teacherNotes?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  data,
  activeGrade,
  onChangeGrade,
  onAddAnnouncement,
  onDeleteSubmission,
  onGradeSubmission
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'announcements' | 'complaints'>('submissions');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Grading Modal State
  const [gradingSub, setGradingSub] = useState<ExamSubmission | null>(null);
  const [gradedScore, setGradedScore] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  const gradeNames: Record<GradeLevel, string> = {
    grade1: 'الصف الأول الثانوي',
    grade2: 'الصف الثاني الثانوي',
    grade3: 'الصف الثالث الثانوي'
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    sound.playSuccess();
    onAddAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleOpenGrading = (sub: ExamSubmission) => {
    sound.playClick();
    setGradingSub(sub);
    setGradedScore(sub.score);
    setTeacherNotes(sub.teacherNotes || 'أحسنت يا بطل الفدائيين، تم اعتماد إجاباتك بنجاح.');
  };

  const handleConfirmGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    sound.playSuccess();
    onGradeSubmission(gradingSub.id, Number(gradedScore), teacherNotes);
    setGradingSub(null);
  };

  const gradeSubmissions = data.submissions.filter((s) => s.grade === activeGrade);

  return (
    <div className="space-y-6">
      {/* Teacher Top Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>لوحة تحكم الأستاذ الكاملة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            أهلاً بك يا باشمهندس محمد علاء 💪
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            تصحيح واعتماد الامتحانات · إضافة الشيتات والمذكرات · رصد مخالفات المراقبة المشددة
          </p>
        </div>

        {/* Grade Switcher */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">إدارة الصف الدراسي:</span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            {(['grade1', 'grade2', 'grade3'] as GradeLevel[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  sound.playClick();
                  onChangeGrade(g);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeGrade === g
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g === 'grade1' ? 'أولى ثانوي' : g === 'grade2' ? 'تانية ثانوي' : 'تالتة ثانوي'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('submissions');
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>تصحيح ونتائج الامتحانات ({gradeSubmissions.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('announcements');
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>إرسال تنبيهات وتوجيهات للطلاب</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('complaints');
          }}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>رسائل واستفسارات الطلاب ({data.complaints.length})</span>
        </button>
      </div>

      {/* Tab: Submissions with Teacher Grading Controls */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>النتائج المسجلة لـ: <b className="text-white">{gradeNames[activeGrade]}</b></span>
            <span>إجمالي المحاولات: <b className="text-cyan-400 font-mono">{gradeSubmissions.length}</b></span>
          </div>

          {gradeSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
              لا توجد أوراق امتحانات مسجلة حتى الآن لهذا الصف
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">عنوان الامتحان</th>
                    <th className="p-3">الدرجة</th>
                    <th className="p-3">النسبة</th>
                    <th className="p-3">حالة المراقبة (إنذارات الغش)</th>
                    <th className="p-3">حالة الاعتماد والتصحيح</th>
                    <th className="p-3">وقت التسليم</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gradeSubmissions.map((sub) => {
                    const pct = Math.round((sub.score / sub.totalMarks) * 100);
                    const isCheat = sub.cheatAlertsCount > 0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sub.studentName}</span>
                        </td>
                        <td className="p-3 text-slate-300">{sub.examTitle}</td>
                        <td className="p-3 font-mono font-bold text-cyan-400">
                          {sub.score} / {sub.totalMarks}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">{pct}%</td>
                        <td className="p-3">
                          {isCheat ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>{sub.cheatAlertsCount} إنذارات مرصودة</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>التزام كامل (0 إنذار)</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {sub.isGraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تم التصحيح والاعتماد</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>تصحيح واعتماد الآن</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{sub.submittedAt}</td>
                        <td className="p-3 flex items-center gap-1.5">
                          {sub.isGraded && (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="p-1.5 text-cyan-400 hover:bg-cyan-950/60 rounded-lg border border-cyan-500/30"
                              title="تعديل الدرجة أو الملاحظات"
                            >
                              تعديل
                            </button>
                          )}
                          <button
                            onClick={() => {
                              sound.playWarning();
                              onDeleteSubmission(sub.id);
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-500/20"
                            title="حذف النتيجة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Teacher Grading & Approval Modal */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">تصحيح واعتماد ورقة الامتحان</h3>
                <span className="text-xs text-amber-400">
                  الطالب: {gradingSub.studentName} · {gradingSub.examTitle}
                </span>
              </div>
              <button
                onClick={() => setGradingSub(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmGrading} className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الدرجة المحسوبة تلقائياً:</span>
                  <span className="font-mono font-bold text-cyan-400">{gradingSub.score} من {gradingSub.totalMarks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">حالة المراقبة:</span>
                  <span className={gradingSub.cheatAlertsCount === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {gradingSub.cheatAlertsCount === 0 ? 'التزام كامل' : `${gradingSub.cheatAlertsCount} إنذارات خروج`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الدرجة المعتمدة النهائية (يمكنك تعديلها إذا رغبت)
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradingSub.totalMarks}
                  required
                  value={gradedScore}
                  onChange={(e) => setGradedScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات وتوجيهات المستر محمد علاء للطالب (تظهر في تقريره)
                </label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="أكتب ملاحظاتك للطالب..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 text-[11px] text-amber-200">
                ⚠️ بمجرد الضغط على اعتماد النتيجة، سيتمكن الطالب من رؤية درجته المعتمدة والشرح والحلول النموذجية مع بقاء الامتحان مغلقاً وغير متاح للإعادة.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  اعتماد ونشر النتيجة للطالب الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post form */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>نشر تنبيه أو رسالة جديدة لجميع الطلاب</span>
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان التنبيه</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="مثال: موعد الحصة القادمة واختبار التكريم..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص التنبيه</label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="أكتب التوجيهات والملاحظات الهامة..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={annPriority === 'normal'}
                    onChange={() => setAnnPriority('normal')}
                  />
                  <span>عادي</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-amber-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={annPriority === 'urgent'}
                    onChange={() => setAnnPriority('urgent')}
                  />
                  <span>عاجل وهام ⚠️</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition-all"
              >
                بث التنبيه للطلاب فوراً
              </button>
            </form>
          </div>

          {/* Current announcements */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">التنبيهات المنشورة حالياً:</h3>
            {data.announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-2xl border ${
                  ann.priority === 'urgent'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-white text-xs">{ann.title}</h4>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Complaints / Student Inquiries */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm">استفسارات وشكاوى الطلاب الواردة:</h3>
          {data.complaints.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
              لا توجد رسائل واردة حتى الآن
            </div>
          ) : (
            <div className="space-y-3">
              {data.complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{c.studentName} ({c.grade})</span>
                    </span>
                    <span className="text-slate-400 font-mono">{c.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 font-semibold">
                    النوع: {c.category} · هاتف: {c.phone}
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
