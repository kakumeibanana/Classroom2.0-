
import React, { useState, useRef, useEffect } from 'react';
import { USERS } from '../constants';
import { User } from '../types';

interface MentionInputProps {
  placeholder: string;
  onSend: (content: string) => void;
  className?: string;
}

const MentionInput: React.FC<MentionInputProps> = ({ placeholder, onSend, className }) => {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    const pos = e.target.selectionStart || 0;
    setCursorPos(pos);

    const lastAtPos = val.lastIndexOf('@', pos - 1);
    if (lastAtPos !== -1) {
      const query = val.slice(lastAtPos + 1, pos);
      if (!query.includes(' ')) {
        const filtered = USERS.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const handleSelectUser = (user: User) => {
    const lastAtPos = value.lastIndexOf('@', cursorPos - 1);
    const newValue = value.slice(0, lastAtPos) + `@${user.name} ` + value.slice(cursorPos);
    setValue(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onSend(value);
            setValue('');
          }
        }}
        placeholder={placeholder}
        className="w-full bg-gray-50 hover:bg-gray-100 border-none rounded-full px-5 py-2.5 text-sm text-gray-600 focus:bg-white transition-all outline-none"
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-bottom-2">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">クラスメイトを選択</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors text-left group"
              >
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600">{user.name}</p>
                  <p className="text-[10px] text-gray-400">{user.role === 'teacher' ? '教職員' : '生徒'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentionInput;
