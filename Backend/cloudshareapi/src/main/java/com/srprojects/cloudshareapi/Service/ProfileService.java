package com.srprojects.cloudshareapi.Service;

import com.srprojects.cloudshareapi.DTO.ProfileDTO;
import com.srprojects.cloudshareapi.Document.ProfileDocument;
import com.srprojects.cloudshareapi.Repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProfileService {
        private final ProfileRepository profileRepository;
        public ProfileDTO createProfile(ProfileDTO profileDTO){
            if (profileRepository.existsByClerkId(profileDTO.getClerkId())){
                return updateProfile(profileDTO);
            }
           ProfileDocument profile =  ProfileDocument.builder()
                    .clerkId(profileDTO.getClerkId())
                    .email(profileDTO.getEmail())
                    .firstName(profileDTO.getFirstName())
                    .lastName(profileDTO.getLastName())
                    .credits(5)
                    .createdAt(Instant.now())
                    .photoUrl(profileDTO.getPhotoUrl())
                    .build();

                        profile = profileRepository.save(profile);

          return ProfileDTO.builder()
                   .id(profile.getId())
                   .clerkId(profile.getClerkId())
                   .email(profile.getEmail())
                   .firstName(profile.getFirstName())
                   .lastName(profile.getLastName())
                   .credits(profile.getCredits())
                   .createdAt(profile.getCreatedAt())
                   .photoUrl(profileDTO.getPhotoUrl())
                   .build();
        }

        public ProfileDTO updateProfile(ProfileDTO profileDTO){
            ProfileDocument existingProfile = profileRepository.findByClerkId(profileDTO.getClerkId());

            if (existingProfile != null){
                if (existingProfile.getEmail() != null && !existingProfile.getEmail().isEmpty()){
                    existingProfile.setEmail(profileDTO.getEmail());
                }
                if (existingProfile.getFirstName() != null && !existingProfile.getFirstName().isEmpty()){
                    existingProfile.setFirstName(profileDTO.getFirstName());
                }
                if (existingProfile.getLastName() != null && !existingProfile.getLastName().isEmpty()){
                    existingProfile.setLastName(profileDTO.getLastName());
                }

                if (existingProfile.getPhotoUrl() != null && !existingProfile.getPhotoUrl().isEmpty()){
                    existingProfile.setPhotoUrl(profileDTO.getPhotoUrl());
                }
                profileRepository.save(existingProfile);
                return ProfileDTO.builder()
                        .id(existingProfile.getId())
                        .clerkId(existingProfile.getClerkId())
                        .email(existingProfile.getEmail())
                        .firstName(existingProfile.getFirstName())
                        .lastName(existingProfile.getLastName())
                        .credits(existingProfile.getCredits())
                        .createdAt(existingProfile.getCreatedAt())
                        .photoUrl(existingProfile.getPhotoUrl())
                        .build();
            }
            return null;
        }

        public Boolean existsByClerkId(String clerkId){
            return profileRepository.existsByClerkId(clerkId);
        }

        public void deleteProfile(String clerkId){
            ProfileDocument existingProfile = profileRepository.findByClerkId(clerkId);
            if (existingProfile != null){
                profileRepository.delete(existingProfile);
            }

        }

        public ProfileDocument getCurrentProfile(){
            if (SecurityContextHolder.getContext().getAuthentication() == null){
                throw new UsernameNotFoundException("User not authenticated");

            }
            String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();
            return profileRepository.findByClerkId(clerkId);
        }

}
