import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Restroom } from '../types';
import { Star, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { calculateDistance, estimateWalkingTime } from '../utils';

// Fix for Leaflet's default icon issue which often causes 'Illegal constructor'
// by completely bypassing the default icon logic.
const createDivIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const UserLocationIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapViewProps {
  restrooms: Restroom[];
  onSelectRestroom: (restroom: Restroom) => void;
  userLocation: [number, number] | null;
  emergencyMode: boolean;
  shouldCenter: boolean;
  onCenterComplete: () => void;
}

function EmergencyHandler({ nearestRestroom }: { nearestRestroom: Restroom | null }) {
  const map = useMap();

  useEffect(() => {
    if (nearestRestroom) {
      map.flyTo([nearestRestroom.latitude, nearestRestroom.longitude], 17, {
        duration: 1.5
      });
    }
  }, [nearestRestroom, map]);

  return null;
}

function LocationMarker({ userLocation, shouldCenter, onCenterComplete, emergencyMode }: { userLocation: [number, number] | null, shouldCenter: boolean, onCenterComplete: () => void, emergencyMode: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && shouldCenter && !emergencyMode) {
      map.flyTo(userLocation, 15);
      onCenterComplete();
    }
  }, [userLocation, shouldCenter, map, emergencyMode, onCenterComplete]);

  if (!userLocation) return null;

  return (
    <Marker position={userLocation} icon={UserLocationIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapView({ restrooms, onSelectRestroom, userLocation, emergencyMode, shouldCenter, onCenterComplete }: MapViewProps) {
  const center: [number, number] = userLocation || [55.7200, 12.4000];

  const getWalkingTime = (restroom: Restroom) => {
    if (!userLocation) return null;
    const distance = calculateDistance(userLocation[0], userLocation[1], restroom.latitude, restroom.longitude);
    return estimateWalkingTime(distance);
  };

  const getRestroomIcon = (restroom: Restroom, isEmergencyTarget: boolean) => {
    let color = '#059669';
    if (restroom.type === 'paid') color = '#6c757d';
    if (restroom.type === 'commercial') color = '#10b981';
    if (restroom.is_verified === 1) color = '#fbbf24';
    if (isEmergencyTarget) color = '#ef4444'; // Red for emergency
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: ${isEmergencyTarget ? '40px' : '30px'}; height: ${isEmergencyTarget ? '40px' : '30px'}; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: all 0.3s ease;">
              ${isEmergencyTarget 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
              }
            </div>`,
      iconSize: isEmergencyTarget ? [40, 40] : [30, 30],
      iconAnchor: isEmergencyTarget ? [20, 20] : [15, 15],
    });
  };

  // Find nearest restroom for emergency mode
  const nearestRestroom = React.useMemo(() => {
    if (!emergencyMode || !userLocation || restrooms.length === 0) return null;
    return [...restrooms].sort((a, b) => {
      const distA = calculateDistance(userLocation[0], userLocation[1], a.latitude, a.longitude);
      const distB = calculateDistance(userLocation[0], userLocation[1], b.latitude, b.longitude);
      return distA - distB;
    })[0];
  }, [emergencyMode, userLocation, restrooms]);

  return (
    <div className="relative w-full h-full">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} zoomControl={false} className="w-full h-full">
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          userLocation={userLocation} 
          shouldCenter={shouldCenter} 
          onCenterComplete={onCenterComplete} 
          emergencyMode={emergencyMode} 
        />
        <EmergencyHandler nearestRestroom={nearestRestroom} />
        
        {restrooms.map((restroom) => {
          const walkingTime = getWalkingTime(restroom);
          const isEmergencyTarget = nearestRestroom?.id === restroom.id;
          
          return (
            <Marker
              key={restroom.id}
              position={[restroom.latitude, restroom.longitude]}
              icon={getRestroomIcon(restroom, isEmergencyTarget)}
              zIndexOffset={isEmergencyTarget ? 1000 : 0}
              eventHandlers={{
                click: () => onSelectRestroom(restroom),
              }}
            >
              {walkingTime !== null && (
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} className="custom-tooltip">
                  <div className="flex flex-col gap-1.5 bg-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 min-w-[140px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 leading-tight">{restroom.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-bold text-gray-600">{restroom.rating.toFixed(1)}</span>
                        </div>
                        {restroom.is_verified === 1 && (
                          <div className="flex items-center gap-0.5 text-emerald-600">
                            <ShieldCheck className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-px bg-gray-100 w-full" />
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span className="text-xs font-black text-primary">{walkingTime} min</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Select</span>
                    </div>
                  </div>
                </Tooltip>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
