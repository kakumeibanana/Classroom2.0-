import React, { useState } from 'react';
import { Send, Phone, Video, Info, Paperclip, Smile, Reply, Heart, ThumbsUp, Check, X, User as UserIcon, Users } from 'lucide-react';
import { User, ChatGroup } from '../types';
import { USERS } from '../constants';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  reactions?: { type: string; count: number; users: string[] }[];
  replyToId?: string;
  groupId?: string;
  receiverId?: string;
}

interface MessageAreaProps {
  selectedChat: User | ChatGroup;
  activeMessages: ChatMessage[];
  currentUser: User;
  onSendMessage: (message: string) => void;
  onReaction: (msgId: string, type: string) => void;
  onReplySelect: (msg: ChatMessage) => void;
  onReplyClear: () => void;
  replyTarget: ChatMessage | null;
}

export const MessageArea: React.FC<MessageAreaProps> = ({
  selectedChat,
  activeMessages,
  currentUser,
  onSendMessage,
  onReaction,
  onReplySelect,
  onReplyClear,
  replyTarget,
}) => {
  const [inputValue, setInputValue] = useState('');
  const isGroup = 'members' in selectedChat;
  const getUser = (id: string) => USERS.find(u => u.id === id);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {isGroup ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1a73e8]">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-900">{selectedChat.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                  <Users size={10} />
                  班員: {selectedChat.members.length}名
                </p>
              </div>
            </>
          ) : (
            <>
              <img src={selectedChat.avatar} className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" />
              <div>
                <h3 className="font-black text-gray-900">{selectedChat.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                  <UserIcon size={10} />
                  個人チャット
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors">
            <Video size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-gray-50 rounded-full transition-colors">
            <Info size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
        {activeMessages.length > 0 ? (
          activeMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const sender = getUser(msg.senderId);
            const repliedTo = msg.replyToId ? activeMessages.find(m => m.id === msg.replyToId) : null;

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group animate-in slide-in-from-bottom-2 duration-300`}>
                {!isMe && <img src={sender?.avatar} className="w-8 h-8 rounded-full mb-1 border border-gray-200 shadow-sm" />}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col relative`}>
                  {repliedTo && (
                    <div className="text-[10px] px-3 py-1 bg-gray-200/50 text-gray-500 rounded-t-xl border-l-4 border-blue-400 mb-[-1px] max-w-full truncate">
                      <span className="font-black mr-1">{getUser(repliedTo.senderId)?.name}:</span>
                      {repliedTo.content}
                    </div>
                  )}

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all group-hover:shadow-md ${
                      isMe ? 'bg-[#1a73e8] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}
                  >
                    {msg.content}

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 -mb-1">
                        {msg.reactions.map(r => (
                          <button
                            key={r.type}
                            onClick={() => onReaction(msg.id, r.type)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${
                              r.users.includes(currentUser.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                            }`}
                          >
                            {r.type === 'heart' && <Heart size={10} fill={r.users.includes(currentUser.id) ? 'currentColor' : 'none'} />}
                            {r.type === 'thumbsup' && <ThumbsUp size={10} />}
                            {r.type === 'check' && <Check size={10} />}
                            {r.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`absolute top-0 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    <button
                      onClick={() => onReplySelect(msg)}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-blue-500 hover:scale-110 transition-all"
                    >
                      <Reply size={14} />
                    </button>
                    <button
                      onClick={() => onReaction(msg.id, 'heart')}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-pink-500 hover:scale-110 transition-all"
                    >
                      <Heart size={14} />
                    </button>
                    <button
                      onClick={() => onReaction(msg.id, 'thumbsup')}
                      className="p-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-gray-400 hover:text-amber-500 hover:scale-110 transition-all"
                    >
                      <ThumbsUp size={14} />
                    </button>
                  </div>

                  <p className={`text-[8px] text-gray-400 mt-1 font-bold ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
              <Smile size={32} className="text-gray-200" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">会話はまだありません</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white shadow-lg z-10">
        {replyTarget && (
          <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex-1 truncate">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{getUser(replyTarget.senderId)?.name}さんへリプライ中</p>
              <p className="text-[11px] text-gray-500 truncate">{replyTarget.content}</p>
            </div>
            <button onClick={onReplyClear} className="p-1 text-blue-300 hover:text-blue-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 px-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
          <button className="p-2 text-gray-400 hover:text-[#1a73e8] transition-colors">
            <Paperclip size={20} />
          </button>
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`${selectedChat.name}さんにメッセージ...`}
            className="flex-1 py-2 bg-transparent border-none outline-none text-sm resize-none max-h-32 font-bold no-scrollbar"
          />
          <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
            <Smile size={20} />
          </button>
          <button
            onClick={handleSend}
            className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-[#1a73e8] text-white shadow-lg shadow-blue-200' : 'text-gray-300'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageArea;
