"use client";

import dynamic from "next/dynamic";

// Dynamically import all needed react-leaflet components to disable SSR
export const MapContainer = dynamic(
  () =>
    import("react-leaflet").then((mod) => ({
      MapContainer: mod.MapContainer,
      TileLayer: mod.TileLayer,
      Marker: mod.Marker,
      Circle: mod.Circle,
      Popup: mod.Popup,
    })),
  { ssr: false }
);
