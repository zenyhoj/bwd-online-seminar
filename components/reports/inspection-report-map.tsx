"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type InspectionReportMapProps = {
  latitude: number;
  longitude: number;
  applicantName: string;
};

export function InspectionReportMap({ latitude, longitude, applicantName }: InspectionReportMapProps) {
  return (
    <div className="h-72 overflow-hidden rounded-xl border">
      <MapContainer center={[latitude, longitude]} zoom={16} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{applicantName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
