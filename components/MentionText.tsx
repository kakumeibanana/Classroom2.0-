
import React from 'react';

interface MentionTextProps {
  text: string;
}

const MentionText: React.FC<MentionTextProps> = ({ text }) => {
  // Regex to find @Name patterns
  const parts = text.split(/(@[^\s@]+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span 
              key={i} 
              className="text-blue-600 font-bold hover:underline cursor-pointer px-0.5 rounded bg-blue-50"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default MentionText;
