"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

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
  imageUrl?: string;
}

interface PlannedExchange {
  id: string;
  userId: number; // Added for contact request
  university: string;
  country: string;
  study: string;
  studentName: string;
  semester: string;
  year?: number;
  imageUrl?: string;
  contactStatus:
    | "none"
    | "pending_sent"
    | "pending_received"
    | "accepted"
    | "self";
}

interface UniversityData {
  id: number;
  name: string;
  city: string;
  country: string;
  imageUrl?: string;
  lat: number;
  lng: number;
}

const normalizeCountryName = (name: string): string => {
  if (!name) return "";
  const n = name.trim();
  if (n === "United States of America" || n === "United States") return "USA";
  if (n === "The Netherlands") return "Netherlands";
  if (n === "United Kingdom" || n === "Great Britain") return "United Kingdom";
  if (n === "Korea, Republic of" || n === "South Korea") return "South Korea";
  if (n === "Tanzania, United Republic of") return "Tanzania";
  if (n === "Russian Federation") return "Russia";
  if (n === "Viet Nam") return "Vietnam";
  return n;
};

const MapChart = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const universityMarkersRef = useRef<L.LayerGroup | null>(null);
  const selectedCountryRef = useRef<string | null>(null);

  // Contact Request State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    name: string;
  }>({
    isOpen: false,
    userId: null,
    name: "",
  });
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [universitiesByCountry, setUniversitiesByCountry] = useState<
    Record<string, string[]>
  >({});
  const [allExchanges, setAllExchanges] = useState<Exchange[]>([]);
  const [plannedExchanges, setPlannedExchanges] = useState<PlannedExchange[]>(
    []
  );
  const [allUniversities, setAllUniversities] = useState<UniversityData[]>([]);
  const [universityCoordinates, setUniversityCoordinates] = useState<
    Record<string, { lat: number; lng: number; city?: string }>
  >({});
  const [mapMode, setMapMode] = useState<"all" | "reviews" | "planned">("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [plannedSemesterFilter, setPlannedSemesterFilter] = useState<
    "next" | "after"
  >("next");

  // --- Handlers for Global Window Functions ---
  useEffect(() => {
    (window as any).askToShareName = (userId: number, studyProgram: string) => {
      // Check if user is logged in before showing modal
      if (!session?.user) {
        router.push("/auth/signin");
        return;
      }
      setConfirmModal({
        isOpen: true,
        userId: userId,
        name: studyProgram,
      });
    };
    return () => {
      delete (window as any).askToShareName;
    };
  }, [session, router]);

  const handleConfirmRequest = async () => {
    if (!confirmModal.userId) return;
    setIsSendingRequest(true);
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: confirmModal.userId }),
      });
      if (res.ok) {
        setPlannedExchanges((prev) =>
          prev.map((p) =>
            p.userId === confirmModal.userId
              ? { ...p, contactStatus: "pending_sent" }
              : p
          )
        );
        setConfirmModal({ ...confirmModal, isOpen: false });
        toast.success("Forespørsel sendt!");
      } else {
        toast.error("Kunne ikke sende forespørsel. Du må være logget inn.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Noe gikk galt.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Load GeoJSON
  useEffect(() => {
    fetch("/data/world.geojson")
      .then((response) => response.json())
      .then((data) => {
        console.log("GeoJSON data loaded");
        setGeoJsonData(data);
      })
      .catch((err: Error) =>
        console.error("Kunne ikke laste world.geojson:", err)
      );
  }, []);

  // Load Data
  useEffect(() => {
    console.log("Loading exchange data...");

    try {
      const cachedExchanges = sessionStorage.getItem("cached_experiences");
      if (cachedExchanges) {
        setAllExchanges(JSON.parse(cachedExchanges));
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
    }

    fetch("/api/experiences")
      .then((res) => res.json())
      .then((apiData) => {
        if (apiData.success && apiData.experiences) {
          const dbExchanges: Exchange[] = apiData.experiences.map(
            (exp: any) => ({
              id: `db-${exp.id}`,
              university: exp.university_name,
              country: exp.country,
              study: exp.study_program,
              year: exp.year.toString(),
              numSemesters: exp.semester === "Høst + Vår" ? 2 : 1,
              imageUrl: exp.university_image_url,
            })
          );
          try {
            sessionStorage.setItem(
              "cached_experiences",
              JSON.stringify(dbExchanges)
            );
          } catch (e) {}
          setAllExchanges(dbExchanges);
          setIsLoading(false);
        } else {
          // Fallback
          fetch("/extracted-data/all-exchanges.json")
            .then((res) => res.json())
            .then((staticData) => {
              setAllExchanges(staticData);
              setIsLoading(false);
            });
        }
      })
      .catch(() => {
        fetch("/extracted-data/all-exchanges.json")
          .then((res) => res.json())
          .then((staticData) => {
            setAllExchanges(staticData);
            setIsLoading(false);
          });
      });

    fetch("/api/universities")
      .then((res) => res.json())
      .then((apiData) => {
        if (apiData.success && apiData.universities) {
          const universities: UniversityData[] = apiData.universities.map(
            (uni: any) => ({
              id: uni.id,
              name: uni.name,
              city: uni.city,
              country: uni.country,
              imageUrl: uni.image_url,
              lat: parseFloat(uni.latitude),
              lng: parseFloat(uni.longitude),
            })
          );
          setAllUniversities(universities);
        }
      });

    const now = new Date();
    const currentMonth = now.getMonth();

    // Calculate current semester and next semester
    let currentSemester: string, currentSemesterYear: number;
    let nextSemester: string, nextYear: number;

    // Current month logic:
    // Jan-Jul (0-6): Current = Vår same year, Next = Høst same year
    // Aug-Dec (7-11): Current = Høst same year, Next = Vår next year
    if (currentMonth <= 6) {
      currentSemester = "Vår";
      currentSemesterYear = now.getFullYear();
      nextSemester = "Høst";
      nextYear = now.getFullYear();
    } else {
      currentSemester = "Høst";
      currentSemesterYear = now.getFullYear();
      nextSemester = "Vår";
      nextYear = now.getFullYear() + 1;
    }

    // Use the selected filter: "next" = current semester, "after" = next semester
    const targetSemester =
      plannedSemesterFilter === "next" ? currentSemester : nextSemester;
    const targetYear =
      plannedSemesterFilter === "next" ? currentSemesterYear : nextYear;

    fetch(
      `/api/exchange-plans/planned?year=${encodeURIComponent(
        targetYear
      )}&semester=${encodeURIComponent(targetSemester)}`
    )
      .then((res) => res.json())
      .then((apiData) => {
        if (apiData.success && apiData.plannedExchanges) {
          console.log("Loaded planned exchanges:", apiData.plannedExchanges.length, apiData.plannedExchanges);
          setPlannedExchanges(apiData.plannedExchanges);
        } else {
          console.log("No planned exchanges from API, trying fallback");
          fetch("/extracted-data/planned-exchanges.json")
            .then((res) => res.json())
            .then((data) => {
              console.log("Loaded planned exchanges from fallback:", data.length);
              setPlannedExchanges(data);
            });
        }
      })
      .catch((error) => {
        console.error("Error loading planned exchanges:", error);
        fetch("/extracted-data/planned-exchanges.json")
          .then((res) => res.json())
          .then((data) => {
            console.log("Loaded planned exchanges from fallback (error):", data.length);
            setPlannedExchanges(data);
          });
      });

    fetch("/extracted-data/university-coordinates.json")
      .then((res) => res.json())
      .then((data) => setUniversityCoordinates(data));
  }, [plannedSemesterFilter]);

  // Build Map Data
  useEffect(() => {
    // Wait for coordinates to be loaded before building map data
    if (Object.keys(universityCoordinates).length === 0) return;
    
    if (
      mapMode !== "all" &&
      allExchanges.length === 0 &&
      plannedExchanges.length === 0
    )
      return;
    if (mapMode === "all" && allUniversities.length === 0) return;

    const countryMap: Record<string, string[]> = {};

    if (mapMode === "all") {
      allUniversities.forEach((uni) => {
        const country = normalizeCountryName(uni.country);
        const university = uni.name;
        if (!countryMap[country]) countryMap[country] = [];
        if (!countryMap[country].includes(university))
          countryMap[country].push(university);
      });
    } else {
      const dataToUse = mapMode === "reviews" ? allExchanges : plannedExchanges;
      
      console.log(`Building map data for mode: ${mapMode}, exchanges: ${dataToUse.length}`);
      
      // Helper function to normalize university name to match coordinates
      const normalizeUniversityName = (name: string): string => {
        // Try exact match first
        if (universityCoordinates[name]) return name;
        // Try case-insensitive match
        const caseMatch = Object.keys(universityCoordinates).find(
          (key) => key.toLowerCase() === name.toLowerCase()
        );
        if (caseMatch) return caseMatch;
        // Try partial matching
        const normalizedName = name.toLowerCase().trim();
        const partialMatch = Object.keys(universityCoordinates).find((key) => {
          const normalizedKey = key.toLowerCase().trim();
          const coordData = universityCoordinates[key];
          return (
            normalizedKey.includes(normalizedName) ||
            normalizedName.includes(normalizedKey) ||
            (coordData.city &&
              (coordData.city.toLowerCase() === normalizedName ||
                normalizedName.includes(coordData.city.toLowerCase()) ||
                coordData.city.toLowerCase().includes(normalizedName)))
          );
        });
        return partialMatch || name; // Return original if no match found
      };

      dataToUse.forEach((exchange) => {
        const country = normalizeCountryName(exchange.country);
        const normalizedUniversity = normalizeUniversityName(
          exchange.university
        );
        if (exchange.university !== normalizedUniversity) {
          console.log(
            `Normalized university name: "${exchange.university}" -> "${normalizedUniversity}"`
          );
        }
        if (!countryMap[country]) countryMap[country] = [];
        if (!countryMap[country].includes(normalizedUniversity))
          countryMap[country].push(normalizedUniversity);
      });
      
      console.log(`Built country map with ${Object.keys(countryMap).length} countries`);
    }
    setUniversitiesByCountry(countryMap);
  }, [allExchanges, plannedExchanges, allUniversities, mapMode, universityCoordinates]);

  // Track Ctrl/Meta key for zooming
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") setIsCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update map scrollWheelZoom based on Ctrl key
  useEffect(() => {
    if (!mapRef.current) return;
    if (isCtrlPressed) {
      mapRef.current.scrollWheelZoom.enable();
    } else {
      mapRef.current.scrollWheelZoom.disable();
    }
  }, [isCtrlPressed]);

  // Initialize Map
  useEffect(() => {
    if (Object.keys(universityCoordinates).length === 0 || !geoJsonData) return;

    const INITIAL_VIEW: L.LatLngExpression = [20, 0];
    const INITIAL_ZOOM = 2;
    const bounds = L.latLngBounds([-90, -180], [90, 180]);

    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: true,
        minZoom: INITIAL_ZOOM,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        dragging: true,
        scrollWheelZoom: false, // Default to false, enabled via Ctrl
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        touchZoom: true,
      }).setView(INITIAL_VIEW, INITIAL_ZOOM);

      L.control.zoom({ position: "bottomleft" }).addTo(mapRef.current); // Moved to bottomleft

      const JAWG_TOKEN =
        "esduRluv57sFez7IV5TFGpfhwLD2c4WasWVyKjMSxCVYQkeRK2tO94HVbOwAySO5";
      L.tileLayer(
        `https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=${JAWG_TOKEN}`,
        {
          minZoom: 0,
          maxZoom: 22,
          attribution:
            '<a href="https://jawg.io" target="_blank">&copy; Jawg Maps</a>',
        }
      ).addTo(mapRef.current);
    }

    const getCountryColor = (feature: any): string => {
      const props = feature.properties || {};
      const countryName = normalizeCountryName(props.name || "");
      const universities = universitiesByCountry[countryName];

      if (!universities || universities.length === 0) return "#f1f5f9"; // Slate 100

      const count = universities.length;
      if (count >= 10) return "#1e40af"; // Blue 800
      if (count >= 7) return "#2563eb"; // Blue 600
      if (count >= 5) return "#3b82f6"; // Blue 500
      if (count >= 3) return "#60a5fa"; // Blue 400
      if (count >= 2) return "#93c5fd"; // Blue 300
      return "#bfdbfe"; // Blue 200
    };

    const style = (feature: any): L.PathOptions => {
      if (!feature)
        return {
          weight: 1,
          color: "#94a3b8",
          fillColor: "#f1f5f9",
          fillOpacity: 0.6,
        };

      const countryName = normalizeCountryName(feature.properties?.name || "");
      const isSelected = selectedCountry === countryName;

      if (selectedCountry && !isSelected) {
        return {
          weight: 0.5,
          color: "#cbd5e1",
          fillColor: "#f8fafc",
          fillOpacity: 0.3,
        };
      }

      const fillColor = getCountryColor(feature);
      const hasUniversities = universitiesByCountry[countryName];

      return {
        weight: hasUniversities ? 1.2 : 0.8,
        color: hasUniversities ? "#64748b" : "#cbd5e1",
        fillColor: fillColor,
        fillOpacity: hasUniversities ? (isSelected ? 0.8 : 0.7) : 0.4,
      };
    };

    function highlightFeature(e: L.LeafletMouseEvent): void {
      if (selectedCountryRef.current) return;
      const layer = e.target as L.Path;
      layer.setStyle({ weight: 2, color: "#475569", fillOpacity: 0.85 });
      layer.bringToFront();
    }

    function resetHighlight(e: L.LeafletMouseEvent): void {
      if (selectedCountryRef.current) return;
      if (geojsonLayerRef.current) geojsonLayerRef.current.resetStyle(e.target);
    }

    function onClickFeature(e: L.LeafletMouseEvent): void {
      if (selectedCountryRef.current) return;

      const layer = e.target as L.Path;
      const feature = (e.target as L.Layer & { feature: GeoJSON.Feature })
        .feature;
      const rawName = feature?.properties?.name || "";
      const countryName = normalizeCountryName(rawName);

      console.log("Clicked:", rawName, "->", countryName);

      const universities = universitiesByCountry[countryName];
      if (!universities || universities.length === 0) return;

      if (mapRef.current) {
        mapRef.current.setMaxBounds(null as any);

        // Zoom Logic
        const largeCountries: Record<
          string,
          { center: L.LatLngTuple; zoom: number }
        > = {
          USA: { center: [39.8283, -98.5795], zoom: 4 },
          Canada: { center: [56.1304, -106.3468], zoom: 3 },
          Russia: { center: [61.524, 105.3188], zoom: 3 },
          China: { center: [35.8617, 104.1954], zoom: 4 },
          Australia: { center: [-25.2744, 133.7751], zoom: 4 },
          Brazil: { center: [-14.235, -51.9253], zoom: 4 },
        };

        if (largeCountries[countryName]) {
          mapRef.current.setView(
            largeCountries[countryName].center,
            largeCountries[countryName].zoom,
            { animate: true, duration: 0.6 }
          );
        } else {
          let bounds;
          if (typeof (layer as any).getBounds === "function") {
            bounds = (layer as any).getBounds();
          } else if (feature?.geometry) {
            const tempLayer = L.geoJSON(feature);
            bounds = tempLayer.getBounds();
          }
          if (bounds) {
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 6,
              animate: true,
              duration: 0.6,
            });
          }
        }

        setTimeout(() => {
          if (mapRef.current) {
            const currentBounds = mapRef.current.getBounds();
            mapRef.current.setMaxBounds(currentBounds.pad(0.5));
          }
        }, 700);

        setSelectedCountry(countryName);
        selectedCountryRef.current = countryName;

        if (geojsonLayerRef.current) {
          geojsonLayerRef.current.setStyle((feature) => {
            const fName = normalizeCountryName(feature?.properties?.name || "");
            if (fName !== countryName)
              return {
                weight: 0.5,
                color: "#cbd5e1",
                fillColor: "#f8fafc",
                fillOpacity: 0.2,
              };
            return {
              weight: 1.5,
              color: "#475569",
              fillColor: getCountryColor(feature),
              fillOpacity: 0.8,
            };
          });
        }

        if (universityMarkersRef.current)
          universityMarkersRef.current.clearLayers();
        else
          universityMarkersRef.current = L.layerGroup().addTo(mapRef.current);

        universities.forEach((universityName) => {
          const isAllMode = mapMode === "all";
          const isReviewMode = mapMode === "reviews";

          let universityData: any[] = [];
          let universityInfo: UniversityData | undefined;

          if (isAllMode) {
            universityInfo = allUniversities.find(
              (u) => u.name === universityName
            );
            if (!universityInfo) return;
          } else {
            // Normalize university name for matching
            const normalizeUniversityName = (name: string): string => {
              // Try to find matching key in coordinates
              if (universityCoordinates[name]) return name;
              // Try case-insensitive
              const caseMatch = Object.keys(universityCoordinates).find(
                (key) => key.toLowerCase() === name.toLowerCase()
              );
              if (caseMatch) return caseMatch;
              // Try partial matching
              const normalizedName = name.toLowerCase().trim();
              const partialMatch = Object.keys(universityCoordinates).find(
                (key) => {
                  const normalizedKey = key.toLowerCase().trim();
                  const coordData = universityCoordinates[key];
                  return (
                    normalizedKey.includes(normalizedName) ||
                    normalizedName.includes(normalizedKey) ||
                    (coordData.city &&
                      (coordData.city.toLowerCase() === normalizedName ||
                        normalizedName.includes(coordData.city.toLowerCase()) ||
                        coordData.city.toLowerCase().includes(normalizedName)))
                  );
                }
              );
              return partialMatch || name; // Return original if no match found
            };

            const normalizedName = normalizeUniversityName(universityName);

            universityData = isReviewMode
              ? allExchanges.filter((ex) => {
                  const normalizedExName = normalizeUniversityName(
                    ex.university
                  );
                  return normalizedExName === normalizedName;
                })
              : plannedExchanges.filter((ex) => {
                  const normalizedExName = normalizeUniversityName(
                    ex.university
                  );
                  return normalizedExName === normalizedName;
                });
            if (universityData.length === 0) return;
            
            // Use normalized name for coordinates lookup
            universityName = normalizedName;
          }

          let coords =
            isAllMode && universityInfo
              ? { lat: universityInfo.lat, lng: universityInfo.lng }
              : universityCoordinates[universityName];

          // Try alternative name matching if exact match fails
          if (!coords) {
            // Try removing "The " prefix
            if (universityName.startsWith("The ")) {
              coords = universityCoordinates[universityName.substring(4)];
            }
            // Try case-insensitive matching
            if (!coords) {
              const matchingKey = Object.keys(universityCoordinates).find(
                (key) => key.toLowerCase() === universityName.toLowerCase()
              );
              if (matchingKey) {
                coords = universityCoordinates[matchingKey];
              }
            }
            // Try partial matching (e.g., "Padova" matches "Università degli Studi di Padova")
            if (!coords) {
              const normalizedName = universityName.toLowerCase().trim();
              const matchingKey = Object.keys(universityCoordinates).find(
                (key) => {
                  const normalizedKey = key.toLowerCase().trim();
                  const coordData = universityCoordinates[key];
                  // Check if university name contains the key or vice versa
                  return (
                    normalizedKey.includes(normalizedName) ||
                    normalizedName.includes(normalizedKey) ||
                    // Special case: check if city name matches (e.g., "Padova" matches "Padua" city)
                    (coordData.city &&
                      (coordData.city.toLowerCase() === normalizedName ||
                        normalizedName.includes(coordData.city.toLowerCase()) ||
                        coordData.city.toLowerCase().includes(normalizedName)))
                  );
                }
              );
              if (matchingKey) {
                coords = universityCoordinates[matchingKey];
              }
            }
          }
          if (!coords) {
            console.warn(
              `No coordinates found for university: ${universityName}`
            );
            return;
          }

          const markerColor = isAllMode
            ? "#10b981"
            : isReviewMode
            ? "#f59e0b"
            : "#6366f1";
          const count = isAllMode ? "" : universityData.length;
          const showCount = count && count > 1;

          const markerHtml = `
            <div style="
              background-color: ${markerColor};
              width: ${showCount ? "28px" : "20px"};
              height: ${showCount ? "28px" : "20px"};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: 700; font-size: 11px;
            ">${showCount ? count : ""}</div>`;

          const marker = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
              className: "",
              html: markerHtml,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          });

          const isMobile =
            typeof window !== "undefined" && window.innerWidth <= 768;
          const commonButtonStyles = `width: 100%; margin-top: 12px; padding: 10px 0; background: ${markerColor}; color: white; border: none; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; min-height: 44px;`;
          const wrapperStyle = `padding: 16px; min-width: ${
            isMobile ? "280px" : "240px"
          }; max-width: calc(100vw - 32px); box-sizing: border-box;`;
          let popupContent = "";

          if (isAllMode && universityInfo) {
            const hasExperiences = allExchanges.some(
              (e) => e.university === universityName
            );
            const btnStyle = hasExperiences
              ? commonButtonStyles
              : `width: 100%; margin-top: 12px; padding: 10px 0; background: #cbd5e1; color: #64748b; border: none; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: not-allowed;`;
            const btnText = hasExperiences
              ? "Se erfaringer"
              : "Ingen erfaringer";
            const btnId = `view-all-${universityName.replace(/\s+/g, "-")}`;

            popupContent = `
              <div style="${wrapperStyle}">
                ${
                  universityInfo.imageUrl
                    ? `<div style="width: 100%; height: 140px; overflow: hidden; border-radius: 12px; margin-bottom: 12px;"><img src="${universityInfo.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`
                    : ""
                }
                <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${
                  universityInfo.name
                }</h3>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">${
                  universityInfo.city
                }, ${universityInfo.country}</p>
                <button id="${btnId}" style="${btnStyle}" ${
              !hasExperiences ? "disabled" : ""
            }>${btnText}</button>
              </div>`;
          } else if (isReviewMode) {
            const reviews = universityData as Exchange[];
            const img = reviews[0]?.imageUrl;
            popupContent = `
               <div style="${wrapperStyle}">
                ${
                  img
                    ? `<div style="width: 100%; height: 120px; overflow: hidden; border-radius: 12px; margin-bottom: 12px;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`
                    : ""
                }
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${universityName}</h3>
                <div style="display:flex; gap:8px; margin-bottom:12px;"><span style="background:#fff7ed; color:#c2410c; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600;">${
                  reviews.length
                } anmeldelse${reviews.length !== 1 ? "r" : ""}</span></div>
                <button id="view-all-${universityName.replace(
                  /\s+/g,
                  "-"
                )}" style="${commonButtonStyles}">Les alle erfaringer</button>
              </div>`;
          } else {
            const planned = universityData as PlannedExchange[];
            const universityImage = planned[0]?.imageUrl;
            const isLoggedIn = !!session?.user;

            popupContent = `
               <div style="${wrapperStyle}">
                ${
                  universityImage
                    ? `
                  <div style="width: 100%; height: 120px; overflow: hidden; border-radius: 12px; margin-bottom: 12px;">
                    <img src="${universityImage}" alt="${universityName}"
                      style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                `
                    : ""
                }
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                  ${universityName}
                </h3>
                 <div style="display:flex; gap:8px; margin-bottom:12px;">
                  <span style="background:#eef2ff; color:#4338ca; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600;">
                    ${planned.length} student${
              planned.length !== 1 ? "er" : ""
            } planlegger å dra hit
                  </span>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:8px; max-height: ${
                  isMobile ? "none" : "220px"
                }; overflow-y: ${
              isMobile ? "visible" : "auto"
            }; padding-right: 4px;">
                ${planned
                  .map((ex) => {
                    let actionHtml = "";
                    if (ex.contactStatus === "none" && isLoggedIn) {
                      // Using the exact button text requested
                      actionHtml = `
                        <button 
                          onclick="window.askToShareName(${
                            ex.userId
                          }, '${ex.study.replace(/'/g, "\\'")}')" 
                          style="
                            margin-top:6px; 
                            width:100%; 
                            padding:6px; 
                            background:#3b82f6; 
                            color:white; 
                            border:none; 
                            border-radius:6px; 
                            font-size:11px; 
                            font-weight:600; 
                            cursor:pointer;
                            transition: background 0.2s;
                          "
                          onmouseover="this.style.backgroundColor='#2563eb'"
                          onmouseout="this.style.backgroundColor='#3b82f6'"
                        >
                          Spør om å dele navn
                        </button>`;
                    } else if (ex.contactStatus === "none" && !isLoggedIn) {
                      actionHtml = `<div style="margin-top:4px; font-size:10px; color:#64748b; font-style:italic; text-align:center;">Logg inn for å kontakte</div>`;
                    } else if (ex.contactStatus === "pending_sent") {
                      actionHtml = `<div style="margin-top:4px; font-size:10px; color:#64748b; font-style:italic; text-align:center;">Forespørsel sendt</div>`;
                    } else if (ex.contactStatus === "accepted") {
                      actionHtml = `<div style="margin-top:4px; font-size:11px; color:#166534; font-weight:600; text-align:center;">✓ Kontakt opprettet</div>`;
                    } else if (ex.contactStatus === "self") {
                      actionHtml = `<div style="margin-top:4px; font-size:10px; color:#64748b; font-style:italic; text-align:center;">(Deg selv)</div>`;
                    }

                    return `
                      <div style="padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <div style="font-weight:600; font-size:13px; color:#334155;">${ex.studentName}</div>
                        </div>
                        <div style="font-size:11px; color:#64748b; margin-top:2px;">Studie: ${ex.study}</div>
                        ${actionHtml}
                      </div>
                    `;
                  })
                  .join("")}
                </div>
                
                <!-- "Se alle" button removed as requested -->
              </div>
             `;
          }

          marker.bindPopup(popupContent, {
            closeButton: true,
            autoPan: true,
            autoPanPadding: isMobile ? [20, 20] : [50, 50],
            offset: [0, -10],
            maxWidth: isMobile
              ? window.innerWidth - 40
              : Math.min(
                  400,
                  typeof window !== "undefined" ? window.innerWidth - 32 : 400
                ),
            minWidth: isMobile ? Math.min(300, window.innerWidth - 40) : 240,
            maxHeight: isMobile ? window.innerHeight - 150 : undefined,
            className: isMobile ? "mobile-popup" : "",
          });
          marker.on("popupopen", () => {
            const btn = document.getElementById(
              `view-all-${universityName.replace(/\s+/g, "-")}`
            );
            if (btn)
              btn.addEventListener("click", () => {
                window.location.href = `/erfaringer?university=${encodeURIComponent(
                  universityName
                )}`;
              });
          });
          marker.addTo(universityMarkersRef.current!);
        });
      }
    }

    function onEachFeature(feature: any, layer: L.Layer): void {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: onClickFeature,
      });
    }

    if (geojsonLayerRef.current && mapRef.current)
      mapRef.current.removeLayer(geojsonLayerRef.current);
    if (mapRef.current) {
      geojsonLayerRef.current = L.geoJSON(
        geoJsonData as GeoJSON.FeatureCollection,
        { style: style, onEachFeature: onEachFeature }
      ).addTo(mapRef.current);
    }
  }, [
    universitiesByCountry,
    allExchanges,
    plannedExchanges,
    universityCoordinates,
    mapMode,
    geoJsonData,
    selectedCountry,
    session,
  ]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.setMaxBounds(L.latLngBounds([-90, -180], [90, 180]));
      mapRef.current.setView([20, 0], 2, { animate: true, duration: 0.5 });

      if (universityMarkersRef.current) {
        universityMarkersRef.current.clearLayers();
      }

      setSelectedCountry(null);
      selectedCountryRef.current = null;

      if (geojsonLayerRef.current) {
        geojsonLayerRef.current.eachLayer((layer) =>
          geojsonLayerRef.current!.resetStyle(layer)
        );
      }
    }
  };

  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll attempts without Ctrl key (desktop only)
  useEffect(() => {
    if (isMobile) return; // Don't show hint on mobile

    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setShowScrollHint(true);
        // Hide hint after 2 seconds
        setTimeout(() => setShowScrollHint(false), 2000);
      } else {
        setShowScrollHint(false);
      }
    };

    mapDiv.addEventListener("wheel", handleWheel, { passive: false }); // passive:false allows creating side effects but we don't prevent default here to allow page scroll

    return () => {
      mapDiv.removeEventListener("wheel", handleWheel);
    };
  }, [isMobile]);

  return (
    <div
      className="map-container"
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 4rem)", // Full height minus navbar
        marginTop: "0",
        backgroundColor: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <div id="map" style={{ width: "100%", height: "100%", zIndex: 1 }}></div>

      {/* Zoom Hint Overlay - Hidden on mobile */}
      {!isMobile && (
        <div
          className="zoom-hint"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3000,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            pointerEvents: "none",
            opacity: showScrollHint ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          Hold{" "}
          {typeof window !== "undefined" && navigator.platform.includes("Mac")
            ? "Cmd"
            : "Ctrl"}{" "}
          for å zoome
        </div>
      )}

      {isLoading && (
        <div
          className="loading-indicator"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            padding: "24px 32px",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <div
            style={{
              fontSize: "14px",
              color: "#475569",
              fontWeight: "600",
              letterSpacing: "-0.01em",
            }}
          >
            Laster kartdata...
          </div>
        </div>
      )}

      {!selectedCountry && (
        <div
          className="mode-selector"
          style={{
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex",
            padding: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            borderRadius: "12px",
            boxShadow:
              "0 4px 12px -2px rgba(0,0,0,0.15), 0 2px 4px -1px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.8)",
            gap: "4px",
          }}
        >
          {[
            { id: "all", label: "Alle", color: "#10b981" },
            { id: "reviews", label: "Erfaringer", color: "#f59e0b" },
            { id: "planned", label: "Planlagt", color: "#6366f1" },
          ].map((mode) => {
            const isActive = mapMode === mode.id;
            return (
              <button
                key={mode.id}
                className="mode-button"
                onClick={() => setMapMode(mode.id as any)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: isActive ? "white" : "transparent",
                  color: isActive ? "#0f172a" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? "700" : "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "40px",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: mode.color,
                    opacity: isActive ? 1 : 0.6,
                    transition: "opacity 0.2s ease",
                  }}
                ></div>
                {mode.label}
              </button>
            );
          })}
        </div>
      )}

      {!selectedCountry && mapMode === "planned" && (
        <div
          className="semester-filter"
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex",
            padding: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            borderRadius: "10px",
            boxShadow: "0 2px 8px -1px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.8)",
            gap: "4px",
          }}
        >
          {(() => {
            const now = new Date();
            const currentMonth = now.getMonth();
            let currentSemester: string, currentSemesterYear: number;
            let nextSemester: string, nextYear: number;

            if (currentMonth <= 6) {
              currentSemester = "Vår";
              currentSemesterYear = now.getFullYear();
              nextSemester = "Høst";
              nextYear = now.getFullYear();
            } else {
              currentSemester = "Høst";
              currentSemesterYear = now.getFullYear();
              nextSemester = "Vår";
              nextYear = now.getFullYear() + 1;
            }

            return [
              {
                id: "next",
                label: `${currentSemester} ${currentSemesterYear}`,
              },
              { id: "after", label: `${nextSemester} ${nextYear}` },
            ].map((filter) => {
              const isActive = plannedSemesterFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() =>
                    setPlannedSemesterFilter(filter.id as "next" | "after")
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isActive ? "white" : "transparent",
                    color: isActive ? "#6366f1" : "#64748b",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isActive ? "700" : "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    minHeight: "36px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {filter.label}
                </button>
              );
            });
          })()}
        </div>
      )}

      {selectedCountry && (
        <button
          className="reset-button"
          onClick={resetView}
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            backgroundColor: "white",
            color: "#0f172a",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow:
              "0 4px 12px -2px rgba(0,0,0,0.15), 0 2px 4px -1px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "44px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateX(-50%) translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px -2px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px -2px rgba(0,0,0,0.15), 0 2px 4px -1px rgba(0,0,0,0.1)";
          }}
        >
          <span style={{ fontSize: "16px" }}>←</span> Tilbake til verden
        </button>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Spør om å dele navn?
            </h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Du vil nå spørre studenten fra{" "}
              <strong className="text-slate-900">{confirmModal.name}</strong> om
              å dele navn.
              <br />
              <br />
              Begge deres navn vil bli synlig dersom forespørselen aksepteres.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }
                disabled={isSendingRequest}
                className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avbryt
              </button>
              <button
                onClick={handleConfirmRequest}
                disabled={isSendingRequest}
                className="flex-1 py-2.5 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors text-sm flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sender...
                  </>
                ) : (
                  "Send forespørsel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapChart;
