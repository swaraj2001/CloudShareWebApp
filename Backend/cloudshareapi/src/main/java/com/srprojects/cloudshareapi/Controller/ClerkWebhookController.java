package com.srprojects.cloudshareapi.Controller;

import com.srprojects.cloudshareapi.DTO.ProfileDTO;
import com.srprojects.cloudshareapi.Service.ProfileService;
import com.srprojects.cloudshareapi.Service.UserCreditService;
import com.svix.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.http.HttpHeaders; // Svix expects THIS class, so we build it manually below
import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class ClerkWebhookController {
    @PostMapping("/clerks")
    public ResponseEntity<String> handleClerkWebhook(
            @RequestBody String payload) {

        return ResponseEntity.ok("Webhook received");
    }


    @Value("${clerk.webhook.secret}")
    private String webhookSecretKey;
    @Autowired
    private final ProfileService profileService;
    @Autowired
    private final UserCreditService userCreditService;
    @Autowired
    private final ObjectMapper objectMapper;


    private static final Logger logger =
            LoggerFactory.getLogger(ClerkWebhookController.class);

    @PostMapping("/clerk")
    public ResponseEntity<String> handleClerkWebhook(
            @RequestHeader(value = "svix-id", required = false) String svixId,
            @RequestHeader(value = "svix-timestamp", required = false) String svixTimestamp,
            @RequestHeader(value = "svix-signature", required = false) String svixSignature,
            @RequestBody String payload) {

        logger.info("Hook called");
        logger.info(payload);

        // 1. Make sure the Svix headers are present
        if (svixId == null || svixTimestamp == null || svixSignature == null) {
            log.warn("Clerk webhook rejected: missing svix headers");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Svix headers");
        }

        // 2. Verify the signature (must use the RAW payload string)
        if (!verifyWebhookSignature(payload, svixId, svixTimestamp, svixSignature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }

        // 3. Process the event
        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            String eventType = rootNode.path("type").asString("");
            JsonNode data = rootNode.path("data");

            switch (eventType) {
                case "user.created" -> handleUserCreated(data);
                case "user.updated" -> handleUserUpdated(data);
                case "user.deleted" -> handleUserDeleted(data);
                default -> log.info("Unhandled Clerk event: {}", eventType);
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            // 500 (not 401) so Clerk/Svix knows to retry and so real bugs are visible
            log.error("Error processing Clerk webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    private boolean verifyWebhookSignature(String payload, String svixId,
                                           String svixTimestamp, String svixSignature) {
        try {
            // Svix's Java SDK requires java.net.http.HttpHeaders
            HttpHeaders headers = HttpHeaders.of(
                    Map.of(
                            "svix-id", List.of(svixId),
                            "svix-timestamp", List.of(svixTimestamp),
                            "svix-signature", List.of(svixSignature)
                    ),
                    (name, value) -> true
            );

            new Webhook(webhookSecretKey).verify(payload, headers);
            return true;

        } catch (Exception e) {
            log.warn("Clerk webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    private void handleUserCreated(JsonNode data) {
        String clerkId = data.path("id").asString("");

        profileService.createProfile(buildProfile(data));
        userCreditService.createInitialCredits(clerkId);

        log.info("Created profile for Clerk user {} ({})", clerkId, extractPrimaryEmail(data));
    }

    private void handleUserUpdated(JsonNode data) {
        ProfileDTO updatedProfile = buildProfile(data);

        ProfileDTO result = profileService.updateProfile(updatedProfile);

        // If the profile doesn't exist yet, create it
        if (result == null) {
            handleUserCreated(data);
        }
    }

    private void handleUserDeleted(JsonNode data) {
        String clerkId = data.path("id").asString("");
        if (!clerkId.isEmpty()) {
            profileService.deleteProfile(clerkId);
            log.info("Deleted profile for Clerk user {}", clerkId);
        }
    }

    // ---------- helpers ----------

    private ProfileDTO buildProfile(JsonNode data) {
        return ProfileDTO.builder()
                .clerkId(data.path("id").asString(""))
                .email(extractPrimaryEmail(data))
                .firstName(data.path("first_name").asString(""))
                .lastName(data.path("last_name").asString(""))
                .photoUrl(data.path("image_url").asString(""))
                .build();
    }

    /** Returns the user's primary email, falling back to the first email in the list. */
    private String extractPrimaryEmail(JsonNode data) {
        JsonNode emails = data.path("email_addresses");
        if (!emails.isArray() || emails.size() == 0) {
            return "";
        }

        String primaryId = data.path("primary_email_address_id").asString("");
        for (JsonNode emailNode : emails) {
            if (emailNode.path("id").asString("").equals(primaryId)) {
                return emailNode.path("email_address").asString("");
            }
        }
        return emails.get(0).path("email_address").asString("");
    }
}