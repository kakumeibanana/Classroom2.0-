import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import Chat from './components/Chat';
import TeacherDashboard from './components/TeacherDashboard';
import GroupWorkspace from './components/GroupWorkspace';
import PostComposer from './components/PostComposer';
import TodoList from './components/TodoList';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import { MOCK_POSTS, CURRENT_USER, USERS, MOCK_GROUPS, MOCK_SUBJECTS, MOCK_NOTIFICATIONS } from './constants';
import { Layout, BookOpen, Users, ShieldAlert, Plus, UserPlus, X, ClipboardCheck, Check, Lock, User as UserIcon, Folder, MoreVertical } from 'lucide-react';
import { Post, ChatGroup, Attachment, User, Notification, SimulationStatus } from './types';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState('home');
  const [subjectSubTab, setSubjectSubTab] = useState<'stream' | 'classwork' | 'groups' | 'todo'>('stream');
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [groups, setGroups] = useState<ChatGroup[]>(MOCK_GROUPS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const teacher = USERS.find(u => u.role === 'teacher');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const switchUser = (id?: string) => {
    if (id) {
      const user = USERS.find(u => u.id === id);
      if (user) {
        setActiveUser(user);
        setSelectedGroup(null);
      }
      return;
    }
    const currentIndex = USERS.findIndex(u => u.id === activeUser.id);
    const nextIndex = (currentIndex + 1) % USERS.length;
    setActiveUser(USERS[nextIndex]);
    setSelectedGroup(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (link: string) => {
    setSelectedGroup(null);
    if (link === 'chat') {
      setActiveTab('chat');
    } else if (link === 'todo') {
      setActiveTab('todo');
    } else if (link.startsWith('subject-')) {
      const subjectId = link.split('-')[1];
      setActiveTab(`subject-${subjectId}`);
      if (notifications.find(n => n.link === link && n.type === 'assignment')) {
        setSubjectSubTab('classwork');
      } else {
        setSubjectSubTab('stream');
      }
    }
  };

  // ステータスを4段階でサイクルさせるシミュレーション関数
  const cycleSimulationStatus = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id !== postId) return p;
      const current = p.simulationStatus || 'pending';
      let next: SimulationStatus;
      switch (current) {
        case 'pending': next = 'overdue'; break;
        case 'overdue': next = 'submitted'; break;
        case 'submitted': next = 'late'; break;
        case 'late': next = 'pending'; break;
        default: next = 'pending';
      }
      return { ...p, simulationStatus: next };
    }));
  };

  const handleCreatePost = (postData: Partial<Post>, attachments: Attachment[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: activeUser,
      content: postData.content || '',
      title: postData.title,
      deadline: postData.deadline,
      isAssignment: postData.isAssignment || false,
      isGroupAssignment: postData.isGroupAssignment || false,
      timestamp: '今',
      likes: 0,
      reactions: [],
      comments: [],
      subjectId: activeTab.startsWith('subject-') ? activeTab.split('-')[1] : 's1',
      attachments,
      simulationStatus: 'pending' // デフォルトは期限内・未提出
    };
    setPosts([newPost, ...posts]);
    if (newPost.isAssignment) {
      setSubjectSubTab('classwork');
      
      const newNotification: Notification = {
        id: `n${Date.now()}`,
        type: 'assignment',
        title: '課題が追加されました',
        description: `${activeUser.name}が「${newPost.title}」を投稿しました。`,
        timestamp: '今',
        isRead: false,
        link: activeTab
      };
      setNotifications([newNotification, ...notifications]);
    }
  };

  const handleAddComment = (postId: string, content: string, parentCommentId?: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment = {
        id: Date.now().toString(),
        author: activeUser,
        content,
        timestamp: '今',
        replies: []
      };
      return { ...p, comments: [...p.comments, newComment] };
    }));
  };

  const handleUpdatePost = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedStudentIds.length === 0) {
      alert('班の名前と、少なくとも1人のメンバーを選択してください');
      return;
    }
    const subjectId = activeTab.split('-')[1];
    const newGroup: ChatGroup = {
      id: `G${Date.now()}`,
      name: newGroupName,
      members: selectedStudentIds, 
      subjectId: subjectId
    };
    setGroups([...groups, newGroup]);
    
    const newNotif: Notification = {
      id: `n_g_${Date.now()}`,
      type: 'group',
      title: '班への配属',
      description: `新しい班「${newGroupName}」に配属されました。`,
      timestamp: '今',
      isRead: false,
      link: activeTab
    };
    setNotifications([newNotif, ...notifications]);

    setNewGroupName('');
    setSelectedStudentIds([]);
    setShowGroupCreator(false);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const navigateToPost = (subjectId: string, postId: string) => {
    setActiveTab(`subject-${subjectId}`);
    setSubjectSubTab('classwork');
  };

  const renderSubjectContent = (subjectId: string) => {
    const subject = MOCK_SUBJECTS.find(s => s.id === subjectId);
    const subjectPosts = posts.filter(p => p.subjectId === subjectId);
    const subjectAssignments = subjectPosts.filter(p => p.isAssignment);
    const isTeacher = activeUser.role === 'teacher';
    
    const subjectGroups = groups.filter(g => 
      g.subjectId === subjectId && (isTeacher || g.members.includes(activeUser.id))
    );

    if (selectedGroup) {
      return (
        <GroupWorkspace 
          group={selectedGroup} 
          onBack={() => setSelectedGroup(null)} 
          currentUser={activeUser}
        />
      );
    }

    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">
          <div className="h-32 sm:h-40 relative overflow-hidden">
            <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: subject?.color || '#1a73e8' }}></div>
            <div className="absolute bottom-6 left-8 text-gray-900">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{subject?.name}</h2>
              {subject?.subtitle && <p className="text-sm font-bold opacity-70 mt-1">{subject.subtitle}</p>}
            </div>
            {/* Subject Header Teacher Photo */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2">
              <img 
                src={teacher?.avatar} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-xl"
                alt="Teacher"
              />
            </div>
          </div>
          
          <div className="flex border-t border-gray-100 px-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'stream', label: 'ストリーム', icon: Layout },
              { id: 'classwork', label: '授業', icon: BookOpen },
              { id: 'todo', label: 'To-do', icon: ClipboardCheck, show: !isTeacher },
              { id: 'groups', label: '班別ワーク', icon: Users, badge: subjectGroups.length },
            ].filter(tab => tab.show !== false).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubjectSubTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-xs font-black transition-all border-b-2 shrink-0
                  ${subjectSubTab === tab.id 
                    ? 'border-[#1a73e8] text-[#1a73e8]' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
                `}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 text-[9px] bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {subjectSubTab === 'stream' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
              <PostComposer 
                currentUser={activeUser} 
                onPost={handleCreatePost} 
                placeholder="クラスのみんなに共有しましょう..."
              />
              
              <div className="space-y-6">
                {subjectPosts.filter(p => !p.isAssignment && !p.groupId).map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpdatePost={handleUpdatePost} 
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            </div>
          )}

          {subjectSubTab === 'classwork' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
              {subjectAssignments.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUpdatePost={handleUpdatePost} 
                  onAddComment={handleAddComment}
                  onCycleStatus={() => cycleSimulationStatus(post.id)}
                />
              ))}
            </div>
          )}

          {subjectSubTab === 'todo' && !isTeacher && (
             <TodoList 
                assignments={subjectAssignments} 
                onViewPost={navigateToPost}
                onCycleStatus={cycleSimulationStatus}
                title={`${subject?.name} の To-do`}
             />
          )}

          {subjectSubTab === 'groups' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {isTeacher && !showGroupCreator && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowGroupCreator(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                  >
                    <UserPlus size={18} />
                    新しい班を作成
                  </button>
                </div>
              )}

              {showGroupCreator && (
                <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl animate-in slide-in-from-top-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-gray-800 text-lg">班の新規作成</h3>
                      <p className="text-xs text-gray-400 font-bold">メンバーを選んで班を構成しましょう</p>
                    </div>
                    <button onClick={() => setShowGroupCreator(false)} className="text-gray-400 hover:text-red-500">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">班の名前</label>
                      <input 
                        type="text" 
                        placeholder="例: 第1班 現代文グループ" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">メンバーを選択</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {USERS.filter(u => u.role === 'student').map(student => (
                          <button
                            key={student.id}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              selectedStudentIds.includes(student.id) 
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <img src={student.avatar} className="w-8 h-8 rounded-full" />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-gray-800 truncate">{student.name}</p>
                            </div>
                            {selectedStudentIds.includes(student.id) && <Check size={14} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleCreateGroup}
                      className="w-full py-4 bg-[#1a73e8] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                      班を作成する
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectGroups.map(group => (
                  <div key={group.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Users size={24} />
                        </div>
                        <div className="flex -space-x-2">
                          {group.members.map((mId, i) => (
                            <img 
                              key={i} 
                              src={USERS.find(u => u.id === mId)?.avatar} 
                              className="w-6 h-6 rounded-full border-2 border-white" 
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{group.name}</h3>
                      <p className="text-xs text-gray-500">メンバー: {group.members.map(id => USERS.find(u => u.id === id)?.name).join(', ')}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedGroup(group)}
                      className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-[#1a73e8] hover:text-white text-gray-600 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isTeacher ? <ShieldAlert size={14} /> : null}
                      会議室へ入る
                    </button>
                  </div>
                ))}
                {subjectGroups.length === 0 && !isTeacher && (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Lock size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-gray-400">あなたはまだどの班にも所属していません</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] overflow-hidden">
      <Header 
        onToggleSidebar={toggleSidebar} 
        currentUser={activeUser} 
        onSwitchToUser={(id: string) => switchUser(id)} 
        notifications={notifications}
        onShowNotifications={() => { setActiveTab('notifications'); markAllNotificationsAsRead(); }}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebarを追加 */}
        <Sidebar 
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={activeUser}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10 no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-500 pb-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900">クラス一覧</h2>
                  <p className="text-sm font-bold text-gray-400 mt-1">選択して授業に参加しましょう</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {MOCK_SUBJECTS.map(subject => (
                    <div 
                      key={subject.id}
                      onClick={() => handleNotificationClick(`subject-${subject.id}`)}
                      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-64"
                    >
                        {/* 背景色 */}
                        <div className="h-24 w-full transition-colors duration-500 relative" style={{ backgroundColor: subject.color || '#1a73e8' }}>
                          {/* 先生のアイコン */}
                           <div className="absolute -bottom-8 right-4">
                            <img 
                              src={teacher?.avatar} 
                              className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white"
                              alt="Teacher"
                            />
                          </div>
                        </div>

                        {/* カードの内容 */}
                        <div className="p-5 pt-10 flex-1">
                          <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:underline line-clamp-1">{subject.name}</h3>
                          <p className="text-[10px] font-bold text-gray-600 mt-1">{subject.subtitle || '2024年度'}</p>
                          <p className="text-[10px] font-bold text-gray-500 mt-0.5">鈴木先生</p>
                        </div>
                        
                        {/* カードのフッターアクション */}
                        <div className="p-3 border-t border-gray-100 flex items-center justify-end gap-1 mt-auto">
                          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><UserIcon size={20} /></button>
                          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Folder size={20} /></button>
                          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                        </div>
                    </div>
                  ))}
                  
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer h-64">
                    <Plus size={40} className="text-gray-300 mb-3" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">新しいクラスに参加</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'notifications' && (
              <NotificationsView 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onNotificationClick={handleNotificationClick}
              />
            )}
            {activeTab === 'todo' && (
              <TodoList 
                assignments={activeUser.role === 'teacher' ? posts.filter(p => p.author.id === activeUser.id) : posts.filter(p => p.isAssignment)} 
                onViewPost={navigateToPost}
                onCycleStatus={cycleSimulationStatus}
              />
            )}
            {activeTab === 'chat' && <div className="h-full min-h-[500px]"><Chat currentUser={activeUser} /></div>}
            {activeTab === 'settings' && <SettingsView currentUser={activeUser} />}
            {activeTab === 'monitor' && <TeacherDashboard />}
            {activeTab.startsWith('subject-') && renderSubjectContent(activeTab.split('-')[1])}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center z-50 shrink-0">
        <p className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-2">
          <ShieldAlert size={14} className="text-blue-500" />
          Classroom 2.0 教育用安全環境 ({activeUser.role === 'teacher' ? '管理モード' : '生徒モード'})
        </p>
      </footer>
    </div>
  );
};

export default App;