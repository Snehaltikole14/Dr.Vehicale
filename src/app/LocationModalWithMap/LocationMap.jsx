"use client";

import dynamic from "next/dynamic";

// Dynamically import entire react-leaflet module for client-side
const Leaflet = dynamic(() => import("react-leaflet"), { ssr: false });

export default Leaflet;
