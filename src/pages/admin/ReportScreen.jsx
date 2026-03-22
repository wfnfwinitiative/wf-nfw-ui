import React, { useState } from "react";
import { getReport } from "../../services/reportService";
import "../../styles/report.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReportScreen = () => {
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    driver_id: "",
    hunger_spot_id: "",
    status_id: ""
  });

  const [summary, setSummary] = useState({
    total_food: 0,
    people_count: 0
  });

  const [data, setData] = useState([]);
  const [graph, setGraph] = useState([]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    const payload = {
      ...filters,
      driver_id: filters.driver_id || null,
      hunger_spot_id: filters.hunger_spot_id || null,
      status_id: filters.status_id || null,
      start_date: filters.start_date ? filters.start_date + "T00:00:00" : null,
      end_date: filters.end_date ? filters.end_date + "T23:59:59" : null,
    };

    const res = await getReport(payload);

    setSummary(res.summary);
    setData(res.grid);
    setGraph(res.graph);
  };

  const downloadPDF = async () => {
    const element = document.getElementById("reportSection");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 100);
    pdf.save("report.pdf");
  };

  return (
    <div className="report-container">
      <div className="report-title">Admin Report</div>

      {/* KPI Cards */}
      <div className="summary-container">
        <div className="card">
          <div className="card-title">Picked Food</div>
          <div className="card-value">{summary.total_food}</div>
        </div>

        <div className="card">
          <div className="card-title">People Count</div>
          <div className="card-value">{summary.people_count}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input type="date" name="start_date" onChange={handleChange} />
        <input type="date" name="end_date" onChange={handleChange} />

        <input placeholder="Driver ID" name="driver_id" onChange={handleChange} />
        <input placeholder="Hunger Spot ID" name="hunger_spot_id" onChange={handleChange} />
        <input placeholder="Status ID" name="status_id" onChange={handleChange} />

        <button className="button" onClick={handleSearch}>
          Search
        </button>

        <button className="button" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      {/* Report Section */}
      <div id="reportSection">

        {/* Graph */}
        <LineChart width={700} height={300} data={graph}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="feeding_count" stroke="#0078d4" />
        </LineChart>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Hunger Spot</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Feeding</th>
                <th>Pickup</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.opportunity_id}>
                  <td>{row.opportunity_id}</td>
                  <td>{row.donor_name}</td>
                  <td>{row.hunger_spot_name}</td>
                  <td>{row.driver_name}</td>
                  <td>{row.status_name}</td>
                  <td>{row.feeding_count}</td>
                  <td>{row.pickup_eta}</td>
                  <td>{row.delivery_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ReportScreen;