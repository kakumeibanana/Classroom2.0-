import React from 'react';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900">設定</h2>
        <p className="text-xs font-bold text-gray-400 mt-1">{currentUser.name} のアカウント設定（ダミー）</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-black text-gray-800">通知</h3>
          <p className="text-xs text-gray-400">通知の受け取り設定はここで切り替えられます（ダミー）</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-black text-gray-800">表示</h3>
          <p className="text-xs text-gray-400">テーマやフォントサイズを変更できます（ダミー）</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
