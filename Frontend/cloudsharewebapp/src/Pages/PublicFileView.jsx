import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Download,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  HardDrive,
  FileType,
  ShieldCheck,
} from "lucide-react";
import apiEndpoints from "../Utils/apiEndpoints";

const PublicFileView = () => {
  const { fileId } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(apiEndpoints.PUBLIC_FILE_VIEW(fileId));

        setFile(response.data);
      } catch (err) {
        console.error("Error fetching public file:", err);

        setError(
          err.response?.data?.message ||
            "This file is unavailable or the sharing link has expired.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getFileName = () => {
    return file?.fileName || file?.name || "Unnamed File";
  };

  const getContentType = () => {
    return file.type || "Unknown";
  };

  const getFileUrl = () => {
    return file.fileUrl|| null;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 2,
    )} ${units[index]}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not available";
    }
  };

  const getFileExtension = () => {
    const name = getFileName();

    if (!name.includes(".")) {
      return "File";
    }

    return name.split(".").pop().toUpperCase();
  };

  const getFileIcon = () => {
    const type = getContentType().toLowerCase();

    if (type.startsWith("image/")) {
      return <Image size={24} />;
    }

    if (type.startsWith("video/")) {
      return <Video size={24} />;
    }

    if (type.startsWith("audio/")) {
      return <Music size={24} />;
    }

    if (type.includes("pdf")) {
      return <FileText size={24} />;
    }

    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("7z") ||
      type.includes("archive")
    ) {
      return <Archive size={24} />;
    }

    return <File size={24} />;
  };

  const isPreviewable = () => {
    const type = getContentType().toLowerCase();

    return (
      type.startsWith("image/") ||
      type.startsWith("video/") ||
      type.startsWith("audio/") ||
      type === "application/pdf"
    );
  };

  // --------------------------------------------------
  // Download
  // --------------------------------------------------

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await axios.get(apiEndpoints.PUBLIC_FILE_VIEW(fileId), {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: getContentType(),
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getFileName();

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-600" />

          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            File Unavailable
          </h1>

          <p className="text-gray-500 mt-2">
            {error || "This file could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const fileUrl = getFileUrl();
  const contentType = getContentType();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <File size={20} />
            </div>

            <span className="text-xl font-bold text-gray-900">CloudShare</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* File Information Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                {getFileIcon()}
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {getFileName()}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  {getFileExtension()} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {isPreviewable() && fileUrl && (
                <a
                  href="#preview"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <Eye size={18} />
                  Preview
                </a>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {downloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div
            id="preview"
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[450px]"
          >
            {isPreviewable() && fileUrl ? (
              <div className="w-full h-full min-h-[450px] flex items-center justify-center bg-gray-50 p-4">
                {contentType.startsWith("image/") && (
                  <img
                    src={fileUrl}
                    alt={getFileName()}
                    className="max-w-full max-h-[650px] object-contain rounded-lg"
                  />
                )}

                {contentType.startsWith("video/") && (
                  <video
                    src={fileUrl}
                    controls
                    className="max-w-full max-h-[650px] rounded-lg"
                  />
                )}

                {contentType.startsWith("audio/") && (
                  <div className="w-full max-w-lg">
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Music size={42} />
                      </div>
                    </div>

                    <p className="text-center font-medium text-gray-800 mb-5">
                      {getFileName()}
                    </p>

                    <audio src={fileUrl} controls className="w-full" />
                  </div>
                )}

                {contentType === "application/pdf" && (
                  <iframe
                    src={fileUrl}
                    title={getFileName()}
                    className="w-full h-[650px] rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="h-[450px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mb-5">
                  {getFileIcon()}
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Preview not available
                </h2>

                <p className="text-gray-500 text-sm mt-2 max-w-sm">
                  This file type cannot be previewed in the browser. Download
                  the file to view it.
                </p>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  <Download size={18} />
                  Download File
                </button>
              </div>
            )}
          </div>

          {/* File Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              File Information
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div className="flex gap-3">
                <div className="text-gray-400 mt-0.5">
                  <File size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">File Name</p>

                  <p className="text-sm font-medium text-gray-900 break-all mt-1">
                    {getFileName()}
                  </p>
                </div>
              </div>

              {/* Type */}
              <div className="flex gap-3">
                <div className="text-gray-400 mt-0.5">
                  <FileType size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">File Type</p>

                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {file.type}
                  </p>
                </div>
              </div>

              {/* Size */}
              <div className="flex gap-3">
                <div className="text-gray-400 mt-0.5">
                  <HardDrive size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">File Size</p>

                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Shared Date */}
              <div className="flex gap-3">
                <div className="text-gray-400 mt-0.5">
                  <Calendar size={18} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Shared Date</p>

                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(
                      file.uploadedAt,
                    )}
                  </p>
                </div>
              </div>

              {/* Updated Date */}
              {(file.updatedAt || file.modifiedAt) && (
                <div className="flex gap-3">
                  <div className="text-gray-400 mt-0.5">
                    <Calendar size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Last Modified</p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(file.updatedAt || file.modifiedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Public Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck size={18} />

                  <span className="text-sm font-medium">Publicly Shared</span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Anyone with this link can access this file.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-gray-500">
          Shared securely using{" "}
          <span className="font-semibold text-gray-700">CloudShare</span>
        </div>
      </main>
    </div>
  );
};

export default PublicFileView;
