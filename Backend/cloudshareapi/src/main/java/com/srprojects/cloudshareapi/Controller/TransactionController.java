package com.srprojects.cloudshareapi.Controller;

import com.srprojects.cloudshareapi.Document.PaymentTransaction;
import com.srprojects.cloudshareapi.Document.ProfileDocument;
import com.srprojects.cloudshareapi.Repository.PaymentTransactionRepository;
import com.srprojects.cloudshareapi.Service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getUsersTransactions(){
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        String clerkId = currentProfile.getClerkId();

        List<PaymentTransaction> transactions = paymentTransactionRepository.findByClerkIdAndStatusOrderByTransactionDateDesc(clerkId,"SUCCESS");
        return ResponseEntity.ok(transactions);

    }

}
