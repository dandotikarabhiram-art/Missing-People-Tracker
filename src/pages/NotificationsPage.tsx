import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, ExternalLink, Clock } from 'lucide-react';

interface NotificationsPageProps {
  navigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ navigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" /> Notifications & Case Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications regarding report approvals, new sightings, and investigator assignments.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            You do not have any notifications at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={`p-5 hover:bg-slate-50 transition cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead ? 'bg-teal-50/40 border-l-4 border-l-teal-500' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    {n.caseReferenceNumber && (
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600">
                        {n.caseReferenceNumber}
                      </span>
                    )}
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.message}</p>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
