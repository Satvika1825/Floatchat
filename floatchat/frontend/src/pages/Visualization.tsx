import React, { useState } from "react";

// Filter controls component
const VisualizationFilters = ({
  parameter,
  setParameter,
  region,
  setRegion,
  time,
  setTime,
  chartType,
  setChartType,
  onShow,
}: {
  parameter: string;
  setParameter: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  chartType: string;
  setChartType: (v: string) => void;
  onShow: () => void;
}) => {
  const parameters = ["Temperature", "Salinity", "Currents"];
  const regions = [
    "Atlantic Ocean",
    "Pacific Ocean",
    "Indian Ocean",
    "Arctic Ocean",
    "Southern Ocean",
    "Mediterranean Sea",
    "Gulf of Mexico",
  ];
  const times = [
    "Last 7 days",
    "Last 30 days",
    "Last year",
    "Custom",
  ];
  const chartTypes = ["Line", "Bar", "Map", "Heatmap"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div>
        <label className="font-semibold block mb-1">Parameter</label>
        <select
          value={parameter}
          onChange={e => setParameter(e.target.value)}
          className="border p-2 rounded shadow w-full"
        >
          <option value="">Select</option>
          {parameters.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold block mb-1">Region</label>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="border p-2 rounded shadow w-full"
        >
          <option value="">Select</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {/* Map picker placeholder */}
        <div className="mt-2 text-xs text-gray-500">[Map Picker Coming Soon]</div>
      </div>
      <div>
        <label className="font-semibold block mb-1">Time Range</label>
        <select
          value={time}
          onChange={e => setTime(e.target.value)}
          className="border p-2 rounded shadow w-full"
        >
          <option value="">Select</option>
          {times.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {/* Slider placeholder */}
        <div className="mt-2 text-xs text-gray-500">[Slider Coming Soon]</div>
      </div>
      <div>
        <label className="font-semibold block mb-1">Chart Type</label>
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="border p-2 rounded shadow w-full"
        >
          <option value="">Select</option>
          {chartTypes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={onShow}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 w-full font-semibold"
        >
          Show
        </button>
      </div>
    </div>
  );
};

const QuickStartCard = ({
  title,
  emoji,
  onClick,
}: {
  title: string;
  emoji: string;
  onClick: () => void;
}) => (
  <button
    className="flex items-center gap-2 bg-white hover:bg-blue-50 transition rounded-lg shadow px-4 py-3 mb-2 w-full text-left font-semibold text-lg"
    onClick={onClick}
  >
    <span className="text-2xl">{emoji}</span>
    <span>{title}</span>
  </button>
);

const Visualization: React.FC = () => {
  const [parameter, setParameter] = useState("");
  const [region, setRegion] = useState("");
  const [time, setTime] = useState("");
  const [chartType, setChartType] = useState("");
  const [showChart, setShowChart] = useState(false);

  // Quick start handlers (just set filters for demo)
  const handleQuickStart = (p: string, r: string, t: string, c: string) => {
    setParameter(p);
    setRegion(r);
    setTime(t);
    setChartType(c);
    setShowChart(true);
  };

  const handleShow = () => setShowChart(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-8 w-full">
      {/* Header */}
      <div className=" w-full mb-8 flex flex-col items-center text-center">
        <h2 className="text-5xl font-extrabold mb-2 text-blue-900 p-4">Visualizations</h2>
        <h3 className="text-xl text-gray-600 font-semibold mb-2">
          Transform complex ocean measurements into clear, interactive visuals.
        </h3>
        <h4 className="text-lg text-gray-600 mb-4">
          See temperature trends, salinity profiles, and float positions — all generated instantly from your queries.
        </h4>
      </div>

      {/* Explore Insights */}
      <div className="max-w-4xl mx-auto w-full rounded-xl shadow mb-12 p-4 flex flex-col items-center text-center" style={{ background: "#10679eff" }}>
        <h1 className="text-2xl font-extrabold mb-2 text-white p-4">🌊 Explore Insights Visually</h1>
        <h4 className="text-lg text-white mb-2">
          Understanding the ocean is easier when you can see the patterns.
        </h4>
        <h6 className="text-lg text-white p-2">
          FloatChat turns raw ARGO data into dynamic charts & maps that make trends clear at a glance.
        </h6>
      </div>

      {/* Quick Start Examples */}
      <div className="w-full mb-8">
        <h3 className="text-xl font-bold mb-2 text-blue-600">Quick Start Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickStartCard
            emoji="🌡"
            title="Global Temperature Trends (Last 30 Days)"
            onClick={() => handleQuickStart("Temperature", "Global", "Last 30 days", "Line")}
          />
          <QuickStartCard
            emoji="🧂"
            title="Salinity Profiles in the Pacific Ocean"
            onClick={() => handleQuickStart("Salinity", "Pacific Ocean", "Last year", "Bar")}
          />
          <QuickStartCard
            emoji="🌍"
            title="Real-Time ARGO Float Map"
            onClick={() => handleQuickStart("Float Positions", "Global", "Last 7 days", "Map")}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="w-full mb-8">
        <h3 className="text-xl font-bold mb-4 text-blue-600">🔍 Choose What to Explore</h3>
        <VisualizationFilters
          parameter={parameter}
          setParameter={setParameter}
          region={region}
          setRegion={setRegion}
          time={time}
          setTime={setTime}
          chartType={chartType}
          setChartType={setChartType}
          onShow={handleShow}
        />
      </div>

      {/* Chart Card */}
      <div className="w-full mb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center min-h-[400px]">
          {/* Chart Placeholder */}
          <div className="flex items-center justify-center w-full h-64 bg-blue-50 rounded mb-6">
            {showChart ? (
              <span className="text-[#0077b6] font-medium text-lg font-bold">
                [Chart will render here: {parameter || "Parameter"} | {region || "Region"} | {time || "Time"} | {chartType || "Chart Type"}]
              </span>
            ) : (
              <span className="text-gray-600 text-lg font-semibold">
                Select filters and click "Show" to view visualization.
              </span>
            )}
          </div>

          {/* Download/Export Buttons */}
          <div className="w-full flex flex-col md:flex-row justify-end gap-2 mb-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold">
              Download High-Resolution Chart
            </button>
            <button className="bg-cyan-600 text-white px-4 py-2 rounded shadow hover:bg-cyan-700 font-semibold">
              Export Data (CSV / JSON)
            </button>
          </div>
          {/* Tips */}
          <div className="w-full mt-4 text-md text-gray-600">
            <strong>💡 Tip:</strong> Try asking questions like:<br />
            <span className="italic">“Show me temperature changes in the Indian Ocean over the last year”</span><br />
            <span className="italic">“Compare salinity between Atlantic and Pacific at 500m depth.”</span>
          </div>
          {/* Data Source & References */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-gray-500">
            <span>Data source: ARGO floats | Last updated: --</span>
            <span>
              References:{" "}
              <a
                href="https://argo.ucsd.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 underline ml-1"
              >
                ARGO Project
              </a>
            </span>
            <button className="text-cyan-600 underline mt-2 md:mt-0 font-semibold">Report an issue</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
