
import React, { useRef } from 'react';
import { FileText, Layout, FileSpreadsheet, FileBox, FileCode, X, Plus, Paperclip } from 'lucide-react';
import { Attachment } from '../types';

interface FileUploaderProps {
  onAttach: (attachment: Attachment) => void;
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onAttach, attachments, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (fileName: string): Attachment['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return 'file';
    
    if (['doc', 'docx', 'gdoc', 'txt', 'rtf'].includes(ext)) return 'doc';
    if (['ppt', 'pptx', 'gslide', 'key'].includes(ext)) return 'slide';
    if (['xls', 'xlsx', 'gsheet', 'csv'].includes(ext)) return 'sheet';
    if (['pdf'].includes(ext)) return 'pdf';
    return 'file';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // @google/genai coding guidelines: Explicitly cast to File[] to avoid 'unknown' type inference in some TypeScript environments when converting FileList
    (Array.from(files) as File[]).forEach(file => {
      const newAtt: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        url: URL.createObjectURL(file), // Create local preview URL
        type: getFileType(file.name)
      };
      onAttach(newAtt);
    });

    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map(file => (
            <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-bold group animate-in zoom-in-95">
              <span className="text-blue-700 truncate max-w-[200px]">{file.title}</span>
              <button 
                onClick={() => onRemove(file.id)} 
                className="text-blue-300 hover:text-red-500 transition-colors"
                title="削除"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple
        />
        <button 
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full text-xs font-black transition-all group"
        >
          <Paperclip size={16} className="group-hover:rotate-12 transition-transform" />
          資料を添付
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
