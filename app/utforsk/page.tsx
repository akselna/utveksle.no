"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import "./styles.css";

const MapChart = dynamic(() => import("./MapChart"), { ssr: false });

function App() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full overflow-hidden" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <MapChart />
    </div>
  );
}

export default function UtforskPage() {
  return <App />;
}
