package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Users;


@Repository
public interface UserRepo extends JpaRepository<Users,Long> {
    Users findByUsername(String username);
    Users getReferenceById(int i);

}
