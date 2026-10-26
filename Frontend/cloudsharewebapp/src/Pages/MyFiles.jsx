import React from 'react'
import DashboardLayout from '../Layouts/DashboardLayout'
import { useState } from 'react';
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
    Trash2
    , List, Grid, File,
} from 'lucide-react';
import apiEndpoints from '../Utils/apiEndpoints';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileCard from '../Components/FileCard';
import ConfirmationDialog from '../Components/ConfirmationDialog';
import ShareModal from '../Components/ShareModel';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [viewMode , SetViewMode] = useState("list");
  const {getToken} = useAuth();
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    fileId: null,
});

  const [shareModel , setShareModel] = useState({
    isOpen: false,
    fileId:null,
    link: ""
  })




  // Fetch files from the backend API
  const fetchFiles = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(apiEndpoints.FETCH_FILES, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.status === 200) {
        console.log('Files fetched successfully:', response.data);
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error fetching files : ' , error.message);
    } 
  }

// Toggle public/private status of a file
const toggleFileStatus = async (fileToUpdate) => {
  try {
      const token = await getToken(); 
      await axios.patch(apiEndpoints.TOGGLE_FILE_STATUS(fileToUpdate.id), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFiles(files.map(file => file.id === fileToUpdate.id ? { ...file, isPublic: !file.isPublic } : file));
    } catch (error) {
      console.error('Error toggling file status:', error);
      toast.error('Error toggling file status: ' + error.message);
    }
  }

  useEffect(()=>{
    fetchFiles();
  }, []);


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

    // Handle file download 
    const handleDownload = async (file) => {
      try {
        const token = await getToken(); 
        const response = await axios.get(apiEndpoints.DOWNLOAD_FILE(file.id), {
          headers: {
            Authorization: `Bearer ${token}`  
          },
          responseType: 'blob' // Important for downloading files
        });   
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name); // You can set the filename here
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url); // Clean up the URL object
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Error downloading file: ' + error.message);
      } 
    };

   // Open the delete confirmation dialog
const openDeleteConfirmation = (fileId) => {
    setDeleteConfirmation({
        isOpen: true,
        fileId: fileId,
    });
};

// Close the delete confirmation dialog
const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
        isOpen: false,
        fileId: null,
    });
};
    // Handle file deletion
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
            // Remove deleted file from UI
            setFiles((prevFiles) =>
                prevFiles.filter((file) => file.id !== fileId)
            );

            // Close dialog
            closeDeleteConfirmation();

            // Show success message
            toast.success('File deleted successfully');
        }

    } catch (error) {
        console.error('Error deleting file:', error);

        toast.error(
            error.response?.data?.message ||
            'Error deleting file'
        );
    }
};

// Opens The Share link Modal 
 const openShareModal = (fileId) => {
    const link = `${window.location.origin}/files/${fileId}`;
    setShareModel({
      isOpen:true,
      fileId,
      link
    })
 }

 // Close the Share Link Modal
 const closeShareModal = () =>{
  setShareModel({
      isOpen:false,
      fileId:null,
      link:""
  })
 }



  return (
     <DashboardLayout activeMenu="My Files" >
     
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">My Files {files?.length}</h2>
          <div class="flex items-center gap-3">
            <List onClick={() => SetViewMode("list")} size={24} className={`cursor-pointer ${viewMode === "list" ? "text-blue-500" : "text-gray-500"} hover:text-gray-700`} />
            <Grid onClick={() => SetViewMode("grid")} size={24} className={`cursor-pointer ${viewMode === "grid" ? "text-blue-500" : "text-gray-500"} hover:text-gray-700`} />  
           
          </div>
        </div>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow p-12">
            <File size={48} className="text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Files Uploaded yet</h3>
            <p className="text-center text-gray-600 max-w-md mb-6">You haven't uploaded any files yet. Start by uploading your first file to see it here.</p>
            <a href="/upload" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition">Upload File</a> 
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 border-b ">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr className='hover:bg-gray-50 transition-colors' key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      {file.name}
                    </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(file.size / 1024 / 1024).toFixed(1)} KB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleFileStatus(file)}
                          className="flex items-center gap-2 cursor-pointer group">
                          {file.isPublic ? (
                           <>
                              <Globe size={16} className="text-green-500 group-hover:text-green-700 transition" /> 
                              <span className='group-hover:underline'>Public</span>
                           </>
                          ) : (
                             <>
                              <Lock size={16} className="text-gray-500 group-hover:text-green-700 transition" /> 
                              <span className='group-hover:underline'>Private</span>
                           </>
                          )}
                        </button>
                        {
                          file.isPublic && (
                            <button
                             onClick={() => openShareModal(file.id)}
                             className="flex items-center gap-2 cursor-pointer group text-blue-500" >
                              <Copy size={16} className="group-hover:text-blue-700 transition" />
                              <span className='group-hover:underline'>Share Link</span>
                            </button>
                          )
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex justify-center items-center gap-2">
                                <button title="Download" onClick = {() => handleDownload(file)} className="text-gray-500 hover:text-blue-600">
                                  <Download size={20} />
                                </button>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                                <button 
                                onClick = {()=> openDeleteConfirmation(file.id)}
                                title="Delete" className="text-gray-500 hover:text-red-600">
                                   <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                              {
                                file.isPublic ? (
                                <a href={`/files/${file.id}`}  target="_blank" rel="noopener noreferrer" title="View File" className="text-gray-500 hover:text-blue-600">
                                  <Eye size={20} />
                                </a>
                                ) : 
                                (
                                  <span title="Private File" className="text-gray-500">
                                   
                                  </span>
                                )
                              }
                            </div>

                          </div>
                    </td>  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-clos-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} 
                onDelete={openDeleteConfirmation}
                onTogglePublic={toggleFileStatus}
                onDownload={handleDownload}
                onShareLink={openShareModal}

              />
            ))}
          </div>

        )}

        {/* {Delete Confirmation Dialog} */}
        <ConfirmationDialog 
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          title="Delete File"
          message="Are you sure you want to delete this file? This action cannot be undone."
          cancelText="Cancel"
          confirmText="Delete"
          cancelButtonClass="bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded"
          confirmButtonClass="bg-purple-500 hover:bg-purple-600 text-white  py-2 px-4 rounded"
          onConfirm={handleDeleteFile}
        />

       {/* {Link Share Modal}  */}
       
       <ShareModal
        isOpen={shareModel.isOpen}
        onClose={closeShareModal}
        link={shareModel.link}
        title="Share File"
      />

      </div>
    
    </DashboardLayout>
  )
}

export default MyFiles
