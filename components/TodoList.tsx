
import React, { useState } from 'react';
import { Post, SimulationStatus } from '../types';
import { MOCK_SUBJECTS, getIconTextColor } from '../constants';
// Add Sparkles to the imports from lucide-react
import { CheckCircle2, Circle, Clock, ChevronRight, BookOpen, Check, AlertCircle, Users, Sparkles } from 'lucide-react';

interface TodoListProps {
  assignments: Post[];
  onViewPost: (subjectId: string, postId: string) => void;
  onCycleStatus: (postId: string) => void;
  title?: string;
}

const TodoList: React.FC<TodoListProps> = ({ assignments, onViewPost, onCycleStatus, title = "To-do リスト" }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'late'>('all');

  const getSubject = (subjectId?: string) => MOCK_SUBJECTS.find(s => s.id === subjectId);

  const filteredAssignments = assignments.filter(a => {
    const status = a.simulationStatus || 'pending';
    if (filter === 'pending') return status === 'pending' || status === 'overdue';
    if (filter === 'submitted') return status === 'submitted';
    if (filter === 'late') return status === 'late';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">アイコンをクリックして状態を切り替えられます</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'pending', label: '未提出' },
            { id: 'submitted', label: '期限内提出' },
            { id: 'late', label: '期限後提出' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all shrink-0 ${filter === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((task) => {
            const subject = getSubject(task.subjectId);
            const status = task.simulationStatus || 'pending';

            // Determine colors based on status
            let statusStyles = "";
            let badgeStyles = "";
            let statusLabel = "";
            let StatusIcon = Circle;

            switch (status) {
              case 'pending':
                statusStyles = "border-blue-100 hover:border-blue-300";
                badgeStyles = "bg-blue-50 text-blue-600 border-blue-100";
                statusLabel = "受付中";
                StatusIcon = Circle;
                break;
              case 'overdue':
                statusStyles = "border-red-200 bg-red-50/20";
                badgeStyles = "bg-red-100 text-red-700 border-red-200";
                statusLabel = "期限超過";
                StatusIcon = AlertCircle;
                break;
              case 'submitted':
                statusStyles = "border-green-100 bg-green-50/10";
                badgeStyles = "bg-green-100 text-green-700 border-green-200";
                statusLabel = "提出済み";
                StatusIcon = CheckCircle2;
                break;
              case 'late':
                statusStyles = "border-gray-200 bg-gray-50";
                badgeStyles = "bg-gray-100 text-gray-600 border-gray-200";
                statusLabel = "期限後提出";
                StatusIcon = Clock;
                break;
            }

            return (
              <div 
                key={task.id}
                onClick={() => task.subjectId && onViewPost(task.subjectId, task.id)}
                className={`
                  group flex items-center gap-4 p-4 bg-white border rounded-2xl transition-all cursor-pointer shadow-sm
                  ${statusStyles}
                `}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCycleStatus(task.id);
                  }}
                  className={`shrink-0 transition-all hover:scale-125 active:scale-90 ${
                    status === 'pending' ? 'text-blue-400' :
                    status === 'overdue' ? 'text-red-600' :
                    status === 'submitted' ? 'text-green-500' : 'text-gray-500'
                  }`}
                >
                  <StatusIcon size={24} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ backgroundColor: subject?.color || '#eee', color: getIconTextColor(subject?.color || '#eee') }}
                    >
                      {subject?.icon || '?'}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase truncate">
                      {subject?.name || 'その他'}
                    </span>
                    {task.isGroupAssignment && (
                      <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
                        <Users size={10} /> 班
                      </span>
                    )}
                  </div>
                  <h3 className={`text-sm font-bold truncate ${
                    status === 'pending' ? 'text-gray-900' : 
                    status === 'overdue' ? 'text-red-900' : 'text-gray-500'
                  }`}>
                    {task.title || task.content.substring(0, 40) + '...'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {task.deadline && (
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${status === 'pending' ? 'text-blue-500' : status === 'overdue' ? 'text-red-600' : 'text-gray-400'}`}>
                        <Clock size={12} />
                        期限: {task.deadline}
                      </div>
                    )}
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border transition-colors ${badgeStyles}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-gray-200" />
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
              条件に合う課題はありません
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#1a73e8] rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
        <div className="relative z-10">
          <h4 className="text-lg font-black mb-1">シミュレーションガイド</h4>
          <p className="text-xs text-blue-100 mb-4 font-bold">アイコンをクリックすると表示が切り替わります</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="flex items-center gap-2">
                <Circle size={14} className="text-blue-200" />
                <span className="text-[10px] font-bold">青: 未提出 (期限内)</span>
             </div>
             <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-red-200" />
                <span className="text-[10px] font-bold">赤: 未提出 (期限過)</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-200" />
                <span className="text-[10px] font-bold">緑: 提出済み (期限内)</span>
             </div>
             <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-200" />
                <span className="text-[10px] font-bold">灰: 提出済み (期限後)</span>
             </div>
          </div>
        </div>
        <Sparkles size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:rotate-12 transition-transform" />
      </div>
    </div>
  );
};

export default TodoList;
