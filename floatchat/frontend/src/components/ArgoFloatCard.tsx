import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Navigation, Layers } from "lucide-react";

interface ArgoFloatData {
  floatId: string;
  location: {
    lat: number;
    lon: number;
  };
  depth: string;
  temperature: string;
  salinity: string;
}

interface ArgoFloatCardProps {
  data: ArgoFloatData;
}

export const ArgoFloatCard = ({ data }: ArgoFloatCardProps) => {
  return (
    <Card className="bg-card border-border shadow-float hover:shadow-ocean transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary">
              <Navigation className="w-4 h-4 text-secondary-foreground" />
            </div>
            Argo Float {data.floatId}
          </CardTitle>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Position</span>
          </div>
          <span className="text-sm font-mono text-foreground">
            {data.location.lat.toFixed(1)}°, {data.location.lon.toFixed(1)}°
          </span>
        </div>

        {/* Measurements */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-secondary">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">Temperature</span>
            </div>
            <span className="text-sm font-mono font-bold text-foreground">{data.temperature}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Salinity</span>
            </div>
            <span className="text-sm font-mono font-bold text-foreground">{data.salinity}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-accent/30">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm font-medium text-foreground">Max Depth</span>
            </div>
            <span className="text-sm font-mono font-bold text-foreground">{data.depth}</span>
          </div>
        </div>

        {/* Data Quality Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="w-2 h-2 rounded-full bg-accent animate-float"></div>
          <span className="text-xs text-muted-foreground">Live oceanographic data</span>
        </div>
      </CardContent>
    </Card>
  );
};