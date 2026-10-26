import React from "react";
import { X } from "lucide-react";
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete File",
  message = "Are you sure you want to delete this file? This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Delete",
  cancelButtonClass = "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded",
  confirmButtonClass = "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
}) => {
  if (!isOpen) {
    return null;
  }
  const handleConfirm = () => {
    onConfirm();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {" "}
      {/* Dialog */}{" "}
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {" "}
        {/* Title */}{" "}
        <div className="flex justify-between border-b text-gray-200 ">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 "> {title} </h2>{" "}
             <button type="button" onClick={onClose} className="cursor-pointer  text-gray-900">
            {" "}
            {" "}
            <X />
          </button>{" "}
        </div>
        
        {/* Message */} <p className="mb-6 text-gray-600"> {message} </p>{" "}
        {/* Buttons */}{" "}
        <div className="flex justify-end gap-3 border-t text-gray-200 p-4">
          {" "}
          <button type="button" onClick={onClose} className={cancelButtonClass}>
            {" "}
            {cancelText}{" "}
          </button>{" "}
          <button
            type="button"
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {" "}
            {confirmText}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default ConfirmationDialog;
