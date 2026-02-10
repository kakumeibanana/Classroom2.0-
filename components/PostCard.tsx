
import React, { useState } from 'react';
import { MoreVertical, FileText, Layout as SlidesIcon, ClipboardList, Heart, MessageCircle, Pin, Reply, Send, FileSpreadsheet, FileBox, FileCode, CheckCircle2, AlertCircle, Users, Clock, Circle } from 'lucide-react';
import { Post, Comment, Attachment } from '../types';
import { CURRENT_USER } from '../constants';
import MentionText from './MentionText';
import MentionInput from './MentionInput';

interface PostCardProps {
  post: Post;
  onUpdatePost: (postId: string, newContent: string) => void;
  onDeletePost?: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onCycleStatus?: () => void;
}

const AttachmentIcon = ({ type }: { type: Attachment['type'] }) => {
  switch (type) {
    case 'doc': return <FileText size={18} className="text-blue-600" />;
    case 'slide': return <SlidesIcon size={18} className="text-amber-600" />;
    case 'sheet': return <FileSpreadsheet size={18} className="text-green-600" />;
    case 'ppt': return <FileBox size={18} className="text-orange-600" />;
    case 'pdf': return <FileCode size={18} className="text-red-600" />;
    default: return <FileText size={18} className="text-gray-600" />;
  }
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 group">
        <img src={comment.author.avatar} className="w-8 h-8 rounded-full border border-gray-100" />
        <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl px-4 py-2.5 shadow-sm group-hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-xs text-gray-900">{comment.author.name}</span>
            <span className="text-[9px] text-gray-400">{comment.timestamp}</span>
          </div>
          <div className="text-xs text-gray-700">
            <MentionText text={comment.content} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, onUpdatePost, onDeletePost, onAddComment, onCycleStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const renderAttachments = () => (
    post.attachments && post.attachments.length > 0 && (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {post.attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all shadow-sm bg-white">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
              <AttachmentIcon type={att.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{att.title}</p>
              <p className="text-[9px] text-gray-400 uppercase font-black">{att.type === 'doc' ? 'Google Docs' : att.type === 'sheet' ? 'Google Sheets' : att.type === 'slide' ? 'Google Slides' : att.type === 'ppt' ? 'PowerPoint' : 'File'}</p>
            </div>
          </div>
        ))}
      </div>
    )
  );

  if (!post.isAssignment) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group animate-in fade-in duration-300">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">{post.author.name}</span>
                <span className="text-[10px] text-gray-400">{post.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pin size={14} className="text-gray-300 cursor-pointer hover:text-blue-500" />
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed mb-3">
              <MentionText text={post.content} />
            </div>
            
            {renderAttachments()}

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
              <button 
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 text-xs font-black transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                {liked ? post.likes + 1 : post.likes}
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-blue-600 transition-colors"
              >
                <MessageCircle size={16} />
                コメント {post.comments.length}
              </button>
            </div>

            {showComments && (
              <div className="mt-6 space-y-6 pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  {post.comments.map(comment => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                    />
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <img src={CURRENT_USER.avatar} className="w-8 h-8 rounded-full shadow-sm" />
                  <MentionInput 
                    placeholder="コメントを入力... (@でメンション)" 
                    onSend={(content) => onAddComment(post.id, content)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ステータスに基づくスタイリング定義
  const status = post.simulationStatus || 'pending';
  let cardBorder = "border-gray-200";
  let statusBadge = "";
  let statusLabel = "";
  let StatusIcon = Circle;
  let iconBg = "";

  switch (status) {
    case 'pending':
      cardBorder = "border-blue-100 shadow-sm";
      statusBadge = "bg-blue-50 text-blue-600 border-blue-100";
      statusLabel = "未提出 (受付中)";
      StatusIcon = Circle;
      iconBg = "bg-[#1a73e8]";
      break;
    case 'overdue':
      cardBorder = "border-red-300 shadow-red-50 ring-1 ring-red-100";
      statusBadge = "bg-red-100 text-red-700 border-red-200";
      statusLabel = "期限超過・未提出";
      StatusIcon = AlertCircle;
      iconBg = "bg-red-600";
      break;
    case 'submitted':
      cardBorder = "border-green-200 shadow-green-50";
      statusBadge = "bg-green-50 text-green-700 border-green-200";
      statusLabel = "期限内に提出";
      StatusIcon = CheckCircle2;
      iconBg = "bg-green-500";
      break;
    case 'late':
      cardBorder = "border-gray-300 shadow-sm";
      statusBadge = "bg-gray-100 text-gray-600 border-gray-200";
      statusLabel = "期限後に提出";
      StatusIcon = Clock;
      iconBg = "bg-gray-400"; // 期限後は灰色
      break;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex-1">
        <article className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${cardBorder}`}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <button 
                onClick={onCycleStatus}
                title="ステータスを切り替え (シミュレーション)"
                className={`p-3 rounded-xl text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${iconBg}`}
              >
                <StatusIcon size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                  <div className="flex gap-1.5">
                    <span className={`px-2 py-0.5 border text-[10px] font-black rounded-full uppercase transition-colors ${statusBadge}`}>
                      {statusLabel}
                    </span>
                    {post.isGroupAssignment && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                        <Users size={10} /> 班単位の課題
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mb-4">{post.author.name} • {post.timestamp}</p>
                
                <div className="text-sm text-gray-700 leading-relaxed mb-6 border-t border-gray-50 pt-4">
                  <MentionText text={post.content} />
                </div>

                {renderAttachments()}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                      <MessageCircle size={14} /> クラスのコメント ({post.comments.length})
                    </h4>
                  </div>
                  <div className="space-y-4 mb-6">
                    {post.comments.map(comment => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <img src={CURRENT_USER.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <MentionInput 
                      placeholder="先生やクラスメイトへコメント..." 
                      onSend={(content) => onAddComment(post.id, content)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="w-full lg:w-72">
        <div className={`bg-white border rounded-xl p-5 shadow-sm sticky top-24 transition-all ${cardBorder}`}>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-gray-900">あなたの提出状況</h3>
             <span className={`text-[10px] font-black ${
               status === 'pending' ? 'text-blue-500' :
               status === 'overdue' ? 'text-red-600' :
               status === 'submitted' ? 'text-green-600' : 'text-gray-500'
             }`}>
                {status === 'pending' ? '受付中' :
                 status === 'overdue' ? '期限切れ' :
                 status === 'submitted' ? '完了' : '完了(遅延)'}
             </span>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={onCycleStatus}
              className={`w-full py-2.5 rounded-lg text-xs font-black transition-all shadow-md ${
                status.startsWith('submitted') || status === 'late'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : (status === 'overdue' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100')
              }`}
            >
              {status.includes('submitted') || status === 'late' ? '提出を取り消す' : (status === 'overdue' ? '遅れて提出' : '提出する')}
            </button>
            <button className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-black hover:bg-gray-50 transition-all">
              追加または作成
            </button>
          </div>

          <p className="mt-4 text-[9px] text-gray-400 font-bold text-center leading-relaxed italic">
            アイコンをクリックしてシミュレーション状態を切り替えることができます。
          </p>
          
          <div className={`mt-4 p-3 border rounded-xl flex items-center gap-2 animate-in zoom-in-95 ${
            status === 'pending' ? 'bg-blue-50 border-blue-100' :
            status === 'overdue' ? 'bg-red-50 border-red-100' :
            status === 'submitted' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'
          }`}>
             <StatusIcon size={16} className={
               status === 'pending' ? 'text-blue-600' :
               status === 'overdue' ? 'text-red-600' :
               status === 'submitted' ? 'text-green-600' : 'text-gray-600'
             } />
             <p className={`text-[10px] font-bold ${
               status === 'pending' ? 'text-blue-700' :
               status === 'overdue' ? 'text-red-700' :
               status === 'submitted' ? 'text-green-700' : 'text-gray-700'
             }`}>
               {status === 'pending' ? '課題に取り組んでください' :
                status === 'overdue' ? '期限を過ぎています' :
                status === 'submitted' ? '期限内に提出されました' : '期限を過ぎて提出されました'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
