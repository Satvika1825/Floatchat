// ApiDataVisualization Component
// Handles visualization of data returned from FloatChat API responses

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiVisualization, ApiProfile } from '@/services/types';
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  Waves,
  Activity
} from "lucide-react";

interface ApiDataVisualizationProps {
  visualization: ApiVisualization;
  className?: string;
}

export const ApiDataVisualization = ({ visualization, className = "" }: ApiDataVisualizationProps) => {
  const [expandedPlots, setExpandedPlots] = useState<Set<number>>(new Set([0])); // First plot expanded by default

  const togglePlot = (index: number) => {
    const newExpanded = new Set(expandedPlots);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPlots(newExpanded);
  };

  const getPlotIcon = (plotType: string) => {
    switch (plotType.toLowerCase()) {
      case 'temperature':
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

  // Render Plotly visualization
  const renderPlotlyVisualization = (plotData: unknown, title: string, plotType: string) => {
    try {
      // Create a container for Plotly
      const plotId = `plotly-${plotType}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Mount Plotly chart after component renders
      React.useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).Plotly) {
          const Plotly = (window as any).Plotly as {
            newPlot: (id: string, data: unknown, layout: unknown, config: unknown) => void;
          };
          const data = plotData as { data: unknown; layout: unknown };
          Plotly.newPlot(plotId, data.data, data.layout, {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          });
        }
      }, [plotData, plotId]);

      return (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground font-medium">
            {title}
          </div>
          <div 
            id={plotId} 
            className="w-full h-96 bg-background border rounded-lg p-2"
            style={{ minHeight: '400px' }}
          />
        </div>
      );
    } catch (error) {
      // Console output removed
      return (
        <div className="text-center py-8 text-red-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Error loading visualization</p>
        </div>
      );
    }
  };

  // Fallback for when Plotly data isn't available
  const renderDataSummary = (_plotData: unknown, title: string) => {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground font-medium">
          {title}
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-center text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            Data visualization available
            <div className="text-xs mt-1 opacity-75">
              Interactive plot will load when Plotly library is available
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!visualization?.plots || visualization.plots.length === 0) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-br from-card to-muted/20 border-border/60 shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            Data Visualization
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {visualization.metadata.totalPlots} plot{visualization.metadata.totalPlots !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Analysis Type and Profile Info */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-muted-foreground">Analysis:</span>
            <span className="text-foreground capitalize">{visualization.metadata.analysisType}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-muted-foreground">Profiles:</span>
            <span className="text-foreground">{visualization.metadata.profileIds.join(', ')}</span>
          </div>
        </div>

        {/* Plot Visualizations */}
        <div className="space-y-3">
          {visualization.plots.map((plot, index) => {
            const isExpanded = expandedPlots.has(index);
            return (
              <div key={index} className="border border-border/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePlot(index)}
                  className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getPlotIcon(plot.type)}
                    <span className="font-medium text-sm">{formatPlotType(plot.type)}</span>
                    {plot.reasoning && (
                      <span className="text-xs text-muted-foreground">• {plot.reasoning}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Click to {isExpanded ? 'collapse' : 'expand'}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-4 bg-background">
                    {plot.data && typeof plot.data === 'object'  ?
                      renderPlotlyVisualization(plot.data, plot.title, plot.type) :
                      renderDataSummary(plot.data, plot.title)
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Real-time ARGO float data visualization</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfileSummaryCard = ({ 
  profiles, 
  className = "" 
}: { 
  profiles: ApiProfile[], 
  className?: string 
}) => {
  if (!profiles?.length) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Waves className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          {profiles.length} ARGO Floats Found
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-gray-600">
          <span className="font-medium">Region:</span> Bay of Bengal
        </div>
        <div className="text-gray-600">
          <span className="font-medium">Latest:</span> {new Date(profiles[0]?.profile_date || '').toLocaleDateString()}
        </div>
      </div>
      
      {profiles.length > 3 && (
        <div className="text-xs text-blue-600 mt-2">
          Click map markers to see individual float details
        </div>
      )}
    </div>
  );
};