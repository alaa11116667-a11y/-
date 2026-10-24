import React, { useState, useRef } from 'react';
import { PdfDocument, GradeLevel } from '../types';
import { sound } from '../utils/audio';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Trash2,
  FileCheck,
  Search,
  BookOpen,
  X,
  Upload,
  CheckCircle2,
  FileUp
} from 'lucide-react';

interface PdfSectionProps {
  pdfs: PdfDocument[];
  grade: GradeLevel;
  isTeacher: boolean;
  onAddPdf?: (pdf: Omit<PdfDocument, 'id' | 'createdAt'>) => void;
  onDeletePdf?: (id: string) => void;
}

export const PdfSection: React.FC<PdfSectionProps> = ({
  pdfs,
  grade,
  isTeacher,
  onAddPdf,
  onDeletePdf
}) => {
  const [selectedPdf, setSelectedPdf] = useState<PdfDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [pagesCount, setPagesCount] = useState<number>(20);
  const [previewSnippet, setPreviewSnippet] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradePdfs = pdfs.filter((p) => p.grade === grade);
  const filteredPdfs = gradePdfs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      // Calculate human readable file size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPdfDataUrl(event.target.result as string);
          sound.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    sound.playSuccess();
    onAddPdf?.({
      grade,
      title,
      chapter: chapter || 'الوحدة الحالية',
      fileSize: fileSize || '3.5 MB',
      pagesCount: Number(pagesCount) || 20,
      previewSnippet: previewSnippet || `مذكرة معتمدة مرفوعة من جهاز المعلم باسم: ${uploadedFileName || title}`,
      downloadUrl: pdfDataUrl || '#'
    });

    setTitle('');
    setChapter('');
    setFileSize('');
    setPreviewSnippet('');
    setPdfDataUrl('');
    setUploadedFileName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>قسم مذكرات وملازم الـ PDF</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مذكرات الشرح والخرائط الذهنية وتجميعات القوانين الكاملة بروابط تحميل مباشرة
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المذكرات..."
              className="pr-8 pl-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {isTeacher && (
            <button
              onClick={() => {
                sound.playClick();
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition-all shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف PDF من جهازك</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of PDFs */}
      {filteredPdfs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">لا توجد مذكرات مطابقة للبحث</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="p-5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl transition-all shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-cyan-400 block mb-0.5">
                        {pdf.chapter}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                        {pdf.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                    {pdf.fileSize}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {pdf.previewSnippet}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pb-3 border-b border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>{pdf.pagesCount} صفحة</span>
                  </span>
                  <span>تاريخ النشر: {pdf.createdAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedPdf(pdf);
                  }}
                  className="flex-1 py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة وقراءة الملخص</span>
                </button>

                <a
                  href={pdf.downloadUrl}
                  onClick={() => sound.playSuccess()}
                  download={`${pdf.title}.pdf`}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تحميل PDF</span>
                </a>

                {isTeacher && onDeletePdf && (
                  <button
                    onClick={() => {
                      sound.playWarning();
                      onDeletePdf(pdf.id);
                    }}
                    className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-xl border border-rose-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-2xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/40">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedPdf.title}</h3>
                  <span className="text-xs text-cyan-400">{selectedPdf.chapter} · {selectedPdf.fileSize} · {selectedPdf.pagesCount} صفحة</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPdf(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="flex-1 overflow-y-auto bg-slate-950/90 rounded-2xl p-6 border border-slate-800 space-y-4 font-sans text-xs text-slate-300 leading-relaxed">
              <div className="text-center pb-4 border-b border-slate-800">
                <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase block">
                  منصة الفدائيين في الفيزياء · إشراف المهندس محمد علاء
                </span>
                <h4 className="text-lg font-black text-white mt-1">{selectedPdf.title}</h4>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <h5 className="font-bold text-cyan-300 mb-2">فهرس ومحتويات المذكرة:</h5>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li>مراجعة شاملة لجميع المفاهيم الفيزيائية وتعاريف القوانين الوزارية.</li>
                  <li>خرائط ذهنية رسومية تربط بين العلاقات البيانية وميل المماس.</li>
                  <li>نماذج مسائل المستويات العليا وتدريبات الامتحانات السابقة مع خطوات الحل.</li>
                  <li>جدول الثوابت والوحدات المكافئة للكميات الفيزيائية المختلفة.</li>
                </ul>
              </div>

              <p className="text-slate-300">{selectedPdf.previewSnippet}</p>

              <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/30 text-amber-200">
                💡 نصيحة المستر محمد علاء: قم بطباعة هذه المذكرة والحل بيدك مع التركيز على تحويلات الوحدات واستخدام الآلة الحاسبة الذكية في التأكد من الأرقام المعنوية.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedPdf(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                إغلاق
              </button>

              <a
                href={selectedPdf.downloadUrl}
                download={`${selectedPdf.title}.pdf`}
                onClick={() => sound.playSuccess()}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30"
              >
                <Download className="w-4 h-4" />
                <span>تحميل النسخة الكاملة جاهزة للطباعة</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add PDF Modal (Direct Device File Picker) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">رفع مذكرة PDF من جهازك</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePdf} className="space-y-4">
              {/* Native Device File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اختر ملف الـ PDF من جهازك (كمبيوتر / هاتف / تابلت)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf,.pdf"
                  onChange={handlePdfFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    pdfDataUrl
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-cyan-500/40 hover:border-cyan-400 bg-slate-800/60 hover:bg-slate-800'
                  }`}
                >
                  {pdfDataUrl ? (
                    <div className="space-y-1.5 w-full">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-xs text-emerald-300 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="truncate max-w-[240px]">{uploadedFileName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">الحجم: {fileSize}</span>
                      <span className="text-[10px] text-slate-400 block">اضغط لتغيير الملف المختار</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-white">اضغط لاختيار ملف PDF من ملفاتك</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">يدعم جميع ملفات الكتب والمذكرات (.pdf)</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المذكرة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مذكرة شرح قوانين كيرشوف المعقدة"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الفصل / الباب</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="الفصل الأول"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عدد الصفحات التقديري</label>
                  <input
                    type="number"
                    value={pagesCount}
                    onChange={(e) => setPagesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نبذة عن محتوى المذكرة</label>
                <textarea
                  rows={2}
                  value={previewSnippet}
                  onChange={(e) => setPreviewSnippet(e.target.value)}
                  placeholder="أكتب وصفاً للمذكرة وما تحتويه من نقاط وقوانين..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <FileUp className="w-4 h-4" />
                  <span>حفظ ونشر المذكرة للطلاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
