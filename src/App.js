import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import Profile from './Profile';
import 'animate.css';

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Navbar = () => (
<nav className="bg-gradient-to-r from-teal-500 to-blue-600 p-4 shadow-lg animate__animated animate__fadeIn">
<div className="flex justify-between items-center">
      <h1 className="text-white text-3xl font-bold">Stock Trends</h1>
      <ul className="flex space-x-6">
        {['Home', 'Profile', 'About', 'Contact'].map((page) => (
          <li key={page}>
            <Link
              to={page === 'Home' ? '/' : `/${page.toLowerCase()}`}
              className="text-white hover:text-yellow-300"
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

const Home = () => {
  const symbols = ["GOOGL", "AAPL", "TSLA", "TCS", "INFY", "NKE", "AMZN", "MSFT", "META", "NVDA", "MS", "INTC", "NFLX", "DIS", "BA"];
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const responses = await Promise.all(symbols.map((symbol) => axios.get(`http://localhost:8285/api/stock-data?symbol=${symbol}`)));
        setData(responses.reduce((acc, res, i) => ({ ...acc, [symbols[i]]: res.data }), {}));
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="relative w-32 h-32 flex justify-center items-center animate__animated animate__fadeIn">
  {/* Outer circle for the spinner */}
  <div className="absolute w-32 h-32 border-4 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>

  {/* Stock Ticker Animation */}
  <div className="absolute w-full h-full flex flex-col justify-center items-center text-white text-xl font-semibold animate__animated animate__fadeIn">
    <span className="text-green-400 text-center text-lg">+25%</span>
    <p className="text-xs text-center">Market Loading...</p>
  </div>
</div>
      </div>
    );
  }
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg w-[80%] max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Oops! Something went wrong.</h2>
        <p className="text-lg mb-4">Error: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Stock Dashboard</h1>
      <div className="flex flex-wrap justify-between gap-8">
        {symbols.map((symbol) => (
          <div key={symbol} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
            <div className="text-center p-4 border rounded-lg shadow-lg bg-gray-800 text-white">
              <h2 className="text-xl font-bold">{symbol} Stock</h2>
              <p><strong>Stock Name:</strong> {data[symbol]?.name || 'N/A'}</p>
              <p><strong>Ticker:</strong> {data[symbol]?.ticker || 'N/A'}</p>
              <Link to={`/stock/${symbol}`} className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block">Explore</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StockChart = ({ stockName, symbol, currentPrice, openPrice, highPrice, lowPrice, previousClose }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    setChartData({
      labels: ['Current Price', 'Open Price', 'High Price', 'Low Price', 'Previous Close'],
      datasets: [{
        label: `${stockName} (${symbol}) Prices`,
        data: [currentPrice, openPrice, highPrice, lowPrice, previousClose],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      }],
    });
  }, [stockName, symbol, currentPrice, openPrice, highPrice, lowPrice, previousClose]);

  return chartData ? (
    <div className="mt-8 bg-white p-4 rounded-lg shadow-md mx-auto w-full sm:w-3/4 lg:w-[50rem] h-[26rem]">
      <Line data={chartData} />
    </div>
  ) : <div>Loading chart...</div>;
};

const StockDetail = ({ holdings, setHoldings }) => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBuying, setIsBuying] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`http://localhost:8285/api/stock-data?symbol=${symbol}`);
        setStockData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    })();
  }, [symbol]);

  const handleTransaction = (action) => {
    if (action === 'buy') setIsBuying(true);
    else setShowPopup(true);
  };

  const handlePopup = (action) => {
    if (action === 'sell') {
      setHoldings((prev) => ({ ...prev, [symbol]: Math.max((prev[symbol] || 0) - 1, 0) }));
      navigate('/profile');
    }
    setShowPopup(false);
    setIsBuying(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8285/api/user/profile', {
        name: stockData.name,
        ticker: stockData.ticker,
        buyprice: stockData.currentPrice,
        quantity,
      });
      setHoldings((prev) => ({ ...prev, [symbol]: (prev[symbol] || 0) + parseInt(quantity) }));
      setIsBuying(false);
    } catch (err) {
      console.error('Error while purchasing stock:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">{symbol} Stock Details</h1>
      <div className="text-center p-4 border rounded-lg shadow-lg bg-gray-800 text-white">
        <p><strong>Stock Name:</strong> {stockData?.name || 'N/A'}</p>
        <p><strong>Ticker:</strong> {stockData?.ticker || 'N/A'}</p>
        <p><strong>Buy Price:</strong> $ {stockData?.currentPrice || 'N/A'}</p>

        {stockData && <StockChart {...stockData} />}

        {!isBuying && !showPopup && (
          <div className="flex justify-center gap-4 mt-4">
            {['Buy', 'Sell'].map((action) => (
              <button
                key={action}
                onClick={() => handleTransaction(action.toLowerCase())}
                className={`bg-${action === 'Buy' ? 'green' : 'red'}-500 text-white px-8 py-2 rounded hover:bg-${action === 'Buy' ? 'green' : 'red'}-600`}
                >
                {action}
              </button>
            ))}
          </div>
        )}
{(isBuying || showPopup) && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-[400px] relative">
      {/* Close button */}
      <button
        onClick={() => {
          setShowPopup(false);
          setIsBuying(false);
        }}
        className="absolute top-2 right-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-800 p-2 rounded-full"
        aria-label="Close"
      >
        ✖
      </button>
      
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {isBuying ? 'Enter Quantity' : 'Confirm Your Action'}
      </h2>
      
      {isBuying ? (
        <>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded text-black w-full mb-4"
            placeholder="Enter Quantity"
            min="1"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg w-full"
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <p className="text-lg mb-6">
            You will be redirected to the Profile Page. Are you sure?
          </p>
          <button
            onClick={() => handlePopup('sell')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-lg mr-4"
          >
            Confirm
          </button>
          <button
            onClick={() => handlePopup('cancel')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-lg"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

const App = () => {
  const [holdings, setHoldings] = useState({});
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile holdings={holdings} />} />
        <Route path="/stock/:symbol" element={<StockDetail holdings={holdings} setHoldings={setHoldings} />} />
      </Routes>
    </Router>
  );
};

export default App;
