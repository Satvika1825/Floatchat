import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiVisualization } from "@/services/types";
import { BarChart3, Eye, Activity, Waves, TrendingUp } from "lucide-react";

interface VisualizationDialogProps {
  visualization: ApiVisualization;
  className?: string;
}

export const VisualizationDialog = ({ visualization, className = "" }: VisualizationDialogProps) => {
  const [open, setOpen] = useState(false);

  if (!visualization?.plots || visualization.plots.length === 0) {
    return null;
  }

  const getPlotIcon = (plotType: string) => {
    switch (plotType.toLowerCase()) {
      case 'temperature':
      case 'depth_profile':
        return <Activity className="w-4 h-4 text-red-500" />;
      case 'salinity':
        return <Waves className="w-4 h-4 text-blue-500" />;
      case 'ts_diagram':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatPlotType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Render actual Plotly visualization
  const renderPlot = (plot: any, index: number) => {
    const plotTitle = plot.title || formatPlotType(plot.type);
    const plotId = `plotly-${index}-${plot.type}`;

    // Mount Plotly chart when dialog opens
    useEffect(() => {
      if (open && typeof window !== 'undefined' && (window as any).Plotly && plot.data) {
        const Plotly = (window as any).Plotly;
        const data = plot.data;

        // Wait for DOM element to be available
        const timer = setTimeout(() => {
          const element = document.getElementById(plotId);
          if (element) {
            try {
              // Ensure layout fits container
              const layout = {
                ...data.layout,
                width: element.offsetWidth,
                height: 240,
                margin: { l: 50, r: 30, t: 30, b: 50 },
                autosize: false
              };

              Plotly.newPlot(plotId, data.data, layout, {
                responsive: false,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
              });
            } catch (error) {
              // Error handled silently
            }
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [open, plot.data, plotId]);

    return (
      <div key={`plot-${index}`} className="mb-3 border border-gray-200 rounded bg-white">
        <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPlotIcon(plot.type)}
            <span className="text-sm font-medium text-gray-800">{plotTitle}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{plot.type}</Badge>
        </div>

        <div className="p-3">
          {/* Plot container */}
          <div
            id={plotId}
            className="w-full h-64 bg-white border border-gray-200 rounded overflow-hidden"
            style={{
              minHeight: '256px',
              maxHeight: '256px',
              position: 'relative',
              isolation: 'isolate'
            }}
          ></div>

          {/* Compact reasoning - single line */}
          {plot.reasoning && (
            <div className="mt-2 px-2 py-1 bg-blue-50 border-l-2 border-blue-200 rounded text-xs text-blue-700">
              {plot.reasoning}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 ${className}`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Plots
          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
            {visualization.plots.length}
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Ocean Data Visualization
            <Badge variant="outline" className="ml-2">
              {visualization.metadata?.analysisType || 'Ocean Data'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Metadata */}
          {visualization.metadata && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profiles</span>
                <span className="text-sm font-semibold text-gray-800">
                  {visualization.metadata.profileIds?.join(', ') || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Plots</span>
                <span className="text-sm font-semibold text-gray-800">
                  {visualization.metadata.totalPlots || visualization.plots.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Analysis Type</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {visualization.metadata.analysisType || 'Ocean Data'}
                </span>
              </div>
            </div>
          )}

          {/* Plots */}
          <div className="space-y-4">
            {visualization.plots.map((plot, index) => renderPlot(plot, index))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              ARGO float data visualization
            </div>
            <div className="text-xs text-gray-400">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};