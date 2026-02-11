
import React from 'react';
import { Search, Bell, Menu, RefreshCw, ChevronDown } from 'lucide-react';
import { User, Notification } from '../types';
import { USERS } from '../constants';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser: User;
  onSwitchToUser: (id: string) => void;
  notifications: Notification[];
  onShowNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  currentUser, 
  onSwitchToUser,
  notifications,
  onShowNotifications
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Only allow Aさん (u1), Fさん (u6), and teacher (u7)
  const allowedAccounts = USERS.filter(u => ['u1','u6','u7'].includes(u.id));

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-[#1a73e8] p-1.5 rounded-lg shadow-sm">
              <span className="text-white font-bold text-lg sm:text-xl leading-none">2.0</span>
            </div>
            <h1 className="hidden xs:block text-lg sm:text-xl font-black text-gray-800 tracking-tight">
              Classroom <span className="text-[#1a73e8]">2.0</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-md px-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="検索..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-[#1a73e8] focus:bg-white transition-all outline-none text-sm font-bold"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* 通知アイコン - タップでお知らせページへ */}
          <button 
            onClick={onShowNotifications}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-all"
            aria-label="お知らせを表示"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* アカウント表示 - モバイルでも名前を表示 */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 sm:gap-3 pl-2 pr-1 sm:pl-3 sm:pr-2 py-1.5 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-200 group"
            >
            <div className="flex flex-col items-end">
              <p className="text-[12px] sm:text-sm font-black text-gray-900 leading-tight group-hover:text-[#1a73e8] transition-colors whitespace-nowrap">
                {currentUser.name}
              </p>
              <div className="flex items-center justify-end gap-1">
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter ${isTeacher ? 'text-purple-600' : 'text-green-600'}`}>
                  {isTeacher ? 'Teacher' : 'Student'}
                </span>
                <RefreshCw size={8} className="text-gray-400" />
              </div>
            </div>
            <div className="relative shrink-0">
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 transition-all border border-gray-100 shadow-sm ${isTeacher ? 'ring-purple-200' : 'ring-green-200'}`} 
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                <ChevronDown size={10} className="text-gray-400" />
              </div>
            </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                {allowedAccounts.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { onSwitchToUser(u.id); setMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3`}
                  >
                    <img src={u.avatar} className="w-8 h-8 rounded-full" />
                    <div className="text-sm font-black truncate">{u.name} <span className="text-xs font-medium text-gray-400">{u.role === 'teacher' ? '（先生）' : ''}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
