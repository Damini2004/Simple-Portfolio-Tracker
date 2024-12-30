package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.demo.Repository.StockRepo;
import com.example.demo.Repository.UserRepo;
import com.example.demo.model.Stock;
import com.example.demo.model.Users;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Map;

@RestController
public class StockMarketController {

    private final String API_KEY = "ctohd4pr01qpsueflf70ctohd4pr01qpsueflf7g";
    
  @Autowired
    UserRepo userrepo;
  
  @Autowired
  StockRepo stockrepo;
  
    Users u = new Users();
    
    @Transactional
    @DeleteMapping("/api/user/profile/{ticker}")
    public void deleteStock(@PathVariable String ticker) {
    	System.out.println("Delete api");
        stockrepo.deleteStockByTicker(ticker);
    }
    

    @GetMapping("/api/user/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile() {
        // Find user by username
        Users user = userrepo.getReferenceById(7);
System.out.println(user.getEmail() +" "+user.getUsername()+" ");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Construct response with user data
        Map<String, Object> response = Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "stocks", user.getStocks() // Assuming `Users` entity has a `List<Stock>` mapped
        );

        return ResponseEntity.ok(response);
    }

    
    
    @PostMapping("/api/user/profile")
    public ResponseEntity<Users> getUserProfile(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String ticker = (String) request.get("ticker");
        double buyprice = Double.parseDouble(request.get("buyprice").toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());

        System.out.println(name + " " + ticker + " " + buyprice + " " + quantity);
        Stock s2 =stockrepo.findByTicker(ticker);
        
        if(s2 ==null) {
        	s2=new Stock();
        	s2.setName(name);
        	s2.setTicker(ticker);
        	s2.setBuyPrice(buyprice);
        	s2.setQuantity(quantity);
        }else {
            s2.setQuantity(s2.getQuantity()+quantity);
        }
        
//    	Stock s =new Stock();
//    	s.setName(name);
//    	s.setTicker(ticker);
//    	s.setBuyPrice(buyprice);
//    	s.setQuantity(quantity);
    System.out.println("Hello");
   u=   userrepo.getReferenceById(7);
   List<Stock> currentStocks = u.getStocks();
   currentStocks.add(s2);
   u.setStocks(currentStocks);
s2.setUser(u);
stockrepo.save(s2);
   // Save the user
   userrepo.save(u);
     
      System.out.println("Done");
        Users user = userrepo.findByUsername("Demo123");
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PutMapping("/api/stock/{ticker}/{quantity}")
    public ResponseEntity<String> updateStockQuantity(@PathVariable String ticker, @PathVariable int quantity) {
        System.out.println(ticker + " "+ quantity);
    	// Validate quantity
        if (quantity < 0) {
            return ResponseEntity.badRequest().body("Quantity cannot be negative.");
        }
        
        // Fetch stock by ticker
        Stock existingStock = stockrepo.findByTicker(ticker);
        if (existingStock == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if the new quantity is more than the existing quantity
        if (quantity > existingStock.getQuantity()) {
            return ResponseEntity.badRequest().body("Expected quantity is more than existing.");
        } else {
            // Update stock quantity
        	int i = existingStock.getQuantity()-quantity;
            existingStock.setQuantity(i);
            stockrepo.save(existingStock);
            return ResponseEntity.ok("Stock quantity updated successfully.");
        }
    }

    
    @GetMapping("/api/stock-data")
    public Map<String, Object> getStockData(@RequestParam String symbol) {
        String quoteUrl = String.format(
                "https://finnhub.io/api/v1/quote?symbol=%s&token=%s",
                symbol, API_KEY);

        String profileUrl = String.format(
                "https://finnhub.io/api/v1/stock/profile2?symbol=%s&token=%s",
                symbol, API_KEY);

        RestTemplate restTemplate = new RestTemplate(createHttpRequestFactory());

        try {
            // Fetch stock quote data (price data)
            Map<String, Object> quoteResponse = restTemplate.getForObject(quoteUrl, Map.class);
            if (quoteResponse == null || quoteResponse.isEmpty()) {
                throw new RuntimeException("No quote data found for the symbol: " + symbol);
            }

            // Fetch company profile data (company name)
            Map<String, Object> profileResponse = restTemplate.getForObject(profileUrl, Map.class);
            if (profileResponse == null || profileResponse.isEmpty()) {
                throw new RuntimeException("No profile data found for the symbol: " + symbol);
            }

            // Extract stock name and other details from profileResponse
            String stockName = (String) profileResponse.get("name");  // Get stock name
            String logo = (String) profileResponse.get("logo");  // Optionally, you can get the company logo if needed

            // Extract price data from quoteResponse
            Double currentPrice = convertToDouble(quoteResponse.get("c"));
            Double openPrice = convertToDouble(quoteResponse.get("o"));
            Double highPrice = convertToDouble(quoteResponse.get("h"));
            Double lowPrice = convertToDouble(quoteResponse.get("l"));
            Double previousClose = convertToDouble(quoteResponse.get("pc"));

            // Return combined data
            return Map.of(
                    "name", stockName,
                    "ticker", symbol,
                    "logo", logo,  // Optionally include company logo in the response
                    "currentPrice", currentPrice,
                    "openPrice", openPrice,
                    "highPrice", highPrice,
                    "lowPrice", lowPrice,
                    "previousClose", previousClose
            );
        } catch (Exception e) {
            throw new RuntimeException("Error fetching stock data for symbol: " + symbol, e);
        }
    }

    // Method to convert the value to Double if it is an Integer or Double
    private Double convertToDouble(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue(); // Convert to Double
        }
        return null; // or throw an exception if you want to handle cases where the value is not a number
    }

    private ClientHttpRequestFactory createHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // Set connection timeout to 5 seconds
        factory.setReadTimeout(5000);  // Set read timeout to 5 seconds
        return factory;
    }
}
