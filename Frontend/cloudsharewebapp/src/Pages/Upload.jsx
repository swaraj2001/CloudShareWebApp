import React, { useContext, useState } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";
import FileUploadBox from "../Components/FileUploadBox";

import { useAuth } from "@clerk/clerk-react";
import UserCreditContext from "../Context/UserCreditContext";
import { AlertCircle } from "lucide-react";

import axios from "axios";
import apiEndpoints from "../Utils/apiEndpoints";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { getToken } = useAuth();
  const { credits, setCredits } = useContext(UserCreditContext);

  const MAX_FILES = 5;

  const isUploadDisabled =
    files.length === 0 ||
    files.length > MAX_FILES ||
    credits <= 0 ||
    files.length > credits;

  // --------------------------------------------------
  // Upload Files
  // --------------------------------------------------

  const handleUpload = async () => {
    // Validate files
    if (files.length === 0) {
      setMessage("Please select at least one file.");
      setMessageType("error");
      return;
    }

    if (files.length > MAX_FILES) {
      setMessage(
        `You can upload a maximum of ${MAX_FILES} files.`
      );
      setMessageType("error");
      return;
    }

    if (credits <= 0) {
      setMessage("You don't have enough credits.");
      setMessageType("error");
      return;
    }

    if (files.length > credits) {
      setMessage(
        `You only have ${credits} credits available.`
      );
      setMessageType("error");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setMessageType("");

      // --------------------------------------------------
      // Create FormData
      // --------------------------------------------------

      const formData = new FormData();

      files.forEach((item) => {
        if (item?.file) {
          formData.append("files", item.file);
        }
      });

      // --------------------------------------------------
      // Get Clerk Token
      // --------------------------------------------------

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not available.");
      }

      // --------------------------------------------------
      // Mark files as uploading
      // --------------------------------------------------

      setFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "uploading",
          progress: 0,
        }))
      );

      // --------------------------------------------------
      // Upload
      // --------------------------------------------------

      const response = await axios.post(
        apiEndpoints.UPLOAD_FILES,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              return;
            }

            const progress = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setFiles((prevFiles) =>
              prevFiles.map((item) => ({
                ...item,
                progress,
              }))
            );
          },
        }
      );

      console.log("Upload response:", response.data);

      // --------------------------------------------------
      // Update Credits
      // --------------------------------------------------

      if (
        response.data &&
        response.data.remainingCredits !== undefined
      ) {
        setCredits(response.data.remainingCredits);
      } else {
        // Fallback if backend doesn't return credits
        setCredits((prev) => prev - files.length);
      }

      // --------------------------------------------------
      // Mark Files Uploaded
      // --------------------------------------------------

      setFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "uploaded",
          progress: 100,
        }))
      );

      setMessage("Files uploaded successfully.");
      setMessageType("success");

      // Clear files after a short delay
      setTimeout(() => {
        setFiles([]);
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);

      // Mark files as failed
      setFiles((prevFiles) =>
        prevFiles.map((item) => ({
          ...item,
          status: "error",
        }))
      );

      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while uploading the files."
      );

      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <DashboardLayout activeMenu="Upload">
      <div className="p-6">

        {/* Message */}

        {message && (
          <div
            className={`
              mb-6
              flex
              items-center
              gap-3
              rounded-lg
              p-4

              ${
                messageType === "error"
                  ? "bg-red-50 text-red-700"
                  : messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }
            `}
          >
            {messageType === "error" && (
              <AlertCircle size={20} />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* Upload Component */}

        <FileUploadBox
          files={files}
          setFiles={setFiles}
          remainingCredits={credits}
          maxFiles={MAX_FILES}
          isUploadDisabled={isUploadDisabled}
          uploading={uploading}
          onUpload={handleUpload}
        />

      </div>
    </DashboardLayout>
  );
};

export default Upload;