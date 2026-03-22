import React, { useState, useEffect } from "react";
import "../../styles/report.css";
import autoTable from "jspdf-autotable";
import {
  getReport,
  getDrivers,
  getHungerSpots,
} from "../../services/api/reportService";

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

import { SortDropdown } from "../../components/ui/SortDropdown";
import { Button } from "../../components/ui/Button";
import { Search, Download } from "lucide-react";
import logo from "../../assets/NoFoodWaste_Logo_Orange.png";

const ReportScreen = () => {

  // ✅ Default Date Logic
  const getDefaultDates = () => {
    const today = new Date();
    const lastMonth = new Date();

    lastMonth.setMonth(today.getMonth() - 1);

    const format = (date) => date.toISOString().split("T")[0];

    return {
      start_date: format(lastMonth),
      end_date: format(today),
    };
  };

const [sortConfig, setSortConfig] = useState({
  key: "",
  direction: "asc",
});
  const [filters, setFilters] = useState({
    ...getDefaultDates(),
    driver_id: "",
    hunger_spot_id: "",
    status_id: "",
  });

  const [summary, setSummary] = useState({
    total_food: 0,
    people_count: 0,
  });

  const [data, setData] = useState([]);
  const [graph, setGraph] = useState([]);

  const [drivers, setDrivers] = useState([]);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    loadDropdowns();
    handleSearch(); // ✅ auto load with default dates
  }, []);

  const loadDropdowns = async () => {
    try {
      const [d, s] = await Promise.all([
        getDrivers(),
        getHungerSpots(),
      ]);

      setDrivers(d);
      setSpots(s);
    } catch (err) {
      console.error("Dropdown error:", err);
    }
  };

  
  const driverOptions = drivers.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const spotOptions = spots.map((s) => ({
    label: s.spot_name,
    value: s.hunger_spot_id,
  }));
const handleSort = (key) => {
  let direction = "asc";

  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }

  setSortConfig({ key, direction });
};
const sortedData = [...data].sort((a, b) => {
  if (!sortConfig.key) return 0;

  let valA = a[sortConfig.key];
  let valB = b[sortConfig.key];

  // numbers
  if (
    sortConfig.key === "feeding_count" ||
    sortConfig.key === "opportunity_id"
  ) {
    valA = Number(valA);
    valB = Number(valB);
  }

  // dates
  if (
    sortConfig.key === "pickup_eta" ||
    sortConfig.key === "delivery_by"
  ) {
    valA = new Date(valA);
    valB = new Date(valB);
  }

  if (!valA) return 1;
  if (!valB) return -1;

  if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
  if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;

  return 0;
});
  const handleSearch = async () => {
    const payload = {
      ...filters,
      driver_id: filters.driver_id || null,
      hunger_spot_id: filters.hunger_spot_id || null,
      status_id: filters.status_id || null,
      start_date: filters.start_date
        ? filters.start_date + "T00:00:00"
        : null,
      end_date: filters.end_date
        ? filters.end_date + "T23:59:59"
        : null,
    };

    try {
      const res = await getReport(payload);
      setSummary(res.summary);
      setData(res.grid);
      setGraph(res.graph);
    } catch (err) {
      console.error("Report error:", err);
    }
  };
const formatDateTime = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};





const downloadPDF = async () => {
  const pdf = new jsPDF();

  // ---------------- HEADER ----------------
  pdf.addImage(logo, "PNG", 10, 10, 35, 15);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("No Food Waste", 50, 18);

  const today = new Date().toLocaleDateString("en-IN");
  pdf.setFontSize(10);
  pdf.text(`Report Date: ${today}`, 10, 30);

  // ---------------- KPI ----------------
  pdf.setFontSize(12);

  // Picked Food label
  pdf.setTextColor(0, 0, 0);
  pdf.text("Picked Food: ", 10, 40);

  // Picked Food value (ORANGE + BOLD)
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(249, 115, 22);
  pdf.setFontSize(14);
  pdf.text(String(summary.total_food), 45, 40);

  // Reset font
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);

  // People Count label
  pdf.text("People Count: ", 120, 40);

  // People Count value (ORANGE + BOLD)
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(249, 115, 22);
  pdf.setFontSize(14);
  pdf.text(String(summary.people_count), 165, 40);

  // Reset font
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);

  // ---------------- TABLE ----------------
  const tableData = data.map((row) => [
    row.opportunity_id,
    row.donor_name,
    row.hunger_spot_name,
    row.driver_name,
    row.status_name,
    row.feeding_count,
  ]);

  autoTable(pdf, {
    startY: 50,
    head: [["ID", "Donor", "Spot", "Driver", "Status", "Feed"]],
    body: tableData,

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [249, 115, 22], // orange
      textColor: 255,
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    
    didParseCell: (dataCell) => {
      if (dataCell.column.index === 4) {
        if (dataCell.cell.raw === "Completed") {
          dataCell.cell.styles.textColor = [0, 150, 0];
        }
        if (dataCell.cell.raw === "Created") {
          dataCell.cell.styles.textColor = [255, 140, 0];
        }
      }
    },
  });

  // ---------------- GRAPH ----------------
  const chart = document.querySelector(".recharts-wrapper");
  const canvas = await html2canvas(chart);
  const imgData = canvas.toDataURL("image/png");

  pdf.addPage();

  pdf.setFontSize(14);
  pdf.text("Graph", 10, 20);

  pdf.addImage(imgData, "PNG", 10, 30, 180, 100);

  // ---------------- SAVE ----------------
 const date = new Date();
const formattedDate = date.toISOString().split("T")[0]; 

pdf.save(`NoFoodWaste_Report_${formattedDate}.pdf`);
};
  return (
    <div className="report-container">
      <div className="report-title">Operations Summary Report</div>

      {/* KPI */}
      <div className="summary-container">
        <div className="card">
          <div className="card-title">Picked Food</div>
          <div className="card-value text-orange-500 font-bold">{summary.total_food}</div>
        </div>

        <div className="card">
          <div className="card-title">People Count</div>
          <div className="card-value text-orange-500 font-bold">{summary.people_count}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-6">

        {/* Date From */}
        <input
          type="date"
          className="custom-date-input"
          value={filters.start_date}
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />

        {/* Date To */}
        <input
          type="date"
          className="custom-date-input"
          value={filters.end_date}
          onChange={(e) =>
            setFilters({ ...filters, end_date: e.target.value })
          }
        />

        {/* Driver */}
        <SortDropdown
          value={filters.driver_id}
          onChange={(val) =>
            setFilters({ ...filters, driver_id: val })
          }
          options={driverOptions}
          placeholder="Driver"
        />

        {/* Hunger Spot */}
        <SortDropdown
          value={filters.hunger_spot_id}
          onChange={(val) =>
            setFilters({ ...filters, hunger_spot_id: val })
          }
          options={spotOptions}
          placeholder="Hunger Spot"
        />

        {/* Search */}
        <Button onClick={handleSearch} variant="primary">
          <Search className="w-4 h-4" />
          Search
        </Button>

        {/* Download */}
        <Button onClick={downloadPDF} variant="secondary">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {/* Report */}
      <div id="reportSection">
        <LineChart width={700} height={300} data={graph}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="feeding_count" stroke="#0078d4" />
        </LineChart>

        <div className="table-container">
          <table>
            <thead>
  <tr>
    <th onClick={() => handleSort("opportunity_id")}>
      ID {sortConfig.key === "opportunity_id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("donor_name")}>
      Donor {sortConfig.key === "donor_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("hunger_spot_name")}>
      Hunger Spot {sortConfig.key === "hunger_spot_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("driver_name")}>
      Driver {sortConfig.key === "driver_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("status_name")}>
      Status {sortConfig.key === "status_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("feeding_count")}>
      Feeding {sortConfig.key === "feeding_count" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("pickup_eta")}>
      Pickup {sortConfig.key === "pickup_eta" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>

    <th onClick={() => handleSort("delivery_by")}>
      Delivery {sortConfig.key === "delivery_by" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
    </th>
  </tr>
</thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.opportunity_id}>
                  <td>{row.opportunity_id}</td>
                  <td>{row.donor_name}</td>
                  <td>{row.hunger_spot_name}</td>
                  <td>{row.driver_name}</td>
                  <td>{row.status_name}</td>
                  <td>{row.feeding_count}</td>
                 <td>{formatDateTime(row.pickup_eta)}</td>
                <td>{formatDateTime(row.delivery_by)}</td>
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