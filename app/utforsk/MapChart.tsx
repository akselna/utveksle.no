"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapChart = () => {
    const mapRef = useRef(null);
    const geojsonLayerRef = useRef(null);

    useEffect(() => {
        // =============================
        // 1. Konfigurasjon
        // =============================
        const INITIAL_VIEW = [20, 0];
        const INITIAL_ZOOM = 2;

        // Define maxBounds to prevent panning outside the world
        const bounds = L.latLngBounds([-90, -180], [90, 180]); // Approx. world bounds

        // =============================
        // 2. Opprett Leaflet-kart
        // =============================
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                zoomControl: true,
                attributionControl: true,
                minZoom: INITIAL_ZOOM, // Prevent zooming out further than the initial zoom
                maxBounds: bounds, // Restrict panning to world bounds
                maxBoundsViscosity: 1.0 // Prevents the user from panning beyond the maxBounds
            }).setView(INITIAL_VIEW, INITIAL_ZOOM);
        }

        // =============================
        // 3. Legg til Jawg Matrix tile layer
        // =============================

        const JAWG_TOKEN = "esduRluv57sFez7IV5TFGpfhwLD2c4WasWVyKjMSxCVYQkeRK2tO94HVbOwAySO5";

        L.tileLayer(
            'https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}',
            {
                minZoom: 0,
                maxZoom: 22,
                accessToken: JAWG_TOKEN,
                attribution:
                    '<a href="https://jawg.io" target="_blank">&copy; Jawg Maps</a> | ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OSM contributors</a>'
            }
        ).addTo(mapRef.current);

        // =============================
        // 4. Importer GeoJSON-kartet
        // =============================
        fetch("/data/world.geojson")
            .then(response => response.json())
            .then(geojsonData => {
                // Test data: color specific countries
                // Try multiple property names that might contain the country name
                const countryColors = {
                    // Full names
                    "Norway": "#4CAF50",      // Green
                    "Sweden": "#2196F3",      // Blue
                    "Denmark": "#F44336",     // Red
                    "Finland": "#FF9800",     // Orange
                    "Iceland": "#9C27B0",     // Purple
                    "Germany": "#FFEB3B",     // Yellow
                    "France": "#00BCD4",      // Cyan
                    "Spain": "#E91E63",       // Pink
                    "Italy": "#8BC34A",       // Light Green
                    "United Kingdom": "#673AB7", // Deep Purple
                    "Great Britain": "#673AB7",
                    "United States of America": "#FF5722",
                    "United States": "#FF5722",
                    "USA": "#FF5722",
                    "US": "#FF5722",
                    // ISO codes (common in GeoJSON)
                    "NOR": "#4CAF50",
                    "SWE": "#2196F3",
                    "DNK": "#F44336",
                    "FIN": "#FF9800",
                    "ISL": "#9C27B0",
                    "DEU": "#FFEB3B",
                    "FRA": "#00BCD4",
                    "ESP": "#E91E63",
                    "ITA": "#8BC34A",
                    "GBR": "#673AB7",
                    "USA": "#FF5722",
                    // 2-letter codes
                    "NO": "#4CAF50",
                    "SE": "#2196F3",
                    "DK": "#F44336",
                    "FI": "#FF9800",
                    "IS": "#9C27B0",
                    "DE": "#FFEB3B",
                    "FR": "#00BCD4",
                    "ES": "#E91E63",
                    "IT": "#8BC34A",
                    "GB": "#673AB7",
                };

                // Helper function to get country color
                const getCountryColor = (feature) => {
                    const props = feature.properties;

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
                        props.ADM0_A3
                    ];

                    // Log first feature to help debug
                    if (!window.loggedCountryProps) {
                        console.log("Country properties:", props);
                        console.log("Possible names:", possibleNames.filter(n => n));
                        window.loggedCountryProps = true;
                    }

                    // Try to find a match
                    for (const name of possibleNames) {
                        if (name && countryColors[name]) {
                            console.log(`Matched country: ${name} with color ${countryColors[name]}`);
                            return countryColors[name];
                        }
                    }

                    return null;
                };

                // GeoJSON styling - now dynamic based on country
                const style = (feature) => {
                    const fillColor = getCountryColor(feature) || "#ffffff";
                    const fillOpacity = getCountryColor(feature) ? 0.7 : 0.3;

                    return {
                        weight: 1.2,
                        color: "#222",
                        fillColor: fillColor,
                        fillOpacity: fillOpacity
                    };
                };

                // Hover-stil
                function highlightFeature(e) {
                    let layer = e.target;
                    layer.setStyle({
                        weight: 2,
                        color: "#ff8800",
                        fillOpacity: 0.9
                    });
                    layer.bringToFront();
                }

                // Tilbakestill hover-stil
                function resetHighlight(e) {
                    if (geojsonLayerRef.current) {
                        geojsonLayerRef.current.resetStyle(e.target);
                    }
                }

                // Klikk → senere kan dette åpne land-kart
                function onClickFeature(e) {
                    const props = e.target.feature.properties;
                    alert(`Du klikket på: ${props.name || "ukjent land"}`);
                }

                // Legg til events for hvert land
                function onEachFeature(feature, layer) {
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: onClickFeature
                    });
                }

                // Opprett GeoJSON-lag
                if (geojsonLayerRef.current) {
                    mapRef.current.removeLayer(geojsonLayerRef.current);
                }
                geojsonLayerRef.current = L.geoJSON(geojsonData, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(mapRef.current);
            })
            .catch(err => console.error("Kunne ikke laste world.geojson:", err));

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapChart;
