
import React, { useState, useEffect } from 'react';
/* Added 'X' to the imports from lucide-react */
import { Send, Search, Info, ShieldAlert, Phone, Video, Paperclip, Smile, Users, User as UserIcon, Reply, Heart, ThumbsUp, Check, X } from 'lucide-react';
import { USERS, MOCK_GROUPS } from '../constants';
import { Message, User, ChatGroup } from '../types';

interface ChatProps {
  currentUser: User;
}

interface ChatMessage extends Message {
  reactions?: { type: string; count: number; users: string[] }[];
  replyToId?: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<User | ChatGroup>(MOCK_GROUPS[0]);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const createConversation = (user: User) => {
    setSelectedChat(user);
    setReplyTarget(null);
    setChatHistories(prev => {
      const next = { ...prev };
      next[user.id] = next[user.id] || [];
      // mark messages as read for this user (messages sent to currentUser)
      next[user.id] = next[user.id].map(m => m.senderId !== currentUser.id ? { ...m, isRead: true } : m);
      return next;
    });
  };
  
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({
    'G1': [
      { id: 'g1_m1', senderId: 'u2', content: '現代文の課題、進んでる？', timestamp: '10:00', groupId: 'G1', reactions: [], isRead: true },
      { id: 'g1_m2', senderId: 'u3', content: '半分くらい終わったよ！', timestamp: '10:05', groupId: 'G1', reactions: [{ type: 'check', count: 1, users: ['u2'] }], isRead: true },
    ],
    'u2': [
      { id: 'dm_u2_1', senderId: 'u2', content: 'Aさん、さっきの授業のノート見せてくれない？', timestamp: '09:30', reactions: [], isRead: false },
    ],
    'u3': [
      { id: 'dm_u3_1', senderId: 'u3', content: '今日の放課後、図書室行く？', timestamp: '08:45', reactions: [], isRead: false },
    ],
    'u7': [
      { id: 'dm_u7_1', senderId: 'u7', content: '提出物の期限について相談がありますか？', timestamp: '昨日', reactions: [], isRead: true },
    ]
  });

  const [inputValue, setInputValue] = useState('');
  const activeMessages = chatHistories[selectedChat.id] || [];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groupId: 'members' in selectedChat ? selectedChat.id : undefined,
      receiverId: 'members' in selectedChat ? undefined : selectedChat.id,
      reactions: [],
      isRead: true,
      replyToId: replyTarget?.id
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));
    
    setInputValue('');
    setReplyTarget(null);
  };

  const handleReaction = (msgId: string, type: string) => {
    setChatHistories(prev => {
      const history = [...(prev[selectedChat.id] || [])];
      const msgIndex = history.findIndex(m => m.id === msgId);
      if (msgIndex === -1) return prev;

      const msg = { ...history[msgIndex] };
      const reactions = [...(msg.reactions || [])];
      const reactionIndex = reactions.findIndex(r => r.type === type);

      if (reactionIndex > -1) {
        const users = [...reactions[reactionIndex].users];
        if (users.includes(currentUser.id)) {
          reactions[reactionIndex].count -= 1;
          reactions[reactionIndex].users = users.filter(u => u !== currentUser.id);
          if (reactions[reactionIndex].count === 0) reactions.splice(reactionIndex, 1);
        } else {
          reactions[reactionIndex].count += 1;
          reactions[reactionIndex].users.push(currentUser.id);
        }
      } else {
        reactions.push({ type, count: 1, users: [currentUser.id] });
      }

      msg.reactions = reactions;
      history[msgIndex] = msg;
      return { ...prev, [selectedChat.id]: history };
    });
  };

  const getUser = (id: string) => USERS.find(u => u.id === id);

  return (
    <div className="flex h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="w-80 border-r border-gray-100 hidden lg:flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="相手名またはメッセージを検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="px-4 py-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">グループ</h4>
            <div className="space-y-1">
              {MOCK_GROUPS.filter(g => currentUser.role === 'teacher' || g.members.includes(currentUser.id)).filter(g => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return g.name.toLowerCase().includes(q) || (chatHistories[g.id] || []).some(m => m.content.toLowerCase().includes(q));
              }).map(group => (
                <button 
                  key={group.id}
                  onClick={() => { setSelectedChat(group); setReplyTarget(null); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat.id === group.id ? 'bg-blue-50 border-blue-100 shadow-inner' : 'hover:bg-gray-50 border-transparent'} border`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedChat.id === group.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-blue-100 text-[#1a73e8]'}`}>
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
            <div className="px-4 py-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ダイレクトメッセージ</h4>
              <div className="space-y-1">
                {USERS.filter(u => u.id !== currentUser.id).filter(user => {
                  const hasMessages = chatHistories[user.id] && chatHistories[user.id].length > 0;
                  if (!searchQuery) return hasMessages; // when no search, keep previous behavior (hide no-interaction users)
                  const q = searchQuery.toLowerCase();
                  const lastMsg = (chatHistories[user.id] || []).slice(-5).map(m => m.content.toLowerCase()).join(' ');
                  return user.name.toLowerCase().includes(q) || lastMsg.includes(q);
                }).map(user => (
                  <button 
                    key={user.id}
                    onClick={() => createConversation(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat.id === user.id ? 'bg-green-50 border-green-100 shadow-inner' : 'hover:bg-gray-50 border-transparent'} border`}
                  >
                    <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {chatHistories[user.id]?.length > 0 
                          ? (chatHistories[user.id][chatHistories[user.id].length - 1].senderId === currentUser.id ? 'あなた: ' : '') + chatHistories[user.id][chatHistories[user.id].length - 1].content 
                          : '会話を開始しましょう（クリックで開始）'}
                      </p>
                    </div>
                    {/* unread indicator */}
                    { (chatHistories[user.id] || []).filter(m => !m.isRead && m.senderId !== currentUser.id).length > 0 && (
                      <div className="ml-2 shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-black rounded-full">
                          {(chatHistories[user.id] || []).filter(m => !m.isRead && m.senderId !== currentUser.id).length}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {'name' in selectedChat && (
              <div className="flex items-center gap-3">
                {'avatar' in selectedChat ? (
                  <img src={selectedChat.avatar} className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1a73e8]">
                    <Users size={20} />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-gray-900">{selectedChat.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                    {'avatar' in selectedChat ? <UserIcon size={10} /> : <Users size={10} />}
                    {'avatar' in selectedChat ? '個人チャット' : `班員: ${selectedChat.members.length}名`}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors"><Phone size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors"><Video size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors"><Info size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
          {activeMessages.length > 0 ? activeMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const sender = getUser(msg.senderId);
            const repliedTo = msg.replyToId ? activeMessages.find(m => m.id === msg.replyToId) : null;

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group animate-in slide-in-from-bottom-2 duration-300`}>
                {!isMe && <img src={sender?.avatar} className="w-8 h-8 rounded-full mb-1 border border-gray-200 shadow-sm" />}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col relative`}>
                  
                  {/* Replied Message Preview */}
                  {repliedTo && (
                    <div className={`text-[10px] px-3 py-1 bg-gray-200/50 text-gray-500 rounded-t-xl border-l-4 border-blue-400 mb-[-1px] max-w-full truncate`}>
                      <span className="font-black mr-1">{getUser(repliedTo.senderId)?.name}:</span>
                      {repliedTo.content}
                    </div>
                  )}

                  <div className={`
                    px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all group-hover:shadow-md
                    ${isMe 
                      ? 'bg-[#1a73e8] text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}
                  `}>
                    {msg.content}
                    
                    {/* Reactions Bar */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-2 -mb-1`}>
                        {msg.reactions.map(r => (
                          <button 
                            key={r.type}
                            onClick={() => handleReaction(msg.id, r.type)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${
                              r.users.includes(currentUser.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                            }`}
                          >
                            {r.type === 'heart' && <Heart size={10} fill={r.users.includes(currentUser.id) ? "currentColor" : "none"} />}
                            {r.type === 'thumbsup' && <ThumbsUp size={10} />}
                            {r.type === 'check' && <Check size={10} />}
                            {r.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Controls */}
                  <div className={`absolute top-0 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    <button 
                      onClick={() => setReplyTarget(msg)}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-blue-500 hover:scale-110 transition-all"
                    >
                      <Reply size={14} />
                    </button>
                    <button 
                      onClick={() => handleReaction(msg.id, 'heart')}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-pink-500 hover:scale-110 transition-all"
                    >
                      <Heart size={14} />
                    </button>
                    <button 
                      onClick={() => handleReaction(msg.id, 'thumbsup')}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-amber-500 hover:scale-110 transition-all"
                    >
                      <ThumbsUp size={14} />
                    </button>
                  </div>

                  <p className={`text-[8px] text-gray-400 mt-1 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                <Smile size={32} className="text-gray-200" />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                会話はまだありません
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white shadow-lg z-10">
          {replyTarget && (
            <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div className="flex-1 truncate">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{getUser(replyTarget.senderId)?.name}さんへリプライ中</p>
                <p className="text-[11px] text-gray-500 truncate">{replyTarget.content}</p>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-1 text-blue-300 hover:text-blue-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 px-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
            <button className="p-2 text-gray-400 hover:text-[#1a73e8] transition-colors"><Paperclip size={20} /></button>
            <textarea 
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder={`${selectedChat.name}さんにメッセージ...`}
              className="flex-1 py-2 bg-transparent border-none outline-none text-sm resize-none max-h-32 font-bold no-scrollbar"
            />
            <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors"><Smile size={20} /></button>
            <button 
              onClick={handleSend}
              className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-[#1a73e8] text-white shadow-lg shadow-blue-200' : 'text-gray-300'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
