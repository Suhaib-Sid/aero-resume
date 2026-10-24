/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.aeroresume.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aeroresume.backend.dto.UserDto;
import com.aeroresume.backend.security.CustomUserDetails;
import com.aeroresume.backend.service.UserService;

/**
 *
 * @author suhaib
 */
@RestController
@RequestMapping("/api/user/profile")
public class UserController {
    
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal CustomUserDetails userDetail) {
        
        Long id = userDetail.getId();

        UserDto userProfile = userService.getUserProfile(id);

        return ResponseEntity.ok().body(userProfile);
    }

    @PutMapping("/")
    public ResponseEntity<?> updateUserProfile(@AuthenticationPrincipal CustomUserDetails userDetail, @RequestBody UserDto updatedUserDto) {
        Long id = userDetail.getId();

        UserDto userProfile = userService.updateUserProfile(id, updatedUserDto);

        return ResponseEntity.ok().body(userProfile);
    }
}
