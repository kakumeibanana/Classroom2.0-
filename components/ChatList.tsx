import React from 'react';
import { Search, Users, User as UserIcon } from 'lucide-react';
import { USERS } from '../constants';
import { Message, User, ChatGroup } from '../types';

interface ChatListProps {
  currentUser: User;
  selectedChat: User | ChatGroup | null;
  onSelectChat: (chat: User | ChatGroup) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  chatHistories: Record<string, Message[]>;
  groups: ChatGroup[];
}

const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  selectedChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
  chatHistories,
  groups
}) => {
  const filteredGroups = groups.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || (chatHistories[g.id] || []).some(m => m.content.toLowerCase().includes(q));
  });

  const filteredUsers = USERS.filter(u => u.id !== currentUser.id).filter(user => {
    const hasMessages = chatHistories[user.id] && chatHistories[user.id].length > 0;
    if (!searchQuery) return hasMessages;
    const q = searchQuery.toLowerCase();
    const messageContent = (chatHistories[user.id] || []).map(m => m.content.toLowerCase()).join(' ');
    return user.name.toLowerCase().includes(q) || messageContent.includes(q);
  });

  return (
    <div className="w-80 border-r border-gray-100 hidden lg:flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="相手名またはメッセージを検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredGroups.length > 0 && (
          <div className="px-4 py-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">グループ</h4>
            <div className="space-y-1">
              {filteredGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => onSelectChat(group)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedChat?.id === group.id ? 'bg-blue-50 border-blue-100 shadow-inner' : 'hover:bg-gray-50 border-transparent'
                  } border`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    selectedChat?.id === group.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-blue-100 text-[#1a73e8]'
                  }`}>
                    <Users size={18} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-black text-gray-900 truncate">{group.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {chatHistories[group.id]?.length > 0
                        ? chatHistories[group.id][chatHistories[group.id].length - 1].content
                        : 'メッセージはありません'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredUsers.length > 0 && (
          <div className="px-4 py-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ダイレクトメッセージ</h4>
            <div className="space-y-1">
              {filteredUsers.map(user => {
                const unreadCount = (chatHistories[user.id] || []).filter(m => !m.isRead && m.senderId === user.id).length;
                const lastMessage = (chatHistories[user.id] || [])[chatHistories[user.id]?.length - 1];

                return (
                  <button
                    key={user.id}
                    onClick={() => onSelectChat(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedChat?.id === user.id ? 'bg-green-50 border-green-100 shadow-inner' : 'hover:bg-gray-50 border-transparent'
                    } border`}
                  >
                    <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {lastMessage
                          ? (lastMessage.senderId === currentUser.id ? 'あなた: ' : '') + lastMessage.content
                          : '会話を開始しましょう'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <div className="ml-2 shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-black rounded-full">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredGroups.length === 0 && filteredUsers.length === 0 && searchQuery && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs font-bold text-gray-400">「{searchQuery}」に該当するチャットはありません</p>
          </div>
        )}

        {filteredGroups.length === 0 && filteredUsers.length === 0 && !searchQuery && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs font-bold text-gray-400">チャットはまだありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
