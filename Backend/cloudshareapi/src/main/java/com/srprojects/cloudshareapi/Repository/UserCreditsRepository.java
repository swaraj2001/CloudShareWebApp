package com.srprojects.cloudshareapi.Repository;

import com.srprojects.cloudshareapi.Document.UserCredits;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserCreditsRepository extends MongoRepository<UserCredits , String> {

    Optional<UserCredits> findByClerkId(String clerkId);

}
