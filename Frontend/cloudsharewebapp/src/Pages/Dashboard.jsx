
import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";

import {
  Image,
  Music,
  Video,
  FileText,
  Globe,
  Lock,
  Copy,
  Eye,
  Download,
  Trash2,
  List,
  Grid,
  File,
  UploadCloud,
  Loader2,
  AlertCircle,
  HardDrive,
} from "lucide-react";

import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-hot-toast";

import apiEndpoints from "../Utils/apiEndpoints";
import FileCard from "../Components/FileCard";
import FileUploadBox from "../Components/FileUploadBox";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import ShareModal from "../Components/ShareModel";

import UserCreditContext from "../Context/UserCreditContext";

const Dashboard = () => {
  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const { getToken } = useAuth();

  // --------------------------------------------------
  // User Credits
  // --------------------------------------------------

  const { credits, setCredits } = useContext(UserCreditContext);

  // --------------------------------------------------
  // Files
  // --------------------------------------------------

  const [files, setFiles] = useState([]);

  const [viewMode, setViewMode] = useState("list");

  const [loadingFiles, setLoadingFiles] = useState(true);

  // --------------------------------------------------
  // Upload State
  // --------------------------------------------------

  const [uploadFiles, setUploadFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [uploadMessage, setUploadMessage] = useState("");

  const [uploadMessageType, setUploadMessageType] = useState("");

  const MAX_FILES = 5;

  // --------------------------------------------------
  // Delete Confirmation
  // --------------------------------------------------

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    fileId: null,
  });

  // --------------------------------------------------
  // Share Modal
  // --------------------------------------------------

  const [shareModel, setShareModel] = useState({
    isOpen: false,
    fileId: null,
    link: "",
  });

  // ==================================================
  // FETCH FILES
  // ==================================================

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);

      const token = await getToken();

      const response = await axios.get(apiEndpoints.FETCH_FILES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);

      toast.error(
        error.response?.data?.message ||
          "Error fetching files"
      );
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ==================================================
  // FILE ICON
  // ==================================================

  const getFileIcon = (file) => {
    const extension = file?.name
      ?.split(".")
      .pop()
      ?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(
        extension
      )
    ) {
      return (
        <Image
          size={28}
          className="text-purple-500"
        />
      );
    }

    if (
      ["mp4", "mov", "avi", "wmv", "mkv"].includes(
        extension
      )
    ) {
      return (
        <Video
          size={28}
          className="text-blue-500"
        />
      );
    }

    if (
      ["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(
        extension
      )
    ) {
      return (
        <Music
          size={28}
          className="text-green-500"
        />
      );
    }

    if (
      ["pdf", "doc", "docx", "txt", "rtf"].includes(
        extension
      )
    ) {
      return (
        <FileText
          size={28}
          className="text-red-500"
        />
      );
    }

    return (
      <FileText
        size={28}
        className="text-purple-500"
      />
    );
  };

  // ==================================================
  // TOGGLE PUBLIC / PRIVATE
  // ==================================================

  const toggleFileStatus = async (fileToUpdate) => {
    try {
      const token = await getToken();

      await axios.patch(
        apiEndpoints.TOGGLE_FILE_STATUS(
          fileToUpdate.id
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileToUpdate.id
            ? {
                ...file,
                isPublic: !file.isPublic,
              }
            : file
        )
      );

      toast.success(
        fileToUpdate.isPublic
          ? "File is now private"
          : "File is now public"
      );
    } catch (error) {
      console.error(
        "Error toggling file status:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Error updating file sharing status"
      );
    }
  };

  // ==================================================
  // DOWNLOAD FILE
  // ==================================================

  const handleDownload = async (file) => {
    try {
      const token = await getToken();

      const response = await axios.get(
        apiEndpoints.DOWNLOAD_FILE(file.id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", file.name);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Error downloading file:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Error downloading file"
      );
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const openDeleteConfirmation = (fileId) => {
    setDeleteConfirmation({
      isOpen: true,
      fileId,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      fileId: null,
    });
  };

  const handleDeleteFile = async () => {
    const fileId = deleteConfirmation.fileId;

    if (!fileId) {
      return;
    }

    try {
      const token = await getToken();

      const response = await axios.delete(
        apiEndpoints.DELETE_FILE(fileId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setFiles((prevFiles) =>
          prevFiles.filter(
            (file) => file.id !== fileId
          )
        );

        closeDeleteConfirmation();

        toast.success(
          "File deleted successfully"
        );
      }
    } catch (error) {
      console.error(
        "Error deleting file:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Error deleting file"
      );
    }
  };

  // ==================================================
  // SHARE MODAL
  // ==================================================

  const openShareModal = (fileId) => {
    const link = `${window.location.origin}/files/${fileId}`;

    setShareModel({
      isOpen: true,
      fileId,
      link,
    });
  };

  const closeShareModal = () => {
    setShareModel({
      isOpen: false,
      fileId: null,
      link: "",
    });
  };

  // ==================================================
  // UPLOAD
  // ==================================================

  const isUploadDisabled =
    uploadFiles.length === 0 ||
    uploadFiles.length > MAX_FILES ||
    credits <= 0 ||
    uploadFiles.length > credits;

  const handleUpload = async () => {
    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (uploadFiles.length === 0) {
      setUploadMessage(
        "Please select at least one file."
      );

      setUploadMessageType("error");

      return;
    }

    if (uploadFiles.length > MAX_FILES) {
      setUploadMessage(
        `You can upload a maximum of ${MAX_FILES} files.`
      );

      setUploadMessageType("error");

      return;
    }

    if (credits <= 0) {
      setUploadMessage(
        "You don't have enough credits."
      );

      setUploadMessageType("error");

      return;
    }

    if (uploadFiles.length > credits) {
      setUploadMessage(
        `You only have ${credits} credits available.`
      );

      setUploadMessageType("error");

      return;
    }

    try {
      setUploading(true);

      setUploadMessage("");

      setUploadMessageType("");

      // -----------------------------------------------
      // FormData
      // -----------------------------------------------

      const formData = new FormData();

      uploadFiles.forEach((item) => {
        if (item?.file) {
          formData.append("files", item.file);
        }
      });

      // -----------------------------------------------
      // Token
      // -----------------------------------------------

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not available."
        );
      }

      // -----------------------------------------------
      // Uploading status
      // -----------------------------------------------

      setUploadFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "uploading",
          progress: 0,
        }))
      );

      // -----------------------------------------------
      // API
      // -----------------------------------------------

      const response = await axios.post(
        apiEndpoints.UPLOAD_FILES,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              return;
            }

            const progress = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setUploadFiles((prevFiles) =>
              prevFiles.map((item) => ({
                ...item,
                progress,
              }))
            );
          },
        }
      );

      console.log(
        "Upload response:",
        response.data
      );

      // -----------------------------------------------
      // Update Credits
      // -----------------------------------------------

      if (
        response.data &&
        response.data.remainingCredits !==
          undefined
      ) {
        setCredits(
          response.data.remainingCredits
        );
      } else {
        setCredits(
          (prev) => prev - uploadFiles.length
        );
      }

      // -----------------------------------------------
      // Uploaded
      // -----------------------------------------------

      setUploadFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "uploaded",
          progress: 100,
        }))
      );

      setUploadMessage(
        "Files uploaded successfully."
      );

      setUploadMessageType("success");

      // -----------------------------------------------
      // Refresh My Files
      // -----------------------------------------------

      await fetchFiles();

      // -----------------------------------------------
      // Clear upload selection
      // -----------------------------------------------

      setTimeout(() => {
        setUploadFiles([]);
        setUploadMessage("");
        setUploadMessageType("");
      }, 1000);
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setUploadFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "error",
        }))
      );

      setUploadMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while uploading the files."
      );

      setUploadMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  // ==================================================
  // FORMAT FILE SIZE
  // ==================================================

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 1)} ${
      units[index]
    }`;
  };

  // ==================================================
  // DASHBOARD UI
  // ==================================================

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-4 md:p-6 space-y-8">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your files and upload new documents.
          </p>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Total Files */}

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Files
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {files.length}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <File size={24} />
              </div>

            </div>
          </div>

          {/* Public Files */}

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Public Files
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    files.filter(
                      (file) => file.isPublic
                    ).length
                  }
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Globe size={24} />
              </div>

            </div>
          </div>

          {/* Credits */}

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Available Credits
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {credits}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <HardDrive size={24} />
              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            UPLOAD SECTION
        ================================================= */}

        <div className="lg:flex items-center gap-5 ">
            <section className="bg-white rounded-2xl border shadow-sm p-5 md:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>
              <div className="flex items-center gap-2">
                <UploadCloud
                  size={22}
                  className="text-purple-600"
                />

                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Files
                </h2>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Upload up to {MAX_FILES} files at once.
              </p>
            </div>

            <div className="text-sm font-medium text-gray-600">
              {credits} credits available
            </div>

          </div>

          {/* Upload Message */}

          {uploadMessage && (
            <div
              className={`mb-5 flex items-center gap-3 rounded-lg p-4 ${
                uploadMessageType === "error"
                  ? "bg-red-50 text-red-700"
                  : uploadMessageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {uploadMessageType === "error" && (
                <AlertCircle size={20} />
              )}

              <span>
                {uploadMessage}
              </span>
            </div>
          )}

          <FileUploadBox
            files={uploadFiles}
            setFiles={setUploadFiles}
            remainingCredits={credits}
            maxFiles={MAX_FILES}
            isUploadDisabled={
              isUploadDisabled
            }
            uploading={uploading}
            onUpload={handleUpload}
          />

        </section>

        {/* =================================================
            MY FILES
        ================================================= */}

        <section>

          {/* Header */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Files
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({files.length})
                </span>
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage, share and download your files.
              </p>
            </div>

            {/* View Mode */}

            <div className="flex items-center gap-2 bg-white border rounded-lg p-1">

              <button
                onClick={() =>
                  setViewMode("list")
                }
                className={`p-2 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                title="List View"
              >
                <List size={20} />
              </button>

              <button
                onClick={() =>
                  setViewMode("grid")
                }
                className={`p-2 rounded-md transition ${
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>

            </div>

          </div>

          {/* Loading */}

          {loadingFiles ? (
            <div className="bg-white rounded-xl border shadow-sm p-12 flex flex-col items-center justify-center">

              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-gray-500 mt-3">
                Loading your files...
              </p>

            </div>
          ) : files.length === 0 ? (

            /* Empty State */

            <div className="bg-white rounded-xl border shadow-sm p-12 flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                <File
                  size={32}
                  className="text-purple-500"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No Files Uploaded Yet
              </h3>

              <p className="text-gray-500 max-w-md mt-2">
                You haven't uploaded any files yet.
                Upload your first file using the
                upload section above.
              </p>

            </div>

          ) : viewMode === "list" ? (

            /* =================================================
               LIST VIEW
            ================================================= */

            <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sharing
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="bg-white divide-y divide-gray-200">

                  {files.map((file) => (

                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 transition-colors"
                    >

                      {/* Name */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          {getFileIcon(file)}

                          <span className="text-sm font-medium text-gray-900 max-w-[250px] truncate">
                            {file.name}
                          </span>

                        </div>

                      </td>

                      {/* Size */}

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </td>

                      {/* Date */}

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.uploadedAt
                          ? new Date(
                              file.uploadedAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>

                      {/* Sharing */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-4">

                          <button
                            onClick={() =>
                              toggleFileStatus(
                                file
                              )
                            }
                            className="flex items-center gap-2 cursor-pointer group"
                          >

                            {file.isPublic ? (
                              <>
                                <Globe
                                  size={16}
                                  className="text-green-500 group-hover:text-green-700"
                                />

                                <span className="text-sm group-hover:underline">
                                  Public
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock
                                  size={16}
                                  className="text-gray-500 group-hover:text-gray-700"
                                />

                                <span className="text-sm group-hover:underline">
                                  Private
                                </span>
                              </>
                            )}

                          </button>

                          {file.isPublic && (
                            <button
                              onClick={() =>
                                openShareModal(
                                  file.id
                                )
                              }
                              className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                            >
                              <Copy size={16} />

                              <span className="text-sm">
                                Share
                              </span>
                            </button>
                          )}

                        </div>

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">

                        <div className="flex justify-center items-center gap-4">

                          <button
                            title="Download"
                            onClick={() =>
                              handleDownload(
                                file
                              )
                            }
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Download size={19} />
                          </button>

                          <button
                            title="Delete"
                            onClick={() =>
                              openDeleteConfirmation(
                                file.id
                              )
                            }
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={19} />
                          </button>

                          {file.isPublic ? (
                            <a
                              href={`/files/${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View File"
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <Eye size={19} />
                            </a>
                          ) : (
                            <Lock
                              size={18}
                              className="text-gray-400"
                            />
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          ) : (

            /* =================================================
               GRID VIEW
            ================================================= */

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {files.map((file) => (

                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={
                    openDeleteConfirmation
                  }
                  onTogglePublic={
                    toggleFileStatus
                  }
                  onDownload={
                    handleDownload
                  }
                  onShareLink={
                    openShareModal
                  }
                />

              ))}

            </div>

          )}

        </section>

        {/* =================================================
            DELETE CONFIRMATION
        ================================================= */}

        <ConfirmationDialog
          isOpen={
            deleteConfirmation.isOpen
          }
          onClose={
            closeDeleteConfirmation
          }
          title="Delete File"
          message="Are you sure you want to delete this file? This action cannot be undone."
          cancelText="Cancel"
          confirmText="Delete"
          cancelButtonClass="bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded"
          confirmButtonClass="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
          onConfirm={handleDeleteFile}
        />

        {/* =================================================
            SHARE MODAL
        ================================================= */}

        <ShareModal
          isOpen={shareModel.isOpen}
          onClose={closeShareModal}
          link={shareModel.link}
          title="Share File"
        />

        </div>

        

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
