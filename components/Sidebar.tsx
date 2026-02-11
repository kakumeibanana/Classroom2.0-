
import React from 'react';
import { Home, ShieldAlert, MessageCircle, ClipboardCheck, Bell, Settings } from 'lucide-react';
import { MOCK_SUBJECTS, getIconTextColor } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  isTeacher: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, isTeacher }) => {
  return (
    <aside className={`
      fixed lg:static top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 transition-all duration-300 z-30
      ${isOpen ? 'w-72' : 'w-0 lg:w-72'} 
      overflow-y-auto overflow-x-hidden
    `}>
      <div className="p-2">
        <nav className="space-y-0.5">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'home' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Home size={20} />
            <span className="font-bold text-sm">ホーム</span>
          </button>
          
          <button
            onClick={() => setActiveTab('todo')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'todo' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ClipboardCheck size={20} />
            <span className="font-bold text-sm">To-do リスト</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'chat' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageCircle size={20} />
            <span className="font-bold text-sm">DM</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'notifications' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Bell size={20} />
            <span className="font-bold text-sm">お知らせ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'settings' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            <span className="font-bold text-sm">設定</span>
          </button>
        </nav>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <p className="px-4 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">登録中の科目</p>
          {MOCK_SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setActiveTab(`subject-${subject.id}`)}
              className={`
                w-full flex items-center gap-4 px-4 py-2.5 rounded-r-full transition-all group relative
                ${activeTab.startsWith(`subject-${subject.id}`) ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: subject.color, color: getIconTextColor(subject.color) }}
              >
                {subject.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-[13px] font-bold truncate ${activeTab.startsWith(`subject-${subject.id}`) ? 'text-blue-700' : 'text-gray-700'}`}>
                  {subject.name}
                </p>
                {subject.subtitle && (
                  <p className="text-[9px] text-gray-500 truncate leading-tight font-medium">
                    {subject.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {isTeacher && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="px-4 mb-2 text-[10px] font-black text-red-400 uppercase tracking-widest">管理者専用</p>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-r-full transition-all ${activeTab === 'monitor' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-red-50'}`}
            >
              <ShieldAlert size={20} />
              <span className="font-bold text-sm">監視ログ / 解析</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
