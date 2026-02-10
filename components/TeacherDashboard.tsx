
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Search, AlertTriangle, Filter, Download, Activity, MessageCircle, AlertCircle } from 'lucide-react';

const data = [
  { name: '月', messages: 120, alerts: 2 },
  { name: '火', messages: 150, alerts: 0 },
  { name: '水', messages: 200, alerts: 5 },
  { name: '木', messages: 180, alerts: 1 },
  { name: '金', messages: 250, alerts: 3 },
];

const TeacherDashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h2>
          <p className="text-gray-500">クラスの活動状況と安全性をモニタリングしています</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Download size={18} />
          レポートを書き出す
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">総メッセージ数</span>
            <div className="p-2 bg-blue-50 text-[#1a73e8] rounded-lg">
              <MessageCircle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold">1,452</div>
          <div className="text-xs text-green-500 font-medium mt-1">先週比 +12%</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">アクティブ生徒</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold">38 / 40</div>
          <div className="text-xs text-green-500 font-medium mt-1">順調です</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">要注意アラート</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold">11</div>
          <div className="text-xs text-red-500 font-medium mt-1">至急確認が必要</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-blue-500" />
            週間アクティビティ推移
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="messages" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              最近の安全アラート
            </h3>
            <button className="text-xs text-[#1a73e8] font-medium hover:underline">すべて見る</button>
          </div>
          <div className="flex-1 space-y-4">
            {[
              { time: '10分前', user: '田中', group: 'G101', type: '不適切ワード検出' },
              { time: '1時間前', user: '佐藤', group: 'G105', type: '深夜の利用検出' },
              { time: '昨日', user: '伊藤', group: 'DM', type: 'スパムの疑い' },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{alert.user} 生徒</span>
                    <span className="text-[10px] text-gray-400">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">場所: {alert.group} | 内容: <span className="text-red-600 font-medium">{alert.type}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
