import React, { useState, useEffect } from "react";
import "../../styles/report.css";
import autoTable from "jspdf-autotable";
import MultiSelectDropdown from  "../../components/ui/MultiSelectDropDown";

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
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import Select from "react-select";
import { Button } from "../../components/ui/Button";
import { Search } from "lucide-react";

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
  });

  const [data, setData] = useState([]);
  const [graph, setGraph] = useState([]);
  const [summary, setSummary] = useState({ total_food: 0, people_count: 0 });

  const [drivers, setDrivers] = useState([]);
  const [spots, setSpots] = useState([]);

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
    const [d, s] = await Promise.all([
      getDrivers(),
      getHungerSpots(),
    ]);
    setDrivers(d);
    setSpots(s);
  };

  // ---------------- OPTIONS ----------------
  const driverOptions = drivers.map(d => ({
    label: d.name,
    value: d.id,
  }));

  const spotOptions = spots.map(s => ({
    label: s.spot_name,
    value: s.hunger_spot_id,
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
  const handleSearch = async () => {
    const payload = {
      ...filters,
      driver_ids: filters.driver_ids.length ? filters.driver_ids : null,
      hunger_spot_ids: filters.hunger_spot_ids.length ? filters.hunger_spot_ids : null,
      start_date: filters.start_date ? filters.start_date + "T00:00:00" : null,
      end_date: filters.end_date ? filters.end_date + "T23:59:59" : null,
    };

    const res = await getReport(payload);

    setSummary(res.summary);
    setData(res.grid);
    setGraph(res.graph);
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

  return (
    <div className="report-container">
      <div className="report-title">Operations Summary Report</div>

      {/* KPI */}
      <div className="summary-container">
        <div className="card">
          <div className="card-title">Picked Food</div>
          <div className="card-value text-[#f97316] font-bold">
            {summary.total_food}
          </div>
        </div>

        <div className="card">
          <div className="card-title">People Count</div>
          <div className="card-value text-[#f97316] font-bold">
            {summary.people_count}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="date"
          className="custom-date-input"
          value={filters.start_date}
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />

        <input
          type="date"
          className="custom-date-input"
          value={filters.end_date}
          onChange={(e) =>
            setFilters({ ...filters, end_date: e.target.value })
          }
        />

        {/* DRIVER MULTI */}
       <MultiSelectDropdown
  value={filters.driver_ids}
  onChange={(val) =>
    setFilters({ ...filters, driver_ids: val })
  }
  options={driverOptions}
  placeholder="Driver"
/>

        {/* SPOT MULTI */}
       <MultiSelectDropdown
  value={filters.hunger_spot_ids}
  onChange={(val) =>
    setFilters({ ...filters, hunger_spot_ids: val })
  }
  options={spotOptions}
  placeholder="Hunger Spot"
/>

        <Button onClick={handleSearch} variant="primary">
          <Search className="w-4 h-4" /> Search
        </Button>
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
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
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
              <th onClick={() => handleSort("hunger_spot_name")}>Spot</th>
              <th onClick={() => handleSort("driver_name")}>Driver</th>
              <th onClick={() => handleSort("status_name")}>Status</th>
              <th onClick={() => handleSort("feeding_count")}>Feed</th>
              <th onClick={() => handleSort("pickup_eta")}>Pickup</th>
              <th onClick={() => handleSort("delivery_by")}>Delivery</th>
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
  );
};

export default ReportScreen;