package com.srprojects.cloudshareapi.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDTO {
    private String id;
    private String clerkId;

    private String email;
    private String firstName;
    private String lastName;
    private String photoUrl;
    private Integer credits;

    private Instant createdAt;
}
