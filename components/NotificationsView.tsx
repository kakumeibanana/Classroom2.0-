
import React from 'react';
import { Bell, MessageSquare, ClipboardList, Clock, Users, CheckCheck, ChevronRight, XCircle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (link: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onNotificationClick 
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare size={20} className="text-blue-500" />;
      case 'assignment': return <ClipboardList size={20} className="text-green-500" />;
      case 'deadline': return <Clock size={20} className="text-red-500" />;
      case 'group': return <Users size={20} className="text-purple-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Bell className="text-[#1a73e8]" />
            お知らせ一覧
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            あなた宛ての最新情報が届いています
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#1a73e8] rounded-xl text-xs font-black hover:bg-blue-100 transition-all shadow-sm"
          >
            <CheckCheck size={16} />
            すべて既読にする
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => {
                onMarkAsRead(n.id);
                if (n.link) onNotificationClick(n.link);
              }}
              className={`
                group flex items-start gap-4 p-5 bg-white border rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden
                ${n.isRead ? 'border-gray-100 opacity-70' : 'border-blue-200 ring-1 ring-blue-50 hover:shadow-md'}
              `}
            >
              {!n.isRead && (
                <div className="absolute top-0 left-0 w-1 h-full bg-[#1a73e8]" />
              )}
              
              <div className={`p-3 rounded-xl shrink-0 ${n.isRead ? 'bg-gray-50 text-gray-400' : 'bg-blue-50'}`}>
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-black truncate ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                    {n.timestamp}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                  {n.description}
                </p>
                
                {n.link && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-[#1a73e8] opacity-0 group-hover:opacity-100 transition-opacity">
                    詳細を確認する
                    <ChevronRight size={12} />
                  </div>
                )}
              </div>

              {!n.isRead && (
                <div className="shrink-0 pt-1">
                  <div className="w-2.5 h-2.5 bg-[#1a73e8] rounded-full shadow-sm animate-pulse" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <XCircle size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">
              お知らせはありません
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-lg">
          <h4 className="text-xl font-black mb-2">通知設定</h4>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            重要な課題の期限や、先生からの個人的なフィードバックを逃さないようにしましょう。プッシュ通知の設定は設定メニューから変更可能です。
          </p>
        </div>
        <Bell size={120} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
      </div>
    </div>
  );
};

export default NotificationsView;
