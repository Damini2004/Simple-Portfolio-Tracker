import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from "chart.js";

// Register the necessary components for the pie chart
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [stockData, setStockData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:8285/api/user/profile");
        setProfile(response.data);
        response.data.stocks.forEach((stock) => {
          fetchStockData(stock.ticker);
        });
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const fetchStockData = async (ticker) => {
    try {
      const apiKey = "ctp39k9r01qhpppjfce0ctp39k9r01qhpppjfceg"; // Replace with your API key
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`);
      const currentPrice = response.data.c; // Current price (close price)
      setStockData((prevData) => ({ ...prevData, [ticker]: { ...prevData[ticker], currentPrice } }));
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  const calculateReturn = (stock) => {
    const currentPrice = stockData[stock.ticker]?.currentPrice || 0;
    const purchaseValue = stock.quantity * stock.buyPrice;
    const currentValue = stock.quantity * currentPrice;
    return currentValue - purchaseValue; // Return difference between current and purchase value
  };

  const sortedStocks = profile?.stocks?.map((stock) => ({
    ...stock,
    return: calculateReturn(stock),
  })).sort((a, b) => b.return - a.return); // Sort stocks by descending return

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8285/api/user/profile/${selectedTicker}`);
      setProfile((prevProfile) => {
        const updatedStocks = prevProfile.stocks.filter((stock) => stock.ticker !== selectedTicker);
        return { ...prevProfile, stocks: updatedStocks };
      });
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting stock:", err);
    }
  };

  const handleUpdate = async () => {
    if (!newQuantity || isNaN(newQuantity)) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      await axios.put(`http://localhost:8285/api/stock/${selectedTicker}/${newQuantity}`);
      setSuccessMessage(newQuantity + " Stock Sell successfully!");

      setTimeout(() => {
        setSuccessMessage(""); // Clear success message after 3 seconds
        window.location.reload(); // Reload the page
      }, 3000);
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };

  const openDeleteModal = (ticker) => {
    setSelectedTicker(ticker);
    setShowModal(true);
  };

  const openUpdateModal = (ticker) => {
    setSelectedTicker(ticker);
    setShowUpdateModal(true);
    fetchStockData(ticker); // Fetch stock data when the modal is opened
  };

  const closeModals = () => {
    setShowModal(false);
    setShowUpdateModal(false);
    setSelectedTicker("");
    setNewQuantity("");
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-xl text-gray-800">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error.message}</div>;

  const totalPortfolioValue = profile?.stocks?.reduce((total, stock) => {
    return total + stock.quantity * stock.buyPrice;
  }, 0);

  // Calculate the distribution of each stock in the portfolio
  const portfolioDistribution = sortedStocks?.map((stock) => ({
    ticker: stock.ticker,
    percentage: ((stock.quantity * stockData[stock.ticker]?.currentPrice || 0) / totalPortfolioValue) * 100,
  }));

  // Data for the Pie Chart
  const pieData = {
    labels: portfolioDistribution?.map((stock) => stock.ticker),
    datasets: [
      {
        label: "Portfolio Distribution",
        data: portfolioDistribution?.map((stock) => stock.percentage),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-700 via-indigo-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* User Details */}
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-600 mb-8 hover:shadow-2xl transition-all">
          <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-4 animate__animated animate__fadeIn">
            User Profile
          </h1>
          <p className="mt-4 text-2xl text-center">
            <strong>Username:</strong> {profile?.username || "N/A"}
          </p>
          <p className="text-2xl text-center">
            <strong>Email:</strong> {profile?.email || "N/A"}
          </p>
        </div>

        {/* Total Portfolio Value */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-600 shadow-lg rounded-lg border border-green-800 mb-8 hover:shadow-2xl transition-all">
          <h2 className="text-2xl font-bold text-center text-white">Total Portfolio Value</h2>
          <p className="text-center text-3xl font-semibold mt-4 text-white">${totalPortfolioValue ? totalPortfolioValue.toFixed(2) : "0.00"}</p>
        </div>

        {/* Stock Holdings Table */}
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-600 mb-8 hover:shadow-2xl transition-all">
          <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">Top Stock Holdings</h2>
          {sortedStocks?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="border border-gray-700 px-4 py-2">Stock Name</th>
                    <th className="border border-gray-700 px-4 py-2">Ticker</th>
                    <th className="border border-gray-700 px-4 py-2">Quantity</th>
                    <th className="border border-gray-700 px-4 py-2">Buy Price</th>
                    <th className="border border-gray-700 px-4 py-2">Current Value</th>
                    <th className="border border-gray-700 px-4 py-2">Return</th>
                    <th className="border border-gray-700 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map((stock, index) => (
                    <tr
                      key={index}
                      className={`bg-gray-700 transition duration-200 ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}`}
                    >
                      <td className="border border-gray-700 px-4 py-2">{stock.name}</td>
                      <td className="border border-gray-700 px-4 py-2">{stock.ticker}</td>
                      <td className="border border-gray-700 px-4 py-2">{stock.quantity}</td>
                      <td className="border border-gray-700 px-4 py-2">${stock.buyPrice}</td>
                      <td className="border border-gray-700 px-4 py-2">
                        {stockData[stock.ticker]?.currentPrice ? 
                          `$${stockData[stock.ticker].currentPrice.toFixed(2)}` : 
                          "Loading..."}
                      </td>
                      <td className="border border-gray-700 px-4 py-2">
                        <span className={`${stock.return >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {stock.return >= 0 ? "+" : ""}${stock.return.toFixed(2)}
                        </span>
                      </td>
                      <td className="border border-gray-700 px-4 py-2 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(stock.ticker)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => openDeleteModal(stock.ticker)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No holdings available.</p>
          )}
        </div>

        {/* Portfolio Distribution (Pie Chart) */}
        <div className="p-6 bg-gray-800 shadow-lg rounded-lg border border-gray-600 mb-8 hover:shadow-2xl transition-all">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Portfolio Distribution</h2>
          {portfolioDistribution?.length > 0 ? (
            <div className="flex justify-center">
              <Pie data={pieData} options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                },
                maintainAspectRatio: false,
                animation: {
                  animateRotate: true,
                  duration: 1000,
                },
              }} height={250} />
            </div>
          ) : (
            <p className="text-center text-gray-500">No data available for portfolio distribution.</p>
          )}
        </div>

      </div>

      {/* Modals (Update & Delete) */}
      {/* Same as before */}
    </div>
  );
}

export default Profile;
