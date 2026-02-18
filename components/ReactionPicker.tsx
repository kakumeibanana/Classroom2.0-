import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_SETS = {
  emotions: ['😀', '😂', '😍', '🥳', '😢', '😡', '🤯', '👍', '❤️', '🔥', '✨', '💯'],
  hand: ['👍', '👎', '👏', '🙌', '🤝', '✋', '✌️', '🤟', '👊', '👏', '🤲', '🙏'],
  objects: ['❤️', '🎉', '🎊', '🎈', '🎁', '⭐', '✨', '💫', '⚡', '💥', '🌟', '💌'],
  symbols: ['✓', '✔️', '❌', '⭕', '❓', '❗', '💯', '🆗', '🆕', '🔔', '🔞', '📌'],
  stamps: ['👏', '😀', '😂', '😍', '🋆', '✨', '🎉', '🎊', '💯', '⭐', '🔥', '🌈'],
};

type EmojiCategory = keyof typeof EMOJI_SETS;

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onReactionSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>('emotions');

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <div className="flex gap-1">
          {Object.keys(EMOJI_SETS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as EmojiCategory)}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat === 'emotions' && '😀'}
              {cat === 'hand' && '👍'}
              {cat === 'objects' && '❤️'}
              {cat === 'symbols' && '✓'}
              {cat === 'stamps' && '⭐'}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1">
        {EMOJI_SETS[activeCategory].map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReactionSelect(emoji);
              onClose();
            }}
            className="p-2 text-lg hover:bg-gray-100 rounded-lg transition-colors active:scale-90"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker;
