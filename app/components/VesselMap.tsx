'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for Leaflet Default Icon in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const destIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Props {
    lat: number;
    lon: number;
    vesselName: string;
    destLat?: number;
    destLon?: number;
}

export default function VesselMap({ lat, lon, vesselName, destLat, destLon }: Props) {
    const polylinePositions = destLat && destLon ? [[lat, lon], [destLat, destLon]] : [];

    return (
        <MapContainer center={[lat, lon]} zoom={6} scrollWheelZoom={true} className="w-full h-full bg-slate-900">
            <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <Marker position={[lat, lon]} icon={icon}>
                <Popup>
                    <div className="text-center">
                        <strong className="block text-blue-600">{vesselName}</strong>
                        <span className="text-xs">Ubicación Actual</span>
                    </div>
                </Popup>
            </Marker>

            {destLat && destLon && (
                <>
                    <Polyline
                        positions={polylinePositions as [number, number][]}
                        pathOptions={{ color: 'yellow', dashArray: '10, 10', weight: 4, opacity: 0.7 }}
                    />
                    <Marker position={[destLat, destLon]} icon={destIcon}>
                        <Popup>
                            <div className="text-center">
                                <strong className="block text-green-600">Destino</strong>
                                <span className="text-xs">Puerto de Llegada</span>
                            </div>
                        </Popup>
                    </Marker>
                </>
            )}
        </MapContainer>
    );
}
