import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { USERS, MOCK_GROUPS } from '../constants';
import { Message, User, ChatGroup } from '../types';
import { useAppContext } from '../context/AppContext';
import ChatList from './ChatList';
import MessageArea from './MessageArea';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const { state, dispatch } = useAppContext();
  const { chatHistories } = state;
  const [selectedChat, setSelectedChat] = useState<User | ChatGroup | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectChat = (chat: User | ChatGroup) => {
    setSelectedChat(chat);
    setReplyTarget(null);
    
    // Mark messages as read
    if (!('members' in chat)) {
      const messages = chatHistories[chat.id] || [];
      const hasUnread = messages.some(m => !m.isRead && m.senderId === chat.id);
      if (hasUnread) {
        const updatedMessages = messages.map(m =>
          !m.isRead && m.senderId === chat.id ? { ...m, isRead: true } : m
        );
        dispatch({
          type: 'SET_CHAT_HISTORIES',
          payload: { ...chatHistories, [chat.id]: updatedMessages }
        });
      }
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedChat || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      ...(replyTarget && { replyToId: replyTarget.id }),
      ...(!('members' in selectedChat) && { receiverId: selectedChat.id })
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        fromUserId: currentUser.id,
        toUserId: selectedChat.id,
        message: newMessage
      }
    });

    setReplyTarget(null);
  };

  const handleReaction = (msgId: string, type: string) => {
    if (!selectedChat) return;

    const messages = chatHistories[selectedChat.id] || [];
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;

    const msg = { ...messages[msgIndex] };
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

    const updatedMessages = [
      ...messages.slice(0, msgIndex),
      { ...msg, reactions },
      ...messages.slice(msgIndex + 1)
    ];

    dispatch({
      type: 'SET_CHAT_HISTORIES',
      payload: { ...chatHistories, [selectedChat.id]: updatedMessages }
    });
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <ChatList
        currentUser={currentUser}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        searchQuery={searchQuery}
        chatHistories={chatHistories}
        groups={MOCK_GROUPS.filter(g => currentUser.role === 'teacher' || g.members.includes(currentUser.id))}
        onSearchChange={setSearchQuery}
      />

      {selectedChat && (
        <MessageArea
          selectedChat={selectedChat}
          activeMessages={chatHistories[selectedChat.id] || []}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onReaction={handleReaction}
          onReplySelect={setReplyTarget}
          onReplyClear={() => setReplyTarget(null)}
          replyTarget={replyTarget}
        />
      )}

      {!selectedChat && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
            <Send size={32} className="text-gray-200" />
          </div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">メッセージを選択</p>
          <p className="text-[11px] text-gray-400 mt-2 font-bold">左からグループまたは相手を選んでメッセージを送信しましょう</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
