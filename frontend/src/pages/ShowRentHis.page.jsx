import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BackButtonV from "../components/BackButtonV";
import Spinner from "../components/Spinner";
import jsPDF from "jspdf";
import bgRentHis from "../images/bgRentHis.jpg";
import { formatSafeDate, formatSafeDateTime } from "../utils/dateUtils";

const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const BASE_URL = (RAW_BASE || "").replace(/\/$/, "");

const ShowRentHisPage = () => {
  const [rent, setRentHis] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/rents/${id}`)
      .then((response) => {
        setRentHis(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [id]);

  const handleGenerateReport = (rent) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Rent Details for ID: ${rent._id}`, 20, 20);

    let currentY = 35;
    doc.setFontSize(12);

    doc.text(`Name: ${rent.name}`, 20, currentY);
    currentY += 8;
    doc.text(`Vehicle Model: ${rent.vehicle}`, 20, currentY);
    currentY += 8;
    doc.text(`Rent Date: ${rent.rentDate}`, 20, currentY);
    currentY += 8;
    doc.text(`Return Date: ${rent.returnDate}`, 20, currentY);
    currentY += 8;
    doc.text(`Mileage: ${rent.mileage} km`, 20, currentY);
    currentY += 8;
    doc.text(`Rent Amount: Rs ${rent.amount}`, 20, currentY);
    currentY += 8;
    doc.text(`Create Time: ${formatSafeDate(rent.createdAt)}`, 20, currentY);
    currentY += 8;
    doc.text(`Last Update Time: ${formatSafeDate(rent.updatedAt)}`, 20, currentY);

    doc.setFontSize(10);
    doc.text(
      `Report generated on: ${formatSafeDateTime(new Date())}`,
      20,
      doc.internal.pageSize.height - 15
    );

    doc.save(`rent_report_${rent._id}.pdf`);
  };

  return (
    <div
      className="bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgRentHis})`,
      }}
    >
      <div className="px-20 py-8">
        <BackButtonV />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl my-4">Show Rent</h1>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mr-4"
            onClick={() => handleGenerateReport(rent)}
          >
            Generate Report
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4 bg-white">
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">No</span>
              <span>{rent._id}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Name</span>
              <span>{rent.name}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Vehicle Model</span>
              <span>{rent.vehicle}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Rent Date</span>
              <span>{rent.rentDate}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Return Date</span>
              <span>{rent.returnDate}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Mileage </span>
              <span>{rent.mileage} km</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Rental Charges</span>
              <span>Rs {rent.amount}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Create Time</span>
              <span>{formatSafeDateTime(rent.createdAt)}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">
                Last Update Time
              </span>
              <span>{formatSafeDateTime(rent.updatedAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowRentHisPage;