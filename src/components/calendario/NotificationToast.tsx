// ─── NotificationToast ───────────────────────────────────────────────────────

interface NotificationData {
  type: 'success' | 'error';
  message: string;
}

interface NotificationToastProps {
  notification: NotificationData | null;
}

export function NotificationToast({ notification }: NotificationToastProps) {
  if (!notification) return null;
  const isError = notification.type === 'error';
  return (
    <div
      className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-top-2 fade-in duration-200 ${
        isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
      }`}
    >
      {notification.message}
    </div>
  );
}
