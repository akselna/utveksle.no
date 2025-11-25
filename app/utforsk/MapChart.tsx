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
                // GeoJSON styling
                const style = {
                    weight: 1.2,
                    color: "#222",
                    fillColor: "#ffffff",
                    fillOpacity: 0.3
                };

                // Hover-stil
                function highlightFeature(e) {
                    let layer = e.target;
                    layer.setStyle({
                        weight: 2,
                        color: "#ff8800",
                        fillOpacity: 0.5
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
