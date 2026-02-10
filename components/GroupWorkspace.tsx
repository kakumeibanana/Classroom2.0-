
import React, { useState } from 'react';
import { MessageSquare, FileText, Link as LinkIcon, Users, Send, ChevronLeft, MoreHorizontal, Plus, Layout, MessageSquarePlus, X } from 'lucide-react';
import { ChatGroup, Message, WorkspaceResource, Post, Attachment, User } from '../types';
import { USERS } from '../constants';
import PostCard from './PostCard';
import PostComposer from './PostComposer';

interface GroupWorkspaceProps {
  group: ChatGroup;
  onBack: () => void;
  currentUser: User;
}

const GroupWorkspace: React.FC<GroupWorkspaceProps> = ({ group, onBack, currentUser }) => {
  const [activeView, setActiveView] = useState<'chat' | 'posts'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'u2', content: '先行研究のリスト、これにまとめておいたよ！', timestamp: '10:05', groupId: group.id },
    { id: '2', senderId: 'u4', content: 'おー、ありがとう！あとで見てみる。', timestamp: '10:10', groupId: group.id },
  ]);
  const [groupPosts, setGroupPosts] = useState<Post[]>([
    {
      id: 'gp1',
      author: USERS[1],
      content: '班内限定で資料共有します！これをもとに次回の会議進めましょう。',
      timestamp: '2時間前',
      likes: 2,
      reactions: [],
      comments: [],
      groupId: group.id,
      attachments: [{ id: 'ga1', title: '班内用メモ', url: '#', type: 'doc' }]
    }
  ]);
  const [resources] = useState<WorkspaceResource[]>([
    { id: 'r1', title: '調査対象リスト.gsheet', type: 'file', lastModified: '2時間前' },
    { id: 'r2', title: '参考論文リンク集', type: 'link', lastModified: '昨日' },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [showPostComposer, setShowPostComposer] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groupId: group.id
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  // Fixed handleCreateGroupPost signature to match PostComposer's onPost prop
  const handleCreateGroupPost = (postData: Partial<Post>, attachments: Attachment[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content: postData.content || '',
      title: postData.title,
      deadline: postData.deadline,
      isAssignment: postData.isAssignment || false,
      timestamp: '今',
      likes: 0,
      reactions: [],
      comments: [],
      groupId: group.id,
      attachments
    };
    setGroupPosts([newPost, ...groupPosts]);
    setShowPostComposer(false);
  };

  const handleAddCommentToGroupPost = (postId: string, content: string, parentCommentId?: string) => {
    setGroupPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      if (parentCommentId) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id !== parentCommentId) return c;
            return {
              ...c,
              replies: [...(c.replies || []), {
                id: Date.now().toString(),
                author: currentUser,
                content,
                timestamp: '今'
              }]
            };
          })
        };
      } else {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now().toString(),
            author: currentUser,
            content,
            timestamp: '今',
            replies: []
          }]
        };
      }
    }));
  };

  const getUser = (id: string) => USERS.find(u => u.id === id);

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Workspace Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              {group.name}
            </h3>
            <p className="text-[10px] text-gray-400">作戦会議室（非公開・先生のみ閲覧可）</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/10 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveView('chat')}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${activeView === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              チャット
            </button>
            <button 
              onClick={() => setActiveView('posts')}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${activeView === 'posts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              掲示板
            </button>
          </div>
          <div className="flex -space-x-2 border-l border-white/10 pl-4">
            {group.members.map((mId, i) => (
              <img key={i} src={getUser(mId)?.avatar} className="w-6 h-6 rounded-full border-2 border-gray-900 shadow-sm" title={getUser(mId)?.name} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Resources (30%) */}
        <div className="w-[30%] border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} /> 資料
            </h4>
            <button className="text-[#1a73e8] hover:bg-blue-50 p-1 rounded-md transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {resources.map(res => (
              <div key={res.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 cursor-pointer transition-all group shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded ${res.type === 'file' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {res.type === 'file' ? <FileText size={16} /> : <LinkIcon size={16} />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-700 truncate">{res.title}</p>
                    <p className="text-[9px] text-gray-400">更新: {res.lastModified}</p>
                  </div>
                </div>
                <MoreHorizontal size={14} className="text-gray-300 group-hover:text-gray-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area (70%) */}
        <div className="w-[70%] flex flex-col bg-white">
          {activeView === 'chat' ? (
            <div className="flex flex-col h-full bg-gray-50/30">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  const sender = getUser(msg.senderId);
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && <img src={sender?.avatar} className="w-7 h-7 rounded-full border border-gray-100 shadow-sm" />}
                      <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && <p className="text-[9px] font-bold text-gray-400 mb-0.5 ml-1 uppercase">{sender?.name}</p>}
                        <div className={`px-4 py-2 rounded-2xl text-xs shadow-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:bg-white transition-all">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="班員にメッセージ..." 
                    className="flex-1 bg-transparent border-none outline-none text-xs font-medium"
                  />
                  <button onClick={handleSendMessage} className="text-blue-500 hover:scale-110 transition-transform p-1">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-gray-50/50">
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={14} /> 班内掲示板
                </h4>
                <button 
                  onClick={() => setShowPostComposer(!showPostComposer)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  <MessageSquarePlus size={14} />
                  新しい共有
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {showPostComposer && (
                  <PostComposer 
                    currentUser={currentUser} 
                    onPost={handleCreateGroupPost} 
                    placeholder="班員だけに共有する内容を入力..."
                    className="border-blue-200 shadow-xl animate-in slide-in-from-top-4"
                  />
                )}

                <div className="space-y-4">
                  {groupPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onUpdatePost={() => {}} 
                      onAddComment={handleAddCommentToGroupPost}
                    />
                  ))}
                  {groupPosts.length === 0 && !showPostComposer && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                      <Users size={40} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">班内の投稿はまだありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupWorkspace;
