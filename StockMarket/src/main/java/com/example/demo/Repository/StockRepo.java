package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Stock;

public interface StockRepo extends JpaRepository<Stock,Long> {
  public void deleteStockByTicker(String ticker);
public Stock findByTicker(String ticker);
}
