package com.srprojects.cloudshareapi.DTO;

import lombok.*;

@Builder
@NoArgsConstructor
@Data
@AllArgsConstructor
public class UserCreditsDTO {
    private Integer credits;
    private String plan;
}
