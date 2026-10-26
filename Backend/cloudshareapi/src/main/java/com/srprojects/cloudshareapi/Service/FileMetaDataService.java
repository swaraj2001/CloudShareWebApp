package com.srprojects.cloudshareapi.Service;

import com.srprojects.cloudshareapi.DTO.FileMetaDataDTO;
import com.srprojects.cloudshareapi.Document.FileMetaDataDocument;
import com.srprojects.cloudshareapi.Document.ProfileDocument;
import com.srprojects.cloudshareapi.Repository.FileMetaDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetaDataService {
    private final ProfileService profileService;
    private final UserCreditService userCreditService;
    private final FileMetaDataRepository fileMetaDataRepository;
    public List<FileMetaDataDTO> uploadFiles(MultipartFile[] files) throws IOException {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<FileMetaDataDocument> savedFiles = new ArrayList<>();

        if (!userCreditService.hasEnoughCredits(files.length)){
            throw new RuntimeException("Not enough credits to upload files. Please purchase more credits");
        }
        Path uploadPaths = Paths.get("uploads").toAbsolutePath().normalize();
        Files.createDirectories(uploadPaths);

        for (MultipartFile file : files){
            String fileName = UUID.randomUUID()+"."+ StringUtils.getFilenameExtension(file.getOriginalFilename());
            Path targetLocation = uploadPaths.resolve(fileName);
            Files.copy(file.getInputStream(),targetLocation , StandardCopyOption.REPLACE_EXISTING);

            FileMetaDataDocument fileMetaData = FileMetaDataDocument.builder()
                    .fileLocation(targetLocation.toString())
                    .name(file.getOriginalFilename())
                    .size(file.getSize())
                    .type(file.getContentType())
                    .clerkId(currentProfile.getClerkId())
                    .isPublic(false)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            // TODO : Consume one credit for each file upload
            userCreditService.consumeCredits();

            savedFiles.add(fileMetaDataRepository.save(fileMetaData));

        }
        return savedFiles.stream().map(fileMetaDataDocument -> mapToDTO(fileMetaDataDocument))
                .collect(Collectors.toList());
    }

    private FileMetaDataDTO mapToDTO(FileMetaDataDocument fileMetaDataDocument) {
       return FileMetaDataDTO.builder()
               .id(fileMetaDataDocument.getId())
                .fileLocation(fileMetaDataDocument.getFileLocation())
                .name(fileMetaDataDocument.getName())
                .size(fileMetaDataDocument.getSize())
                .type(fileMetaDataDocument.getType())
                .clerkId(fileMetaDataDocument.getClerkId())
                .isPublic(fileMetaDataDocument.getIsPublic())
                .uploadedAt(fileMetaDataDocument.getUploadedAt())
                .build();

    }

    public List<FileMetaDataDTO> getFiles(){
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<FileMetaDataDocument> files = fileMetaDataRepository.findByClerkId(currentProfile.getClerkId());
        return files.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public FileMetaDataDTO getPublicFile(String id){
        Optional<FileMetaDataDocument> fileMetaData = fileMetaDataRepository.findById(id);
        if (fileMetaData.isEmpty() || !fileMetaData.get().getIsPublic() ){
            throw new RuntimeException("Unable to get the file");
        }
        FileMetaDataDocument dataDocument = fileMetaData.get();
        return mapToDTO(dataDocument);
    }

    public FileMetaDataDTO getDownloadableFile(String fileId){
         FileMetaDataDocument file = fileMetaDataRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
         return mapToDTO(file);

    }

    public void DeleteFile(String fileId){
       try {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
           FileMetaDataDocument file = fileMetaDataRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
           if (!file.getClerkId().equals(currentProfile.getClerkId())){
               throw new RuntimeException("File doesn't belongs to current user");
           }
           Path path = Paths.get(file.getFileLocation());
           Files.deleteIfExists(path);
           fileMetaDataRepository.deleteById(fileId);

       }catch (Exception e) {
            throw new RuntimeException("Error deleting the file");
        }
    }

    public FileMetaDataDTO togglePublic(String fileId){
        FileMetaDataDocument file = fileMetaDataRepository.findById(fileId).orElseThrow(()-> new RuntimeException("File not Found") );
        file.setIsPublic(!file.getIsPublic());
        fileMetaDataRepository.save(file);
        return mapToDTO(file);
    }
}
