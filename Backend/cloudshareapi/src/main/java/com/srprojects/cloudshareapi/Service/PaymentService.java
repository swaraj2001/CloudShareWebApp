package com.srprojects.cloudshareapi.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.srprojects.cloudshareapi.DTO.PaymentDTO;
import com.srprojects.cloudshareapi.DTO.PaymentVerificationDTO;
import com.srprojects.cloudshareapi.Document.PaymentTransaction;
import com.srprojects.cloudshareapi.Document.ProfileDocument;
import com.srprojects.cloudshareapi.Repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class PaymentService {
    private final ProfileService profileService;
    private final UserCreditService userCreditService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentDTO createOrder(PaymentDTO paymentDTO){
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            String clerkId = currentProfile.getClerkId();
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId,razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount" , paymentDTO.getAmount());
            orderRequest.put("currency", paymentDTO.getCurrency());
            orderRequest.put("receipt" , "order_" + System.currentTimeMillis());

            // Creating Order in Razorpay
            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");
            // Create pending transaction record

            PaymentTransaction transaction = PaymentTransaction.builder()
                    .clerkId(clerkId)
                    .orderId(orderId)
                    .planId(paymentDTO.getPlanId())
                    .amount(paymentDTO.getAmount())
                    .currency(paymentDTO.getCurrency())
                    .status("PENDING")
                    .transactionDate(LocalDateTime.now())
                    .userEmail(currentProfile.getEmail())
                    .userName(currentProfile.getFirstName() + " "+currentProfile.getLastName())
                    .build();

            paymentTransactionRepository.save(transaction);

            return PaymentDTO.builder()
                    .orderId(orderId)
                    .success(true)
                    .message("Order created successfully")
                    .build();

        } catch (Exception e) {
            return PaymentDTO.builder()
                    .success(false)
                    .message("Error creating Order "+e.getMessage())
                    .build();
        }
    }

    public PaymentDTO verifyPayment(PaymentVerificationDTO request){
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            String clerkId = currentProfile.getClerkId();
            String data = request.getRazorpay_order_id()+ "|" +request.getRazorpay_payment_id();
            String generatedSignature =  generateHmacSha256Signature(data , razorpayKeySecret);
            if (!generatedSignature.equals(request.getRazorpay_signature())){
                    updateTransactionStatus(request.getRazorpay_order_id(), "FAILED" , request.getRazorpay_payment_id(), null);
                    return PaymentDTO.builder()
                            .success(false)
                            .message("Payment Signature verification is failed")
                            .build();

            }
            // Add the credits according to plan
            int creditsToAdd = 0;
            String plan = switch (request.getPlanId()) {
                case "premium" -> {
                    creditsToAdd = 500;
                    yield "PREMIUM";
                }
                case "ultimate" -> {
                    creditsToAdd = 5000;
                    yield "ULTIMATE";
                }
                default -> "BASIC";
            };

            if (creditsToAdd > 0){
                userCreditService.addCredits(clerkId , creditsToAdd ,plan);
                updateTransactionStatus(request.getRazorpay_order_id() , "SUCCESS" ,request.getRazorpay_payment_id() , creditsToAdd );

                return PaymentDTO.builder()
                        .success(true)
                        .message("Payment Verified and credits added successfully...")
                        .credits(userCreditService.getUserCredits(clerkId).getCredits())
                        .build();
            }else {
                updateTransactionStatus(request.getRazorpay_order_id() , "FAILED" ,request.getRazorpay_payment_id() , null );

                return PaymentDTO.builder()
                        .success(true)
                        .message("Invalid Plan Selected")
                        .build();
            }


        }catch (Exception e){
            try {
                updateTransactionStatus(request.getRazorpay_order_id(), "ERROR" , request.getRazorpay_payment_id() ,null);
            }catch (Exception ex){
                throw new RuntimeException();
            }
            return PaymentDTO.builder()
                    .success(true)
                    .message("Error verifying payment : "+ e.getMessage()).build();

        }
    }

    private void updateTransactionStatus(String razorpayOrderId, String status, String razorpayPaymentId, Integer creditsToAdd) {
        paymentTransactionRepository.findAll().stream()
                .filter(t -> t.getOrderId() != null && t.getOrderId().equals(razorpayOrderId))
                .findFirst()
                .map(transaction -> {
                    transaction.setStatus(status);
                    transaction.setPaymentId(razorpayPaymentId);

                    if (creditsToAdd != null){
                        transaction.setCreditsAdded(creditsToAdd);
                    }
                    return paymentTransactionRepository.save(transaction);
                }).orElse(null);
    }

    public static String generateHmacSha256Signature(String data, String razorpayKeySecret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert byte[] to hexadecimal String
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);

                if (hex.length() == 1) {
                    hexString.append('0');
                }

                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC SHA256 signature", e);
        }
    }

}
