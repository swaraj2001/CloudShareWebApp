import React, { useRef, useState } from "react";

import {
  UploadCloud,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  X,
  CheckCircle,
} from "lucide-react";

const FileUploadBox = ({
  files = [],
  setFiles,
  remainingCredits = 0,
  maxFiles = 5,
  isUploadDisabled = false,
  uploading = false,
  onUpload,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE_MB = 100;

  // --------------------------------------------------
  // File Icon
  // --------------------------------------------------

  const getFileIcon = (file) => {
    if (!file) {
      return <File className="text-gray-500" size={28} />;
    }

    const type = file.type || "";

    if (type.startsWith("image/")) {
      return <Image className="text-blue-500" size={28} />;
    }

    if (type.startsWith("video/")) {
      return <Video className="text-purple-500" size={28} />;
    }

    if (type.startsWith("audio/")) {
      return <Music className="text-green-500" size={28} />;
    }

    if (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text") ||
      type.includes("spreadsheet") ||
      type.includes("presentation")
    ) {
      return <FileText className="text-red-500" size={28} />;
    }

    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("7z")
    ) {
      return <Archive className="text-yellow-500" size={28} />;
    }

    return <File className="text-gray-500" size={28} />;
  };

  // --------------------------------------------------
  // Format File Size
  // --------------------------------------------------

  const formatFileSize = (bytes = 0) => {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(2)} ${units[index]}`;
  };

  // --------------------------------------------------
  // Validate Files
  // --------------------------------------------------

  const validateFiles = (selectedFiles) => {
    const validFiles = [];

    const maxSize =
      MAX_FILE_SIZE_MB * 1024 * 1024;

    selectedFiles.forEach((file) => {
      if (!file) {
        return;
      }

      if (file.size > maxSize) {
        alert(
          `${file.name} exceeds the ${MAX_FILE_SIZE_MB} MB limit.`
        );
        return;
      }

      validFiles.push(file);
    });

    return validFiles;
  };

  // --------------------------------------------------
  // Handle Selected Files
  // --------------------------------------------------

  const handleFiles = (fileList) => {
    if (!fileList || uploading) {
      return;
    }

    let selectedFiles = Array.from(fileList);

    selectedFiles = validateFiles(selectedFiles);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots =
      maxFiles - files.length;

    if (remainingSlots <= 0) {
      alert(
        `You can upload a maximum of ${maxFiles} files.`
      );
      return;
    }

    selectedFiles = selectedFiles.slice(
      0,
      remainingSlots
    );

    const newFiles = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file: file,
      progress: 0,
      status: "ready",
    }));

    const updatedFiles = [
      ...files,
      ...newFiles,
    ];

    // Keep wrapper objects in parent state
    setFiles(updatedFiles);
  };

  // --------------------------------------------------
  // File Input
  // --------------------------------------------------

  const handleInputChange = (event) => {
    handleFiles(event.target.files);

    // Allows selecting the same file again
    event.target.value = "";
  };

  // --------------------------------------------------
  // Drag & Drop
  // --------------------------------------------------

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (uploading) {
      return;
    }

    if (event.dataTransfer.files?.length) {
      handleFiles(event.dataTransfer.files);
    }
  };

  // --------------------------------------------------
  // Remove File
  // --------------------------------------------------

  const removeFile = (id) => {
    if (uploading) {
      return;
    }

    const updatedFiles = files.filter(
      (item) => item?.id !== id
    );

    setFiles(updatedFiles);
  };

  // --------------------------------------------------
  // Open File Picker
  // --------------------------------------------------

  const openFilePicker = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-3xl">

      {/* Credits */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Upload Files
        </h2>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
          Credits: {remainingCredits}
        </div>
      </div>

      {/* Upload Box */}

      <div
        onClick={openFilePicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          cursor-pointer
          rounded-2xl
          border-2
          border-dashed
          p-10
          text-center
          transition-all
          duration-200

          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
          }

          ${
            uploading
              ? "cursor-not-allowed opacity-70"
              : ""
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UploadCloud
              size={32}
              className="text-blue-600"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            Drag & Drop your files here
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            or{" "}
            <span className="font-semibold text-blue-600">
              browse files
            </span>
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Images, Videos, Audio, PDF,
            Documents, ZIP and more
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Maximum {MAX_FILE_SIZE_MB} MB per file
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {files.length} / {maxFiles} files selected
          </p>
        </div>
      </div>

      {/* Selected Files */}

      {files.length > 0 && (
        <div className="mt-6 space-y-3">

          {files.map((item) => {
            if (!item?.file) {
              return null;
            }

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
              >

                {/* File Icon */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  {getFileIcon(item.file)}
                </div>

                {/* File Details */}

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.file.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>

                  {/* Ready */}

                  {item.status === "ready" && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle size={13} />
                      Ready to upload
                    </div>
                  )}

                  {/* Uploading */}

                  {item.status === "uploading" && (
                    <div className="mt-2">

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${item.progress || 0}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.progress || 0}%
                      </p>

                    </div>
                  )}

                  {/* Uploaded */}

                  {item.status === "uploaded" && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle size={13} />
                      Uploaded successfully
                    </div>
                  )}

                  {/* Error */}

                  {item.status === "error" && (
                    <p className="mt-1 text-xs text-red-500">
                      Upload failed
                    </p>
                  )}

                </div>

                {/* Remove */}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile(item.id);
                  }}
                  disabled={uploading}
                  className="
                    rounded-full
                    p-2
                    text-gray-400
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <X size={20} />
                </button>

              </div>
            );
          })}

        </div>
      )}

      {/* Upload Button */}

      {
        files.length > 0 && <button
        type="button"
        onClick={onUpload}
        disabled={isUploadDisabled || uploading}
        className="
          mt-6
          w-full
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:bg-gray-300
        "
      >
        {uploading
          ? "Uploading..."
          : `Upload ${files.length} ${
              files.length === 1
                ? "File"
                : "Files"
            }`}
      </button>
      }

    </div>
  );
};

export default FileUploadBox;