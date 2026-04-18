import React, { useState, useEffect } from "react";
import "../../styles/report.css";
import autoTable from "jspdf-autotable";
import MultiSelectDropdown from "../../components/ui/MultiSelectDropDown";

import {
  getReport,
  getDrivers,
  getHungerSpots,
  getVehicles,
  getDonors,
  getStatus,
} from "../../services/api/reportService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Button } from "../../components/ui/Button";
import { Search, Download, Loader2 } from "lucide-react";
import logo from "../../assets/NoFoodWaste_Logo_Orange.png";

const ReportScreen = () => {
  // ---------------- DEFAULT DATE ----------------
  const getDefaultDates = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const format = (d) => d.toISOString().split("T")[0];

    return {
      start_date: format(lastMonth),
      end_date: format(today),
    };
  };

  // ---------------- STATE ----------------
  const [filters, setFilters] = useState({
    ...getDefaultDates(),
    driver_ids: [],
    hunger_spot_ids: [],
    vehicle_ids: [],
  });

  const [data, setData] = useState([]);
  const [graph, setGraph] = useState([]);
  const [summary, setSummary] = useState({
    total_food: 0,
  opportunity_count: 0,
  people_fed: 0,
  });

  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [donors, setDonors] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  // ---------------- LOAD ----------------
  useEffect(() => {
    loadDropdowns();
    handleSearch();
  }, []);

  const loadDropdowns = async () => {
    const [d, s, v,dn,st] = await Promise.all([
      getDrivers(),
      getHungerSpots(),
      getVehicles(),
      getDonors(),
      getStatus(),
    ]);
    setDrivers(d);
    setSpots(s);
    setVehicles(v);
    setDonors(dn);
    setStatuses(st);

  };

  // ---------------- OPTIONS ----------------
  const driverOptions = drivers.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const spotOptions = spots.map((s) => ({
    label: s.spot_name,
    value: s.hunger_spot_id,
  }));

  const vehicleOptions = vehicles.map((v) => ({
    label: v.vehicle_no,
    value: v.vehicle_id,
  }));

    const donorOptions = donors.map((d) => ({
    label: d.donor_name,
    value: d.donor_id,
  }));

  const statusOptions = statuses.map((s) => ({
    label: s.status_name,
    value: s.status_id,
  }));

  // ---------------- SORT ----------------
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

    if (["feeding_count", "opportunity_id"].includes(sortConfig.key)) {
      valA = Number(valA);
      valB = Number(valB);
    }

    if (["pickup_eta", "delivery_by"].includes(sortConfig.key)) {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (!valA) return 1;
    if (!valB) return -1;

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;

    return 0;
  });

  // ---------------- API ----------------
  const handleSearch = async (overrideFilters) => {
    setLoading(true);
    const f = overrideFilters || filters;
    const payload = {
      ...f,
      driver_ids: f.driver_ids?.length ? f.driver_ids : null,
      hunger_spot_ids: f.hunger_spot_ids?.length ? f.hunger_spot_ids : null,
      vehicle_ids: f.vehicle_ids?.length ? f.vehicle_ids : null,
      start_date: f.start_date ? f.start_date + "T00:00:00" : null,
      end_date: f.end_date ? f.end_date + "T23:59:59" : null,
    };

    const res = await getReport(payload);

    setSummary(res.summary);
    setData(res.grid);
    setGraph(res.graph);
    setLoading(false);
  };

  // ---------------- DATE FORMAT ----------------
  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  // ---------------- PDF DOWNLOAD ----------------
 const downloadPDF = async () => {
  const pdf = new jsPDF("landscape");

// LOGO
pdf.addImage(logo, "PNG", 10, 10, 35, 15);

// DATE
const today = new Date().toLocaleDateString("en-IN");
pdf.setFontSize(10);
pdf.setTextColor(0, 0, 0);
pdf.setFont("helvetica", "normal");
pdf.text(`Report Date: ${today}`, 10, 30);

// ================= KPI SECTION =================

// Opportunity Count
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Opportunity Count:", 10, 40);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(249, 115, 22);
  pdf.text(String(summary.opportunity_count || 0), 55, 40);

  // Food Collected
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Food Collected:", 120, 40);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(249, 115, 22);
  pdf.text(String(summary.total_food || 0), 160, 40);

  // People Fed ✅ FIXED
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text("People Fed:", 220, 40);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(249, 115, 22);
  pdf.text(String(summary.people_fed || 0), 255, 40);
  // TABLE DATA
  const tableData = data.map((row) => [
    row.opportunity_id,
    row.donor_name,
    row.hunger_spot_name,
    row.driver_name,
    row.status_name,
    row.food_collected,
    row.feeding_count,
    formatDateTime(row.pickup_eta),
    formatDateTime(row.delivery_by),
    row.vehicle_no,
  ]);

  // ✅ ONLY ONE TABLE
  autoTable(pdf, {
    startY: 50,

    head: [[
      "ID",
      "Donor",
      "Spot",
      "Driver",
      "Status",
      "Food Collected",
      "People Fed",
      "Pickup",
      "Delivery",
      "Vehicle",
    ]],

    body: tableData,

    styles: {
      fontSize: 8,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [249, 115, 22],
      textColor: 255,
      fontStyle: "bold",
      overflow: "linebreak",
      minCellHeight: 10,
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    //  STATUS COLORS
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === "body") {
        const status = data.cell.raw;
        if (status === "Completed") data.cell.styles.textColor = [0, 128, 0];
        if (status === "Created") data.cell.styles.textColor = [249, 115, 22];
      }
    },

    columnStyles: {
      0: { cellWidth: 10 },           // ID
      1: { cellWidth: 30 },           // Donor
      2: { cellWidth: 30 },           // Spot
      3: { cellWidth: 28 },           // Driver
      4: { cellWidth: 20 },           // Status
      5: { cellWidth: 24 },           // Food Collected
      6: { cellWidth: 20 },           // People Fed
      7: { cellWidth: 36 },           // Pickup
      8: { cellWidth: 36 },           // Delivery
      9: { cellWidth: 22 },           // Vehicle
    },
  });

  // GRAPH
  const chart = document.querySelector(".recharts-wrapper");

  if (chart) {
    const canvas = await html2canvas(chart);
    const imgData = canvas.toDataURL("image/png");

    pdf.addPage();
    pdf.text("Graph", 10, 20);
    pdf.addImage(imgData, "PNG", 10, 30, 260, 120);
  }

  const fileDate = new Date().toISOString().split("T")[0];
  pdf.save(`NoFoodWaste_Report_${fileDate}.pdf`);
};
  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          Operations Summary Report
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Report of the food rescue operations conducted by NoFoodWaste team, including key metrics, trends, and insights.
        </p>
     </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="date"
          className="custom-date-input"
          value={filters.start_date}
          onChange={(e) => {
            const updated = { ...filters, start_date: e.target.value };
            setFilters(updated);
            handleSearch(updated);
          }}
        />

        <input
          type="date"
          className="custom-date-input"
          value={filters.end_date}
          onChange={(e) => {
            const updated = { ...filters, end_date: e.target.value };
            setFilters(updated);
            handleSearch(updated);
          }}
        />

        <MultiSelectDropdown
          value={filters.driver_ids}
          onChange={(val) =>
            setFilters({ ...filters, driver_ids: val })
          }
          options={driverOptions}
          placeholder="Driver"
        />

        <MultiSelectDropdown
          value={filters.hunger_spot_ids}
          onChange={(val) =>
            setFilters({ ...filters, hunger_spot_ids: val })
          }
          options={spotOptions}
          placeholder="Hunger Spot"
        />

        <MultiSelectDropdown
          value={filters.vehicle_ids}
          onChange={(val) =>
            setFilters({ ...filters, vehicle_ids: val })
          }
          options={vehicleOptions}
          placeholder="Vehicle"
        />

        <MultiSelectDropdown
          value={filters.donor_ids}
          onChange={(val) =>
            setFilters({ ...filters, donor_ids: val })
          }
          options={donorOptions}
          placeholder="Donor"
        />
        <MultiSelectDropdown
          value={filters.status_ids}
          onChange={(val) =>
            setFilters({ ...filters, status_ids: val })
          }
          options={statusOptions}
          placeholder="Status"
        />

        <Button onClick={handleSearch} variant="primary">
          <Search className="w-4 h-4" /> Search
        </Button>

        <Button onClick={downloadPDF}>
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center p-16 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : (
      <>
      {/* KPI */}
      <div className="summary-container">
        <div className="card">
          <div className="card-title">Opportunity Count</div>
          <div className="card-value text-[#f97316] font-bold">
          {summary.opportunity_count}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Food Collected</div>
          <div className="card-value text-[#f97316] font-bold">
            {summary.total_food} kg
          </div>
        </div>
        <div className="card">
          <div className="card-title">People Fed</div>
          <div className="card-value text-[#f97316] font-bold">
            {summary.people_fed} people
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div style={{ width: "100%", height: 300 }}>
        {graph && graph.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graph}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="feeding_count"
                stroke="#f97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            No graph data available
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("opportunity_id")}>ID</th>
              <th onClick={() => handleSort("donor_name")}>Donor</th>
              <th onClick={() => handleSort("hunger_spot_name")}>Hunger Spot</th>
              <th onClick={() => handleSort("driver_name")}>Driver</th>
              <th onClick={() => handleSort("status_name")}>Status</th>
              <th onClick={() => handleSort("food_collected")}>Food Collected</th>
              <th onClick={() => handleSort("feeding_count")}>People Fed</th>
              <th onClick={() => handleSort("pickup_eta")}>Pickup</th>
              <th onClick={() => handleSort("delivery_by")}>Delivery</th>
              <th>Vehicle</th>
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
                <td>{row.food_collected} kg</td>
                <td>{row.feeding_count}</td>
                <td>{formatDateTime(row.pickup_eta)}</td>
                <td>{formatDateTime(row.delivery_by)}</td>
                <td>{row.vehicle_no}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};

export default ReportScreen;
