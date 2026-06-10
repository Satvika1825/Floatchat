import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { ApiProfile } from '@/services/types';
import { profilesApi } from '@/services/profilesApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Filter, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
  argoProfiles?: ApiProfile[];
  isLoading?: boolean;
  onProfilesUpdate?: (profiles: ApiProfile[]) => void;
}

// Custom component to handle map events
function MapEvents({ onBoundsChange }: { onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    }
  });
  return null;
}

interface MapFilters {
  region: string;
  startDate: string;
  endDate: string;
  parameter: string;
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapComponent: React.FC<MapComponentProps> = ({
  onBoundsChange,
  className,
  argoProfiles = [],
  isLoading = false,
  onProfilesUpdate
}) => {
  const [selectedProfile, setSelectedProfile] = useState<ApiProfile | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    region: '',
    startDate: '',
    endDate: '',
    parameter: ''
  });
  const [filteredProfiles, setFilteredProfiles] = useState<ApiProfile[]>(argoProfiles);
  const [filterLoading, setFilterLoading] = useState(false);

  // Handle marker click
  const handleMarkerClick = useCallback((profile: ApiProfile) => {
    setSelectedProfile(profile);
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Update filtered profiles when argoProfiles change
  useEffect(() => {
    setFilteredProfiles(argoProfiles);
  }, [argoProfiles]);

  // Apply filters
  const applyFilters = useCallback(async () => {
    setFilterLoading(true);
    try {
      let profiles = argoProfiles;

      // If we have active filters, fetch from API
      if (filters.region || filters.startDate || filters.endDate || filters.parameter) {
        const filterParams: {
          region?: string;
          start_date?: string;
          end_date?: string;
          parameter?: string;
          limit: number;
        } = { limit: 100 };
        if (filters.region) filterParams.region = filters.region;
        if (filters.startDate) filterParams.start_date = filters.startDate;
        if (filters.endDate) filterParams.end_date = filters.endDate;
        if (filters.parameter) filterParams.parameter = filters.parameter;
        
        profiles = await profilesApi.searchByRegionTime(filterParams);
      }

      setFilteredProfiles(profiles);
      if (onProfilesUpdate) {
        onProfilesUpdate(profiles);
      }
    } catch (error) {
      // Error applying filters handled silently
      setFilteredProfiles(argoProfiles); // Fallback to original profiles
    } finally {
      setFilterLoading(false);
    }
  }, [filters, argoProfiles, onProfilesUpdate]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      region: '',
      startDate: '',
      endDate: '',
      parameter: ''
    });
    setFilteredProfiles(argoProfiles);
    if (onProfilesUpdate) {
      onProfilesUpdate(argoProfiles);
    }
  }, [argoProfiles, onProfilesUpdate]);

  // Apply filters when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.region || filters.startDate || filters.endDate || filters.parameter) {
        applyFilters();
      } else {
        setFilteredProfiles(argoProfiles);
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [filters, applyFilters, argoProfiles]);

  // Predefined regions for quick selection
  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'arabian_sea', label: 'Arabian Sea' },
    { value: 'indian_ocean', label: 'Indian Ocean' },
    { value: 'equator', label: 'Equatorial Region' },
    { value: 'tropical_indian', label: 'Tropical Indian Ocean' },
  ];

  // Parameters for filtering
  const parameters = [
    { value: '', label: 'All Parameters' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'salinity', label: 'Salinity' },
    { value: 'oxygen', label: 'Oxygen' },
    { value: 'chlorophyll', label: 'Chlorophyll' },
  ];

  // Check if any filters are active
  const hasActiveFilters = filters.region || filters.startDate || filters.endDate || filters.parameter;

  return (
    <div className={`${className} relative`}>
      {/* Filter Toggle Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
          className="bg-white shadow-md border border-gray-200 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2 px-1 text-xs">
              {[filters.region, filters.startDate, filters.endDate, filters.parameter].filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-20 w-80">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Map Filters
                </CardTitle>
                <Button
                  onClick={() => setShowFilters(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Region</label>
                <Select 
                  value={filters.region} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Parameter Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Parameter</label>
                <Select 
                  value={filters.parameter} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, parameter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parameter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parameters.map(param => (
                      <SelectItem key={param.value} value={param.value}>
                        {param.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {filterLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  )}
                  <span className="text-xs text-gray-500">
                    {filteredProfiles.length} floats
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapEvents onBoundsChange={onBoundsChange} />

        {/* ARGO Float Markers */}
        {filteredProfiles.map((profile) => (
          <Marker
            key={profile.profile_id}
            position={[profile.latitude, profile.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(profile)
            }}
          >
            <Popup>
              <div className="space-y-2">
                <div className="font-bold text-lg text-blue-600">
                  Float {profile.platform_number}
                </div>

                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Cycle:</span> {profile.cycle_number}</div>
                  <div><span className="font-medium">Location:</span> {profile.latitude.toFixed(3)}°N, {profile.longitude.toFixed(3)}°E</div>
                  <div><span className="font-medium">Date:</span> {formatDate(profile.profile_date)}</div>
                  {profile.ocean_region && (
                    <div><span className="font-medium">Region:</span> {profile.ocean_region}</div>
                  )}
                </div>

                {profile.summary_text && (
                  <div className="text-xs text-gray-600 mt-2 border-t pt-2">
                    {profile.summary_text.slice(0, 150)}...
                  </div>
                )}

                <div className="text-xs text-blue-600 font-medium mt-2">
                  Click to view detailed measurements
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading indicator */}
      {(isLoading || filterLoading) && (
        <div className="absolute top-4 right-16 bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2 text-sm z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span>{filterLoading ? 'Applying filters...' : 'Loading ARGO floats...'}</span>
        </div>
      )}

      {/* Float count indicator */}
      {filteredProfiles.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-blue-600">{filteredProfiles.length}</span>
            <span className="text-gray-600">ARGO floats</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs px-1">
                filtered
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;