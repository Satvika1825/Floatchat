import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

import type {
    ApiQueryResponse,
    ApiVisualization,
} from "@/services/types"; // put your interfaces here

function TestPlot() {
    const [plots, setPlots] = useState<ApiVisualization["plots"]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // First get some real profile IDs from the database
                const profileRes = await fetch("http://localhost:3000/search_profiles", {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lat_min: -45.0,
                        lat_max: -40.0,
                        lon_min: 30.0,
                        lon_max: 40.0,
                        limit: 5
                    })
                });

                if (!profileRes.ok) throw new Error(`Profile search failed: ${profileRes.status}`);
                const profiles = await profileRes.json();
                // Console output removed

                if (!profiles || profiles.length === 0) {
                    throw new Error("No profiles found in the region");
                }

                // Use the first profile ID for plotting
                const profileId = profiles[0].profile_id;
                // Console output removed

                // Test FastAPI endpoint directly with correct format
                const res = await fetch("http://localhost:3000/plot_profiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        profile_ids: [profileId], // Use integer array as expected by FastAPI
                        plot_type: "temperature",
                        format: "json"
                    }),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const plotData = await res.json();
                // Console output removed

                // Convert FastAPI response to our expected format
                if (plotData && plotData.plot_json) {
                    // Parse the JSON string returned by FastAPI
                    const plotlyData = JSON.parse(plotData.plot_json);
                    // Console output removed
                    
                    setPlots([{
                        type: "temperature",
                        title: "Temperature Profile Test",
                        data: plotlyData.data, // Use the parsed plot data
                        reasoning: "Testing FastAPI endpoint directly"
                    }]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading plots…</div>;
    if (error) return <div>Error: {error}</div>;
    if (plots.length === 0) return <div>No plots available</div>;

    return (
        <div className="space-y-6">
            {plots.map((plot, idx) => (
                <div key={idx}>
                    <h2 className="text-lg font-bold mb-2">{plot.title}</h2>
                    <Plot
                        data={Array.isArray(plot.data) ? plot.data.map(trace => ({
                            ...trace,
                            mode: trace.mode || 'lines+markers',
                            type: trace.type || 'scatter'
                        })) : []}
                        layout={{
                            title: { text: plot.title },
                            showlegend: true,
                            xaxis: { title: { text: 'Value' } },
                            yaxis: { title: { text: 'Depth (m)' }, autorange: 'reversed' }
                        }}
                        style={{ width: "100%", height: "400px" }}
                        config={{ responsive: true }}
                    />
                    {plot.reasoning && (
                        <p className="text-sm text-gray-600 mt-2">{plot.reasoning}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default TestPlot;
