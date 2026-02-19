
import React, { useState } from 'react';
import MentionInput from './MentionInput';
import FileUploader from './FileUploader';
import { Attachment, User, Post } from '../types';
import { ClipboardList, Calendar, Users, CheckSquare, Square } from 'lucide-react';

interface PostComposerProps {
  currentUser: User;
  onPost: (postData: Partial<Post>, attachments: Attachment[]) => void;
  placeholder?: string;
  className?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({ currentUser, onPost, placeholder, className }) => {
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
  const [isAssignmentMode, setIsAssignmentMode] = useState(false);
  const [isGroupAssignment, setIsGroupAssignment] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [content, setContent] = useState('');
  const isTeacher = currentUser.role === 'teacher';

  const handleAttach = (file: Attachment) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  const handleRemove = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = (content: string) => {
    if (isAssignmentMode && !title.trim()) {
      alert('課題のタイトルを入力してください');
      return;
    }

    onPost({
      content,
      title: isAssignmentMode ? title : undefined,
      deadline: isAssignmentMode ? deadline : undefined,
      isAssignment: isAssignmentMode,
      isGroupAssignment: isAssignmentMode ? isGroupAssignment : false,
    }, attachedFiles);

    setAttachedFiles([]);
    setTitle('');
    setDeadline('');
    setIsAssignmentMode(false);
    setIsGroupAssignment(false);
    setContent('');
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-all focus-within:border-blue-300 focus-within:shadow-md ${className}`}>
      {isTeacher && (
        <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-50">
          <button
            onClick={() => {
              setIsAssignmentMode(!isAssignmentMode);
              if (isAssignmentMode) setIsGroupAssignment(false);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isAssignmentMode 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ClipboardList size={14} />
            課題として投稿
          </button>
          
          {isAssignmentMode && (
            <button
              onClick={() => setIsGroupAssignment(!isGroupAssignment)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                isGroupAssignment 
                  ? 'bg-purple-50 text-purple-600 border-purple-200' 
                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isGroupAssignment ? <CheckSquare size={14} /> : <Square size={14} />}
              班で1つ提出
            </button>
          )}

          {isAssignmentMode && (
            <span className="text-[10px] font-bold text-blue-500 animate-pulse ml-auto hidden sm:block">
              課題作成モード有効 {isGroupAssignment && " (班単位)"}
            </span>
          )}
        </div>
      )}

      {isAssignmentMode && (
        <div className="space-y-3 mb-4 animate-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="課題のタイトルを入力してください..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="期限 (例: 2月20日)"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0" />
        <MentionInput 
          placeholder={isAssignmentMode ? "課題の詳細や指示を入力..." : (placeholder || "メッセージを入力... (@でメンション)")} 
          onSend={handleSend}
          value={content}
          onChange={setContent}
        />
      </div>
      
      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
        <FileUploader 
          attachments={attachedFiles} 
          onAttach={handleAttach} 
          onRemove={handleRemove} 
        />
        <button
          onClick={() => handleSend(content)}
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          投稿
        </button>
      </div>
    </div>
  );
};

export default PostComposer;
