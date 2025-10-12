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
      .then(({ data }) => {
        setBook(data ?? {});
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert("An error happened. Please Chack console");
        console.log(error);
      });
  }, []);

  const handleInputChange = ({ target: { name, value } }) => {
    setBook((prev) => ({
      ...(prev ?? {}),
      [name]: value ?? "",
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!book) return;
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
        enqueueSnackbar("Booking Edited successfully", { variant: "success" });
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("Error", { variant: "error" });
        console.log(error);
      });
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
            type="text"
            name="Email"
            value={book?.Email ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Pickup Date</label>
          <input
            type="text"
            name="pickupdate"
            value={book?.pickupdate ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Pickup Time</label>
          <input
            type="text"
            name="pickuptime"
            value={book?.pickuptime ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Dropoff Date</label>
          <input
            type="text"
            name="dropoffdate"
            value={book?.dropoffdate ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-black-500">Dropoff Time</label>
          <input
            type="text"
            name="dropofftime"
            value={book?.dropofftime ?? ""}
            onChange={handleInputChange}
            className="border-2 border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          className="px-4 py-2 bg-orange-600 rounded-lg text-white font-bold hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-none m-8 "
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditBook;
