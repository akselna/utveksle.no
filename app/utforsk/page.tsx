"use client";

import React from "react";
import dynamic from "next/dynamic";
import "./styles.css";

const MapChart = dynamic(() => import("./MapChart"), { ssr: false });

function App() {
  return (
    <div>
      <MapChart />
    </div>
  );
}

export default function UtforskPage() {
  return <App />;
}
