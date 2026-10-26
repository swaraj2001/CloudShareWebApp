package com.srprojects.cloudshareapi.Controller;

import com.srprojects.cloudshareapi.DTO.UserCreditsDTO;
import com.srprojects.cloudshareapi.Document.UserCredits;
import com.srprojects.cloudshareapi.Service.UserCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserCreditsController {
    private final UserCreditService userCreditService;

    @GetMapping("/credits")
    public ResponseEntity<?> getUserCredits(){
       UserCredits userCredits = userCreditService.getUserCredits();
        UserCreditsDTO response =  UserCreditsDTO.builder()
                .credits(userCredits.getCredits())
                .plan(userCredits.getPlan())
                .build();

        return ResponseEntity.ok(response);
    }
}
