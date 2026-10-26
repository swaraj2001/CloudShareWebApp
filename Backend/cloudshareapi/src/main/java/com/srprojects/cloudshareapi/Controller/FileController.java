package com.srprojects.cloudshareapi.Controller;

import com.srprojects.cloudshareapi.DTO.FileMetaDataDTO;
import com.srprojects.cloudshareapi.Document.UserCredits;
import com.srprojects.cloudshareapi.Service.FileMetaDataService;
import com.srprojects.cloudshareapi.Service.UserCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {
    private final FileMetaDataService fileMetaDataService;
    private final UserCreditService userCreditService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(@RequestPart("files")MultipartFile[] files) throws IOException {
        Map<String , Object> response = new HashMap<>();
        List <FileMetaDataDTO> uploadFiles = fileMetaDataService.uploadFiles(files);
         UserCredits finalCredits = userCreditService.getUserCredits();
        response.put("files" , uploadFiles);
        response.put("remainingCredits" ,finalCredits.getCredits());
        System.out.println(finalCredits.getCredits());
        System.out.println("Thank You");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getFilesForCurrentUser(){
        List<FileMetaDataDTO> files = fileMetaDataService.getFiles();
        return ResponseEntity.ok(files);
    }
    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicFile(@PathVariable String id){
        FileMetaDataDTO file = fileMetaDataService.getPublicFile(id);
        return ResponseEntity.ok(file);
    }
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable String id) throws IOException {
        FileMetaDataDTO file = fileMetaDataService.getDownloadableFile(id);
        Path path = Paths.get(file.getFileLocation());
       Resource resource = new UrlResource(path.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\""
                )
                .body(resource);

    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id){
        fileMetaDataService.DeleteFile(id);
        return ResponseEntity.noContent().build();

    }
    @PatchMapping("/{id}/toggle-public")
    public ResponseEntity<?> togglePublic(@PathVariable String id){
        FileMetaDataDTO fileMetaDataDTO = fileMetaDataService.togglePublic(id);
        return ResponseEntity.ok(fileMetaDataDTO);
    }
}
