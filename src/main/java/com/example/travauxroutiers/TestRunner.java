package com.example.travauxroutiers;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class TestRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        System.out.println(">>> TEST RUNNER EXECUTED <<<");
    }
}
