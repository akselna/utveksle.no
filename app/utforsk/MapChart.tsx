"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Extend window interface for logging flag
declare global {
  interface Window {
    loggedCountryProps?: boolean;
  }
}

const MapChart = () => {
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    // =============================
    // 1. Konfigurasjon
    // =============================
    const INITIAL_VIEW: L.LatLngExpression = [20, 0];
    const INITIAL_ZOOM = 2;

    // Define maxBounds to prevent panning outside the world
    const bounds = L.latLngBounds(
      [-90, -180] as L.LatLngTuple,
      [90, 180] as L.LatLngTuple
    ); // Approx. world bounds

    // =============================
    // 2. Opprett Leaflet-kart
    // =============================
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: true,
        attributionControl: true,
        minZoom: INITIAL_ZOOM, // Prevent zooming out further than the initial zoom
        maxBounds: bounds, // Restrict panning to world bounds
        maxBoundsViscosity: 1.0, // Prevents the user from panning beyond the maxBounds
      }).setView(INITIAL_VIEW, INITIAL_ZOOM);
    }

    // =============================
    // 3. Legg til Jawg Matrix tile layer
    // =============================

    const JAWG_TOKEN =
      "esduRluv57sFez7IV5TFGpfhwLD2c4WasWVyKjMSxCVYQkeRK2tO94HVbOwAySO5";

    L.tileLayer(
      `https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=${JAWG_TOKEN}`,
      {
        minZoom: 0,
        maxZoom: 22,
        attribution:
          '<a href="https://jawg.io" target="_blank">&copy; Jawg Maps</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OSM contributors</a>',
      }
    ).addTo(mapRef.current);

    // =============================
    // 4. Importer GeoJSON-kartet
    // =============================
    fetch("/data/world.geojson")
      .then((response) => response.json())
      .then((geojsonData) => {
        // Test data: color specific countries with different shades of red
        const countryColors: Record<string, string> = {
          // Full names - different shades of red
          Norway: "#FF6B6B", // Light red
          Sweden: "#EE5A6F", // Medium light red
          Denmark: "#DC143C", // Crimson
          Finland: "#C9184A", // Deep red
          Iceland: "#A4133C", // Very deep red
          Germany: "#FF8787", // Pale red
          France: "#FF4D4D", // Bright red
          Spain: "#B30000", // Dark red
          Italy: "#FF1A1A", // Pure red
          "United Kingdom": "#8B0000", // Dark red
          "Great Britain": "#8B0000",
          "United States of America": "#CD5C5C",
          "United States": "#CD5C5C",
          USA: "#CD5C5C",
          US: "#CD5C5C",
          // ISO codes (common in GeoJSON)
          NOR: "#FF6B6B",
          SWE: "#EE5A6F",
          DNK: "#DC143C",
          FIN: "#C9184A",
          ISL: "#A4133C",
          DEU: "#FF8787",
          FRA: "#FF4D4D",
          ESP: "#B30000",
          ITA: "#FF1A1A",
          GBR: "#8B0000",
          // 2-letter codes
          NO: "#FF6B6B",
          SE: "#EE5A6F",
          DK: "#DC143C",
          FI: "#C9184A",
          IS: "#A4133C",
          DE: "#FF8787",
          FR: "#FF4D4D",
          ES: "#B30000",
          IT: "#FF1A1A",
          GB: "#8B0000",
        };

        // Helper function to get country color
        const getCountryColor = (feature: GeoJSON.Feature): string | null => {
          const props = feature.properties || {};

          // Try different property names that might contain country identifier
          const possibleNames = [
            props.name,
            props.NAME,
            props.admin,
            props.ADMIN,
            props.NAME_LONG,
            props.name_long,
            props["ISO3166-1-Alpha-3"],
            props["ISO3166-1-Alpha-2"],
            props.iso_a3,
            props.ISO_A3,
            props.iso_a2,
            props.ISO_A2,
            props.adm0_a3,
            props.ADM0_A3,
          ];

          // Log first feature to help debug
          if (!window.loggedCountryProps) {
            console.log("Country properties:", props);
            console.log(
              "Possible names:",
              possibleNames.filter((n) => n)
            );
            window.loggedCountryProps = true;
          }

          // Try to find a match
          for (const name of possibleNames) {
            if (name && countryColors[name]) {
              console.log(
                `Matched country: ${name} with color ${countryColors[name]}`
              );
              return countryColors[name];
            }
          }

          return null;
        };

        // GeoJSON styling - now dynamic based on country
        const style = (feature?: GeoJSON.Feature): L.PathOptions => {
          if (!feature) {
            return {
              weight: 1.2,
              color: "#222",
              fillColor: "#ffffff",
              fillOpacity: 0.3,
            };
          }

          const fillColor = getCountryColor(feature) || "#ffffff";
          const fillOpacity = getCountryColor(feature) ? 0.7 : 0.3;

          return {
            weight: 1.2,
            color: "#222",
            fillColor: fillColor,
            fillOpacity: fillOpacity,
          };
        };

        // Hover-stil - more subtle
        function highlightFeature(e: L.LeafletMouseEvent): void {
          const layer = e.target as L.Path;
          const currentOpacity = layer.options.fillOpacity || 0.3;
          layer.setStyle({
            weight: 1.5,
            color: "#333",
            fillOpacity: Math.min(currentOpacity + 0.15, 1),
          });
          layer.bringToFront();
        }

        // Tilbakestill hover-stil
        function resetHighlight(e: L.LeafletMouseEvent): void {
          if (geojsonLayerRef.current) {
            geojsonLayerRef.current.resetStyle(e.target);
          }
        }

        // Klikk → senere kan dette åpne land-kart
        function onClickFeature(e: L.LeafletMouseEvent): void {
          const feature = (e.target as L.Layer & { feature: GeoJSON.Feature })
            .feature;
          const props = feature?.properties || {};
          alert(`Du klikket på: ${props.name || "ukjent land"}`);
        }

        // Legg til events for hvert land
        function onEachFeature(feature: GeoJSON.Feature, layer: L.Layer): void {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: onClickFeature,
          });
        }

        // Opprett GeoJSON-lag
        if (geojsonLayerRef.current && mapRef.current) {
          mapRef.current.removeLayer(geojsonLayerRef.current);
        }
        if (mapRef.current) {
          geojsonLayerRef.current = L.geoJSON(geojsonData as GeoJSON.FeatureCollection, {
            style: style,
            onEachFeature: onEachFeature,
          }).addTo(mapRef.current);
        }
      })
      .catch((err: Error) => console.error("Kunne ikke laste world.geojson:", err));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" style={{ width: "100%", height: "100vh" }}></div>;
};

export default MapChart;
