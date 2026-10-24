/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.aeroresume.backend.repository;

import com.aeroresume.backend.model.Template;
import org.springframework.data.jpa.repository.JpaRepository;
/**
 *
 * @author suhaib
 */

public interface TemplateRepository extends JpaRepository<Template, Long> {
    // JpaRepository gives us findAll().
}
