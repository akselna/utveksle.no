"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Extend window interface for logging flag
declare global {
  interface Window {
    loggedCountryProps?: boolean;
  }
}

// Types
interface University {
  name: string;
  lat: number;
  lng: number;
  exchangeCount: number;
}

interface Exchange {
  id: string;
  university: string;
  country: string;
  study: string;
  year: string;
  numSemesters: number;
}

interface PlannedExchange {
  id: string;
  university: string;
  country: string;
  study: string;
  studentName: string;
  semester: string;
}

const MapChart = () => {
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const universityMarkersRef = useRef<L.LayerGroup | null>(null);
  const selectedCountryRef = useRef<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [universitiesByCountry, setUniversitiesByCountry] = useState<
    Record<string, string[]>
  >({});
  const [allExchanges, setAllExchanges] = useState<Exchange[]>([]);
  const [plannedExchanges, setPlannedExchanges] = useState<PlannedExchange[]>([]);
  const [universityCoordinates, setUniversityCoordinates] = useState<
    Record<string, { lat: number; lng: number }>
  >({});
  const [mapMode, setMapMode] = useState<"reviews" | "planned">("reviews"); // Toggle between reviews and planned exchanges

  // Update ref whenever state changes
  useEffect(() => {
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  // Load university and exchange data
  useEffect(() => {
    console.log("Loading exchange data...");

    fetch("/extracted-data/all-exchanges.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Exchanges loaded:", data.length, "exchanges");
        setAllExchanges(data);
      })
      .catch((err) => console.error("Failed to load exchanges:", err));

    fetch("/extracted-data/planned-exchanges.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Planned exchanges loaded:", data.length, "planned");
        setPlannedExchanges(data);
      })
      .catch((err) => console.error("Failed to load planned exchanges:", err));

    fetch("/extracted-data/university-coordinates.json")
      .then((res) => res.json())
      .then((data) => {
        console.log(
          "University coordinates loaded:",
          Object.keys(data).length,
          "universities"
        );
        setUniversityCoordinates(data);
      })
      .catch((err) => console.error("Failed to load coordinates:", err));
  }, []);

  // Build universitiesByCountry dynamically based on current mode and actual data
  useEffect(() => {
    if (allExchanges.length === 0 && plannedExchanges.length === 0) {
      return;
    }

    // Use the appropriate data based on current mode
    const dataToUse = mapMode === "reviews" ? allExchanges : plannedExchanges;

    // Build map of countries -> universities
    const countryMap: Record<string, string[]> = {};
    dataToUse.forEach((exchange) => {
      const country = exchange.country;
      const university = exchange.university;

      if (!countryMap[country]) {
        countryMap[country] = [];
      }

      // Add university if not already in the list
      if (!countryMap[country].includes(university)) {
        countryMap[country].push(university);
      }
    });

    console.log("Built universitiesByCountry from actual data:", countryMap);
    setUniversitiesByCountry(countryMap);
  }, [allExchanges, plannedExchanges, mapMode]);

  useEffect(() => {
    // Wait for data to load before initializing map
    if (Object.keys(universityCoordinates).length === 0) {
      console.log("Waiting for university data to load...");
      return;
    }

    console.log("Initializing map with data:", universitiesByCountry);
    console.log("University coordinates:", universityCoordinates);

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
        zoomControl: !selectedCountry, // Disable zoom control when country is selected
        attributionControl: true,
        minZoom: INITIAL_ZOOM,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        dragging: !selectedCountry, // Disable dragging when country is selected
        scrollWheelZoom: !selectedCountry, // Disable scroll zoom when country is selected
        doubleClickZoom: !selectedCountry, // Disable double click zoom when country is selected
        boxZoom: !selectedCountry, // Disable box zoom when country is selected
        keyboard: !selectedCountry, // Disable keyboard navigation when country is selected
        touchZoom: !selectedCountry, // Disable touch zoom when country is selected
      }).setView(INITIAL_VIEW, INITIAL_ZOOM);
    } else {
      // Update map interaction settings based on selection state
      if (selectedCountry) {
        mapRef.current.dragging.disable();
        mapRef.current.scrollWheelZoom.disable();
        mapRef.current.doubleClickZoom.disable();
        mapRef.current.boxZoom.disable();
        mapRef.current.keyboard.disable();
        mapRef.current.touchZoom.disable();
        if (mapRef.current.zoomControl) {
          mapRef.current.removeControl(mapRef.current.zoomControl);
        }
      } else {
        mapRef.current.dragging.enable();
        mapRef.current.scrollWheelZoom.enable();
        mapRef.current.doubleClickZoom.enable();
        mapRef.current.boxZoom.enable();
        mapRef.current.keyboard.enable();
        mapRef.current.touchZoom.enable();
        if (!mapRef.current.zoomControl) {
          mapRef.current.addControl(L.control.zoom({ position: "topleft" }));
        }
      }
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
        // Helper function to get country color based on number of universities
        const getCountryColor = (feature: GeoJSON.Feature): string => {
          const props = feature.properties || {};
          const countryName = props.name || "";

          // Check if this country has universities
          const universities = universitiesByCountry[countryName];
          if (!universities || universities.length === 0) {
            return "#f0f0f0"; // Light gray for countries with no exchanges
          }

          // Color based on number of universities (shades of red)
          const count = universities.length;
          if (count >= 10) return "#8B0000"; // Dark red
          if (count >= 7) return "#A4133C"; // Very deep red
          if (count >= 5) return "#C9184A"; // Deep red
          if (count >= 3) return "#DC143C"; // Crimson
          if (count >= 2) return "#EE5A6F"; // Medium red
          return "#FF6B6B"; // Light red (1 university)
        };

        // GeoJSON styling - now dynamic based on country and selection
        const style = (feature?: GeoJSON.Feature): L.PathOptions => {
          if (!feature) {
            return {
              weight: 1.2,
              color: "#222",
              fillColor: "#f0f0f0",
              fillOpacity: 0.5,
            };
          }

          const countryName = feature.properties?.name || "";
          const isSelected = selectedCountry === countryName;

          // If a country is selected and this is not it, make it grey
          if (selectedCountry && !isSelected) {
            return {
              weight: 1.2,
              color: "#222",
              fillColor: "#d0d0d0",
              fillOpacity: 0.4,
            };
          }

          const fillColor = getCountryColor(feature);
          const hasUniversities = universitiesByCountry[countryName];

          return {
            weight: 1.2,
            color: "#222",
            fillColor: fillColor,
            fillOpacity: hasUniversities ? 0.7 : 0.3,
          };
        };

        // Hover-stil - more subtle
        function highlightFeature(e: L.LeafletMouseEvent): void {
          // Don't do anything if a country is selected
          if (selectedCountryRef.current) {
            return;
          }

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
          // Don't do anything if a country is selected
          if (selectedCountryRef.current) {
            return;
          }

          // No country selected, use default resetStyle
          if (geojsonLayerRef.current) {
            geojsonLayerRef.current.resetStyle(e.target);
          }
        }

        // Klikk → zoom inn til landet og vis universiteter
        function onClickFeature(e: L.LeafletMouseEvent): void {
          // Don't do anything if a country is already selected
          if (selectedCountryRef.current) {
            return;
          }

          const layer = e.target as L.Path;
          const feature = (e.target as L.Layer & { feature: GeoJSON.Feature })
            .feature;
          const props = feature?.properties || {};
          const countryName = props.name || "";

          console.log("Clicked country:", countryName);
          console.log("Available universities:", universitiesByCountry);
          console.log(
            "Universities in this country:",
            universitiesByCountry[countryName]
          );

          // Check if country has universities
          const universities = universitiesByCountry[countryName];
          if (!universities || universities.length === 0) {
            alert(`Ingen utvekslingssteder funnet i ${countryName}`);
            // Don't change styling if there are no universities
            return;
          }

          if (mapRef.current) {
            // Remove maxBounds restriction first to allow proper centering
            mapRef.current.setMaxBounds(null as any);

            // Special handling for large countries
            const largeCountries: Record<string, { center: L.LatLngTuple; zoom: number }> = {
              "United States of America": { center: [39.8283, -98.5795], zoom: 4 },
              "Canada": { center: [56.1304, -106.3468], zoom: 3 },
              "Russia": { center: [61.5240, 105.3188], zoom: 3 },
              "China": { center: [35.8617, 104.1954], zoom: 4 },
              "Australia": { center: [-25.2744, 133.7751], zoom: 4 },
              "Brazil": { center: [-14.2350, -51.9253], zoom: 4 },
            };

            if (largeCountries[countryName]) {
              // Use predefined center and zoom for large countries
              const { center, zoom } = largeCountries[countryName];
              console.log(`Using predefined center for ${countryName}:`, center, zoom);

              mapRef.current.setView(center, zoom, {
                animate: true,
                duration: 0.5,
              });
            } else {
              // For smaller countries, use bounds as before
              let bounds;
              if (typeof layer.getBounds === "function") {
                bounds = layer.getBounds();
              } else if (feature?.geometry) {
                const tempLayer = L.geoJSON(feature);
                bounds = tempLayer.getBounds();
              }

              if (!bounds) {
                console.error("Could not get bounds for country:", countryName);
                return;
              }

              console.log("Zooming to bounds:", bounds);
              mapRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 6,
                animate: true,
                duration: 0.5,
              });
            }

            // After zoom animation completes, re-apply bounds to the visible area
            setTimeout(() => {
              if (mapRef.current) {
                const currentBounds = mapRef.current.getBounds();
                const extendedBounds = currentBounds.pad(0.5);
                mapRef.current.setMaxBounds(extendedBounds);
              }
            }, 600);

            // Set selected country
            setSelectedCountry(countryName);

            // Update all country styles to grey out non-selected countries
            if (geojsonLayerRef.current) {
              geojsonLayerRef.current.setStyle((feature) => {
                const featureCountryName = feature?.properties?.name || "";
                const isSelected = featureCountryName === countryName;

                if (!isSelected) {
                  return {
                    weight: 1.2,
                    color: "#222",
                    fillColor: "#d0d0d0",
                    fillOpacity: 0.4,
                  };
                }

                // Keep the selected country's original color
                const fillColor = getCountryColor(feature);
                return {
                  weight: 1.2,
                  color: "#222",
                  fillColor: fillColor,
                  fillOpacity: 0.7,
                };
              });
            }

            // Clear existing university markers
            if (universityMarkersRef.current) {
              universityMarkersRef.current.clearLayers();
            } else {
              universityMarkersRef.current = L.layerGroup().addTo(
                mapRef.current
              );
            }

            // Add university markers with real GPS coordinates
            universities.forEach((universityName) => {
              // Get data based on current mode
              const isReviewMode = mapMode === "reviews";
              const universityData = isReviewMode
                ? allExchanges.filter((ex) => ex.university === universityName)
                : plannedExchanges.filter((ex) => ex.university === universityName);

              if (universityData.length === 0) {
                return; // Skip if no data for this university in current mode
              }

              // Get the real coordinates for this university
              const coords = universityCoordinates[universityName];
              if (!coords) {
                console.warn(`No coordinates found for ${universityName}`);
                return; // Skip this university if no coordinates
              }

              // Different colors for different modes
              const markerColor = isReviewMode ? "#DC143C" : "#2196F3"; // Red for reviews, Blue for planned

              // Create a marker at the real location
              const marker = L.marker([coords.lat, coords.lng], {
                icon: L.divIcon({
                  className: "university-marker",
                  html: `<div style="
                    background: ${markerColor};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 10px;
                  ">${universityData.length}</div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                }),
              });

              // Add popup with university info - different content based on mode
              let popupContent;
              if (isReviewMode) {
                const reviews = universityData as Exchange[];
                popupContent = `
                  <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                      ${universityName}
                    </h3>
                    <p style="margin: 0 0 5px 0; font-size: 12px;">
                      <strong>${reviews.length}</strong> anmeldelse${reviews.length !== 1 ? "r" : ""}
                    </p>
                    ${reviews
                      .slice(0, 3)
                      .map(
                        (ex) => `
                      <div style="margin: 5px 0; padding: 5px; background: #f5f5f5; border-radius: 3px; font-size: 11px;">
                        <div><strong>${ex.study}</strong></div>
                        <div>År: ${ex.year} | ${ex.numSemesters} semester</div>
                      </div>
                    `
                      )
                      .join("")}
                    ${
                      reviews.length > 3
                        ? `
                      <p style="margin: 5px 0 0 0; font-size: 11px; font-style: italic;">
                        + ${reviews.length - 3} flere...
                      </p>
                    `
                        : ""
                    }
                  </div>
                `;
              } else {
                const planned = universityData as PlannedExchange[];
                popupContent = `
                  <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                      ${universityName}
                    </h3>
                    <p style="margin: 0 0 5px 0; font-size: 12px;">
                      <strong>${planned.length}</strong> student${planned.length !== 1 ? "er" : ""} planlegger å dra
                    </p>
                    ${planned
                      .slice(0, 3)
                      .map(
                        (ex) => `
                      <div style="margin: 5px 0; padding: 5px; background: #e3f2fd; border-radius: 3px; font-size: 11px;">
                        <div><strong>${ex.study}</strong></div>
                        <div>${ex.semester}</div>
                      </div>
                    `
                      )
                      .join("")}
                    ${
                      planned.length > 3
                        ? `
                      <p style="margin: 5px 0 0 0; font-size: 11px; font-style: italic;">
                        + ${planned.length - 3} flere...
                      </p>
                    `
                        : ""
                    }
                  </div>
                `;
              }

              marker.bindPopup(popupContent);
              marker.addTo(universityMarkersRef.current!);
            });

            console.log(
              `Showing ${universities.length} universities in ${countryName}`
            );
          }
        }

        // Legg til events for hvert land
        function onEachFeature(feature: GeoJSON.Feature, layer: L.Layer): void {
          // Always attach the event handlers - they will check selectedCountry internally
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
          geojsonLayerRef.current = L.geoJSON(
            geojsonData as GeoJSON.FeatureCollection,
            {
              style: style,
              onEachFeature: onEachFeature,
            }
          ).addTo(mapRef.current);
        }
      })
      .catch((err: Error) =>
        console.error("Kunne ikke laste world.geojson:", err)
      );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [universitiesByCountry, allExchanges, plannedExchanges, universityCoordinates, mapMode]);

  const resetView = () => {
    if (mapRef.current) {
      // Re-enable all map interactions
      mapRef.current.dragging.enable();
      mapRef.current.scrollWheelZoom.enable();
      mapRef.current.doubleClickZoom.enable();
      mapRef.current.boxZoom.enable();
      mapRef.current.keyboard.enable();
      mapRef.current.touchZoom.enable();

      // Re-add zoom control if it doesn't exist
      if (!mapRef.current.zoomControl) {
        mapRef.current.addControl(L.control.zoom({ position: "topleft" }));
      }

      // Restore maxBounds restriction
      const bounds = L.latLngBounds(
        [-90, -180] as L.LatLngTuple,
        [90, 180] as L.LatLngTuple
      );
      mapRef.current.setMaxBounds(bounds);

      // Reset to world view
      mapRef.current.setView([20, 0], 2, {
        animate: true,
        duration: 0.5,
      });

      // Clear university markers completely
      if (universityMarkersRef.current && mapRef.current) {
        mapRef.current.removeLayer(universityMarkersRef.current);
        universityMarkersRef.current = null;
      }

      // Clear selected country first to allow style reset
      setSelectedCountry(null);

      // Restore all country colors - this will trigger a re-render with new styles
      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.eachLayer((layer) => {
          if (geojsonLayerRef.current) {
            geojsonLayerRef.current.resetStyle(layer);
          }
        });
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div id="map" style={{ width: "100%", height: "100%" }}></div>

      {/* Toggle Button - Map Mode Selector */}
      {!selectedCountry && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setMapMode("reviews")}
            style={{
              padding: "12px 24px",
              backgroundColor: mapMode === "reviews" ? "#DC143C" : "white",
              color: mapMode === "reviews" ? "white" : "#333",
              border: "none",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s",
              borderRadius: "12px 0 0 12px",
            }}
          >
            Anmeldelser
          </button>
          <button
            onClick={() => setMapMode("planned")}
            style={{
              padding: "12px 24px",
              backgroundColor: mapMode === "planned" ? "#DC143C" : "white",
              color: mapMode === "planned" ? "white" : "#333",
              border: "none",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s",
              borderRadius: "0 12px 12px 0",
            }}
          >
            Planlagt utveksling
          </button>
        </div>
      )}

      {/* Reset View Button */}
      {selectedCountry && (
        <button
          onClick={resetView}
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            backgroundColor: "#DC143C",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#B30000";
            e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#DC143C";
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
          }}
        >
          ← Tilbake til verdenskart
        </button>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          fontSize: "12px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
          {mapMode === "reviews" ? "Anmeldelser" : "Planlagt utveksling"}
        </div>
        <div style={{ fontSize: "11px", color: "#666", marginBottom: "10px" }}>
          Antall universiteter
        </div>
        <div style={{ display: "flex", alignItems: "center", margin: "5px 0" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#8B0000",
              marginRight: "8px",
              borderRadius: "3px",
            }}
          ></div>
          <span>10+ universiteter</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", margin: "5px 0" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#DC143C",
              marginRight: "8px",
              borderRadius: "3px",
            }}
          ></div>
          <span>3-9 universiteter</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", margin: "5px 0" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#FF6B6B",
              marginRight: "8px",
              borderRadius: "3px",
            }}
          ></div>
          <span>1-2 universiteter</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", margin: "5px 0" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#f0f0f0",
              marginRight: "8px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          ></div>
          <span>Ingen utveksling</span>
        </div>
      </div>
    </div>
  );
};

export default MapChart;
