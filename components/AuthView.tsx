import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen, LogIn, UserPlus as UserPlusIcon } from 'lucide-react';
import { login, signup } from '../src/api/client';

interface AuthViewProps {
  onAuthSuccess: (userId: string, sessionToken: string, user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signup(formData.name, formData.email, formData.password, formData.role);
        if (!result) {
          setError('サインアップに失敗しました');
          return;
        }
        onAuthSuccess(result.userId, result.sessionToken, result.user);
      } else {
        const result = await login(formData.email, formData.password);
        if (!result) {
          setError('ログインに失敗しました');
          return;
        }
        onAuthSuccess(result.userId, result.sessionToken, result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Classroom 2.0</h1>
          </div>
          <p className="text-gray-600">オンライン教室プラットフォーム</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  名前
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="山田太郎"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@school.jp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                パスワード
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アカウントタイプ
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">生徒</option>
                  <option value="teacher">先生</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>処理中...</span>
              ) : isSignUp ? (
                <>
                  <UserPlusIcon size={18} />
                  アカウント作成
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  ログイン
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'すでにアカウントを持っていますか？' : 'アカウントを持っていませんか？'}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="ml-2 text-blue-600 font-semibold hover:underline"
              >
                {isSignUp ? 'ログイン' : 'アカウント作成'}
              </button>
            </p>
          </div>

          {/* Demo users info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">デモアカウント:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• 先生: teacher@school.jp / password</p>
              <p>• 生徒: student@school.jp / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
