package com.karthikjewellers.retail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RetailApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetailApplication.class, args);
        System.out.println("================================================================");
        System.out.println(" ✨  KARTHIK JEWELLERS - ENTERPRISE JAVA SPRING BOOT PORTAL  ✨ ");
        System.out.println("================================================================");
        System.out.println(" 🎛️  Master Hub Dashboard: http://localhost:8080/dashboard");
        System.out.println(" 🛍️  Karthik Flagship:     http://localhost:8080/");
        System.out.println(" 👑  Viswanandini Bridal:   http://localhost:8080/viswanandini");
        System.out.println(" ⚙️  Admin Command Center:  http://localhost:8080/admin");
        System.out.println(" 📄  GST Invoice System:    http://localhost:8080/invoice");
        System.out.println(" 📊  API Endpoints:        http://localhost:8080/api/products");
        System.out.println("================================================================");
    }
}
