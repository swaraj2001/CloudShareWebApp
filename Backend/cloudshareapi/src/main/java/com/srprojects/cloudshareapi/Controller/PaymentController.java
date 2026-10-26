package com.srprojects.cloudshareapi.Controller;


import com.srprojects.cloudshareapi.DTO.PaymentDTO;
import com.srprojects.cloudshareapi.DTO.PaymentVerificationDTO;
import com.srprojects.cloudshareapi.Service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {
    private final PaymentService paymentService;
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentDTO payMentDTO){
        // Call Service method to create order
        PaymentDTO response = paymentService.createOrder(payMentDTO);
        if (response.getSuccess()){
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.badRequest().body(response);
        }

    }
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationDTO request){
        // Use service method
        PaymentDTO response = paymentService.verifyPayment(request);
        if (response.getSuccess()){
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
