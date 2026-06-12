import { CheckCircle, XCircle } from 'lucide-react';

interface AdminSistemaFeedbackToastProps {
  feedback: { key: string; type: 'success' | 'error'; msg: string } | null;
}

export function AdminSistemaFeedbackToast({ feedback }: AdminSistemaFeedbackToastProps) {
  if (!feedback) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold transition-all duration-300 ${
        feedback.type === 'success'
          ? 'bg-emerald-900/90 border border-emerald-600/40 text-emerald-300'
          : 'bg-red-900/90 border border-red-600/40 text-red-300'
      }`}
    >
      {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      {feedback.msg}
    </div>
  );
}
