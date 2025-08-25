// components/inquiry/AttachmentList.jsx
import React from 'react';
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive } from 'react-icons/fa';
import { API_BASE_URL } from '../../constants/constants'; // adjust path if needed

const AttachmentList = ({ attachments = [] }) => {
  if (!attachments || attachments.length === 0) return null;

  const base = (API_BASE_URL || '').replace(/\/$/, '');

  const resolveAttachment = (att) => {
    if (!att) return { url: '', label: '' };

    if (typeof att === 'string') {
      const label = att.split('/').pop();
      if (att.startsWith('http://') || att.startsWith('https://')) {
        return { url: att, label };
      }
      if (att.startsWith('/')) {
        return { url: att, label };
      }
      return { url: `${base}/storage/${att}`, label };
    }

    if (typeof att === 'object') {
      const url = att.url || att.path || att.file || '';
      const label = att.name || att.filename || (url ? url.split('/').pop() : '');
      const finalUrl = url && !(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
        ? `${base}/${url.replace(/^\//, '')}`
        : url;
      return { url: finalUrl || '', label: label || '' };
    }

    return { url: '', label: '' };
  };

  // اختيار أيقونة حسب الامتداد
  const getIconByExtension = (ext) => {
    switch (ext) {
      case 'pdf': return <FaFilePdf className="text-red-500 text-lg" />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-blue-600 text-lg" />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="text-green-600 text-lg" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return <FaFileImage className="text-purple-500 text-lg" />;
      case 'mp4':
      case 'mov':
      case 'avi': return <FaFileVideo className="text-indigo-500 text-lg" />;
      case 'mp3':
      case 'wav':
      case 'ogg': return <FaFileAudio className="text-pink-500 text-lg" />;
      case 'zip':
      case 'rar':
      case '7z': return <FaFileArchive className="text-yellow-600 text-lg" />;
      default: return <FaFileAlt className="text-gray-500 text-lg" />;
    }
  };

  const openInNewTab = (url) => {
    if (!url) return;
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div className="bg-[var(--color-bg)] rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-1">
      {attachments.map((att, idx) => {
        const { url, label } = resolveAttachment(att);
        const displayLabel = label || (typeof att === 'string' ? att : `attachment-${idx + 1}`);
        const extension = displayLabel.includes('.') ? displayLabel.split('.').pop().toLowerCase() : '';
        const icon = getIconByExtension(extension);

        console.log('🔗 attachment resolved:', { idx, url, label: displayLabel, extension });

        return (
          <div
            key={idx}
            role={url ? 'button' : 'article'}
            tabIndex={0}
            onClick={() => openInNewTab(url)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openInNewTab(url);
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-white)] shadow-sm cursor-pointer hover:bg-[var(--color-light-gray)] border border-gray-200 transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            title={displayLabel}
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-md bg-[var(--color-bg)] text-[var(--color-secondary)] flex-shrink-0">
              {icon}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm text-[var(--color-text-main)] truncate">{displayLabel}</span>
              {extension && (
                <span className="text-xs text-gray-400">.{extension}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentList;
