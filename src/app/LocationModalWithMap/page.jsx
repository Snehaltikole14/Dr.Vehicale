"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamically import MapContainer only
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Shivaji Nagar coordinates
const CENTER = { lat: 18.5204, lng: 73.8567 };
const RADIUS_KM = 10;

export default function LocationModalWithMap({ onLocationConfirmed }) {
  const [userPos, setUserPos] = useState(CENTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const distance = getDistanceFromLatLonInKm(
          lat,
          lng,
          CENTER.lat,
          CENTER.lng
        );

        if (distance <= RADIUS_KM) {
          setUserPos({ lat, lng });
          localStorage.setItem(
            "selectedLocation",
            JSON.stringify({ lat, lng })
          );
          onLocationConfirmed();
        } else {
          toast.error(
            "You are outside our service area. Please select Pune manually."
          );
          setUserPos(CENTER);
        }
        setLoading(false);
      },
      () => {
        toast.error("Allow location access or select Pune manually.");
        setLoading(false);
      }
    );
  }, [onLocationConfirmed]);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleUsePune = () => {
    setUserPos(CENTER);
    localStorage.setItem("selectedLocation", JSON.stringify(CENTER));
    toast.success("Location set to Pune!");
    onLocationConfirmed();
  };

  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    const distance = getDistanceFromLatLonInKm(
      lat,
      lng,
      CENTER.lat,
      CENTER.lng
    );
    if (distance > RADIUS_KM) {
      toast.error("Marker is outside service area!");
      setUserPos(CENTER);
    } else {
      setUserPos({ lat, lng });
      localStorage.setItem("selectedLocation", JSON.stringify({ lat, lng }));
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        Checking location...
      </div>
    );

  return (
    <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col items-center justify-center">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Select Your Location</h2>
      <p className="text-gray-600 mb-4 text-center">
        We are only available within 10 km of Shivaji Nagar, Pune.
      </p>

      <div className="w-full h-[400px] mb-4">
        <MapContainer
          center={userPos}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            draggable
            position={userPos}
            eventHandlers={{ dragend: handleMarkerDrag }}
          >
            <Popup>Drag me to select your location within Pune!</Popup>
          </Marker>
          <Circle
            center={CENTER}
            radius={RADIUS_KM * 1000}
            pathOptions={{ color: "blue", fillOpacity: 0.2 }}
          />
        </MapContainer>
      </div>

      <button
        onClick={handleUsePune}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Use Pune
      </button>
    </div>
  );
}
