package com.sanket.filepacker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
    File Packer Web Application
    Wraps the SRH3 custom archive format (originally a CLI tool) in a REST API.
    Author: Sanket Sadashiv Hajare
*/
@SpringBootApplication
public class FilePackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FilePackerApplication.class, args);
    }
}
