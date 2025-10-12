import React, { useState, useEffect } from "react";
import BackButton from "../../components/BackButtonSahan";
import Spinner from "../../components/SpinnerSahan";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const BASE_URL = (RAW_BASE || "").replace(/\/$/, "");

const EditBook = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/books/${id}`)
      .then((response) => {
        // Ensure all values are strings to prevent controlled/uncontrolled switch
        setCustomerName(response.data.customerName || "");
        setIdNumber(response.data.idNumber || "");
        setAddress(response.data.address || "");
        setMobileNumber(response.data.mobileNumber || "");
        setEmail(response.data.email || "");
        setPickupDate(response.data.pickupDate || "");
        setPickupTime(response.data.pickupTime || "");
        setDropoffDate(response.data.dropoffDate || "");
        setDropoffTime(response.data.dropoffTime || "");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("Failed to load booking details", { variant: "error" });
        console.log(error);
      });
  }, [id]); // Add id as dependency

  const validateForm = () => {
    // Basic validation for required fields
    if (!customerName) {
      enqueueSnackbar("Customer name is required", { variant: "error" });
      return false;
    }
    if (!idNumber) {
      enqueueSnackbar("ID number is required", { variant: "error" });
      return false;
    }
    if (!email) {
      enqueueSnackbar("Email is required", { variant: "error" });
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      enqueueSnackbar("Please enter a valid email address", { variant: "error" });
      return false;
    }
    if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
      enqueueSnackbar("All date and time fields are required", { variant: "error" });
      return false;
    }
    return true;
  };

  const handleEditBook = () => {
    if (!validateForm()) {
      return;
    }

    // Format data properly for API
    const data = {
      customerName,
      idNumber,
      address,
      mobileNumber,
      email,
      // Ensure dates are in ISO format (YYYY-MM-DD)
      pickupDate: formatDateForAPI(pickupDate),
      pickupTime,
      dropoffDate: formatDateForAPI(dropoffDate),
      dropoffTime,
    };

    console.log("Sending data to API:", data); // Log data being sent for debugging
    
    setLoading(true);
    const payload = {
      ...book,
      Customername: (book.Customername ?? "").trim(),
      Idnumber: (book.Idnumber ?? "").trim(),
      Address: (book.Address ?? "").trim(),
      mobilenumber: (book.mobilenumber ?? "").trim(),
      Email: (book.Email ?? "").trim(),
    };
    axios
      .put(`${BASE_URL}/books/${id}`, payload)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Booking updated successfully", { variant: "success" });
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        // Log detailed error information
        console.log("API Error Response:", error.response?.data);
        console.log("Full Error Object:", error);
        
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            "Failed to update booking. Please check all fields.";
        enqueueSnackbar(errorMessage, { variant: "error" });
      });
  };

  // Helper function to format dates properly
  const formatDateForAPI = (dateString) => {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    try {
      // Try to parse and format the date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If date is invalid, return original string
        return dateString;
      }
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4 text-center font-bold text-black-800 ">
        Edit My Bookings
      </h1>
      {loading ? <Spinner /> : ""}
      <div className="flex flex-col border-2 border-orange-400 rounded-xl w-full max-w-[600px] p-10 mx-auto">
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Name</label>
          <input
            type="text"
            name="Customername"
            value={book?.Customername ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">ID Number</label>
          <input
            type="text"
            name="Idnumber"
            value={book?.Idnumber ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Address</label>
          <input
            type="text"
            name="Address"
            value={book?.Address ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Mobile Number</label>
          <input
            type="text"
            name="mobilenumber"
            value={book?.mobilenumber ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Email</label>
          <input
            type="email" // Changed to email type for better validation
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Pickup Date</label>
          <input
            type="date" // Changed to date type
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Pickup Time</label>
          <input
            type="time" // Changed to time type
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Dropoff Date</label>
          <input
            type="date" // Changed to date type
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Dropoff Time</label>
          <input
            type="time" // Changed to time type
            value={dropoffTime}
            onChange={(e) => setDropoffTime(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        
        {/* Add form element to enable HTML form validation */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditBook();
        }}>
          {/* Replace the button with a submit button */}
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 rounded-lg text-white font-bold hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-none m-8"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
