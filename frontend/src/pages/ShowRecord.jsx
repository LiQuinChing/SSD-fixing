import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import { saveAs } from "file-saver";
import vmaintain from "../images/vmaintain.png";
import { formatSafeDateTime } from "../utils/dateUtils";

const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const BASE_URL = (RAW_BASE || "").replace(/\/$/, "");

const ShowRecord = () => {
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/records/${id}`)
      .then((response) => {
        setRecord(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [id]);

  const generateReport = () => {
    const reportData = `
      Record Id: ${record._id}
      Maintenance Type: ${record.Maintaintype}
      Vehicle Id: ${record.VehicleID}
      Date: ${record.Date}
      Mileage: ${record.Milage}
      Description: ${record.Description}
      Create Time: ${formatSafeDateTime(record.createdAt)}
      Last Update Time: ${formatSafeDateTime(record.updatedAt)}
    `;
    const blob = new Blob([reportData], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "record_report.txt");
  };

  return (
    <div
      className="bg-cover bg-center"
      style={{
        backgroundImage: `url(${vmaintain})`,
      }}
    >
      <div className="p-4">
        <BackButton />
        <h1 className="text-3xl my-4">Show Record</h1>
        {loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col border-2 border-sky-400 rounded-*1 w-fit p-4 bg-white bg-opacity-70 rounded-lg">
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Record Id</span>
              <span>{record._id}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">
                Maintenance Type
              </span>
              <span>{record.Maintaintype}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Vehicle Id</span>
              <span>{record.VehicleID}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Date</span>
              <span>{record.Date}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Milage</span>
              <span>{record.Milage}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Description</span>
              <span>{record.Description}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">Create Time</span>
              <span>{formatSafeDateTime(record.createdAt)}</span>
            </div>
            <div className="my-4">
              <span className="text-xl mr-4 text-gray-500">
                Last Update Time
              </span>
              <span>{formatSafeDateTime(record.updatedAt)}</span>
            </div>
            <div className="flex flex-col border-2 bg-orange-500 hover:bg-orange-600 rounded-*1 w-fit p-4 rounded-lg">
              <button onClick={generateReport}>Download Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowRecord;