
import React, { useState } from 'react';
import {
    Image,
    Music,
    Video,
    FileText,
    Globe,
    Lock,
    Copy,
    ExternalLink,
    Eye,
    Download,
    Trash2
} from 'lucide-react';

const FileCard = ({ file , onDownload , onDelete, onTogglePublic, onShareLink }) => {
    const [showActions, setShowActions] = useState(false);

    const getFileIcon = (file) => {
        const extension = file.name?.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
            return <Image size={28} className="text-purple-500" />;
        }

        if (['mp4', 'mov', 'avi', 'wmv', 'mkv'].includes(extension)) {
            return <Video size={28} className="text-blue-500" />;
        }

        if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension)) {
            return <Music size={28} className="text-green-500" />;
        }

        if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
            return <FileText size={28} className="text-red-500" />;
        }

        return <FileText size={28} className="text-purple-500" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';

        if (bytes < 1024) {
            return `${bytes} B`;
        } else if (bytes < 1048576) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);

        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const copyPublicLink = async () => {
        const publicUrl = `${window.location.origin}/file/${file.id}`;

        try {
            await navigator.clipboard.writeText(publicUrl);
            alert('Link copied!');
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    return (
        <div
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className="relative group bg-white shadow-md rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border border-gray-200"
        >
            {/* File Preview */}
            <div className="h-32 w-full bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
                {getFileIcon(file)}
            </div>

            {/* Private/Public Badge */}
            <div className="absolute top-2 right-2">
                <div
                    className={`rounded-full p-1.5 ${
                        file.isPublic ? 'bg-green-200' : 'bg-gray-200'
                    }`}
                    title={file.isPublic ? 'Public' : 'Private'}
                >
                    {file.isPublic ? (
                        <Globe size={14} className="text-green-500" />
                    ) : (
                        <Lock size={14} className="text-gray-500" />
                    )}
                </div>
            </div>

            {/* File Info */}
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="overflow-hidden w-full">
                        <h3 className="text-sm font-medium text-gray-800 truncate">
                            {file.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(file.size)} · {formatDate(file.uploadedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end justify-center p-4 transition-opacity duration-300 ${
                    showActions ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="flex gap-3 w-full justify-center">
                    {/* Copy Public Link */}
                    {file.isPublic && (
                        <button

                            onClick={()=> onShareLink(file.id)}
                            title="Copy public link"
                            className="bg-white/90 rounded-full px-3 py-2 text-sm hover:bg-white cursor-pointer transition-colors text-purple-500 hover:text-purple-600 duration-200"
                        >
                            <Copy size={16} />
                        </button>
                    )}

                    {/* Open File */}
                    {file.isPublic && (
                        <a
                            href={`/file/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open file"
                            className="bg-white/90 rounded-full px-3 py-2 text-sm hover:bg-white cursor-pointer transition-colors text-gray-700 hover:text-gray-900 duration-200"
                        >
                            <Eye size={16} />
                        </a>
                    )}

                    <button onClick={()=> onDownload(file)}
                    title="Download" className="bg-white/90 rounded-full px-3 py-2 text-sm cursor-pointer hover:bg-white transition-colors text-green-700 hover:text-green-900 duration-200">
                        <Download size={16} />
                    </button>

                    <button onClick={()=> onTogglePublic(file)}
                     title={file.isPublic ? "Make Private" : "Make Public"} className="bg-white/90 cursor-pointer rounded-full px-3 py-2 text-sm hover:bg-white transition-colors text-amber-400 hover:text-amber-600 duration-200">
                       {file.isPublic ? <Lock size={16} /> : <Globe size={16} />}
                    </button>

                     <button title="Delete" 
                     onClick={()=> onDelete(file.id)}
                     className="bg-white/90 rounded-full px-3 py-2 text-sm cursor-pointer hover:bg-white transition-colors text-red-700 hover:text-red-900 duration-200">
                        <Trash2 size={16} />
                    </button>

                </div>
            </div>
        </div>
    );
};

export default FileCard;

