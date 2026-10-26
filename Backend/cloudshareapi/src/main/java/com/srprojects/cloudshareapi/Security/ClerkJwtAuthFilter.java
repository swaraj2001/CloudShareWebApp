package com.srprojects.cloudshareapi.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class ClerkJwtAuthFilter extends OncePerRequestFilter {

    @Value("${clerk.issuer}")
    private String clerkIssuer;

    private final ClerkJwksProvider jwksProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Allow CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Allow Clerk webhook requests without JWT
        if (request.getRequestURI().contains("/webhooks") || request.getRequestURI().contains("/public")|| request.getRequestURI().contains("/download")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // No JWT -> let Spring Security decide
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String token = authHeader.substring(7).trim();

            // Check JWT format
            String[] chunks = token.split("\\.");

            if (chunks.length != 3) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid JWT token format"
                );
                return;
            }

            // Decode JWT header
            String headerJson = new String(
                    Base64.getUrlDecoder().decode(chunks[0])
            );

            ObjectMapper mapper = new ObjectMapper();
            JsonNode headerNode = mapper.readTree(headerJson);

            if (!headerNode.has("kid")) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Token header is missing kid"
                );
                return;
            }

            String kid = headerNode.get("kid").asText();

            System.out.println("JWT kid: " + kid);

            // Get public key
            PublicKey publicKey = jwksProvider.getPublicKey(kid);

            if (publicKey == null) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Unable to find public key"
                );
                return;
            }

            // Validate JWT
            Claims claims = Jwts.parser()
                    .setSigningKey(publicKey)
                    .setAllowedClockSkewSeconds(60)
                    .requireIssuer(clerkIssuer)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Clerk user ID
            String clerkId = claims.getSubject();

            if (clerkId == null || clerkId.isBlank()) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "JWT subject is missing"
                );
                return;
            }

            System.out.println("Authenticated Clerk user: " + clerkId);

            // Create authenticated user
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            clerkId,
                            null,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority("ROLE_ADMIN")
                            )
                    );

            // Store authentication
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authenticationToken);

            System.out.println(
                    "SecurityContext authentication: " +
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
            );

            // Continue request
            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {

            SecurityContextHolder.clearContext();

            System.out.println("JWT EXPIRED: " + e.getMessage());

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "JWT token has expired"
            );

        } catch (JwtException e) {

            SecurityContextHolder.clearContext();

            System.out.println("JWT ERROR: " + e.getMessage());

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid JWT token"
            );

        } catch (IllegalArgumentException e) {

            SecurityContextHolder.clearContext();

            System.out.println("JWT ARGUMENT ERROR: " + e.getMessage());

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid JWT token"
            );

        } catch (Exception e) {

            SecurityContextHolder.clearContext();

            e.printStackTrace();

            response.sendError(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Authentication processing failed"
            );
        }
    }
}