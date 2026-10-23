import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MissingPersonReport } from '../../types';

interface CaseMapProps {
  cases: MissingPersonReport[];
  selectedCaseId?: string;
  onSelectCase?: (caseItem: MissingPersonReport) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const CaseMap: React.FC<CaseMapProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  height = '500px',
  initialCenter = [22.5937, 78.9629], // Center of India
  initialZoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent accidental scrolling when browsing page
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or cleanup on unmount
    };
  }, []);

  // Update markers when cases change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds = L.latLngBounds([]);
    let validLocationsCount = 0;

    cases.forEach(item => {
      // Must have valid lat/lng and be permitted
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return;
      if (isNaN(item.latitude) || isNaN(item.longitude)) return;

      validLocationsCount++;
      const latLng: [number, number] = [item.latitude, item.longitude];
      bounds.extend(latLng);

      const isSelected = item.id === selectedCaseId;
      const isUrgent = item.priority === 'Critical / Endangered';

      const markerColor = isUrgent ? '#ef4444' : isSelected ? '#0d9488' : '#1e3a8a';
      const pulseHtml = isUrgent
        ? `<div class="absolute -inset-1 rounded-full bg-red-500 opacity-60 animate-ping"></div>`
        : '';

      const customIcon = L.divIcon({
        className: 'custom-mpt-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${pulseHtml}
            <div style="background-color: ${markerColor}" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 font-sans max-w-xs';
      popupContent.innerHTML = `
        <div class="flex gap-3 items-start">
          <img src="${item.photoUrl}" alt="${item.fullName}" class="w-16 h-16 rounded object-cover border border-slate-200" />
          <div>
            <div class="text-xs font-semibold text-teal-700 uppercase tracking-wider">${item.referenceNumber}</div>
            <h4 class="font-bold text-slate-900 text-sm leading-tight">${item.fullName} (${item.age} yrs)</h4>
            <p class="text-xs text-slate-600 mt-1">
              <strong>Last Seen:</strong> ${item.lastSeenCity}, ${item.lastSeenState}<br/>
              <strong>Date:</strong> ${item.dateLastSeen}
            </p>
            <div class="mt-1">
              <span class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                isUrgent ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
              }">
                ${item.status}
              </span>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-amber-800 bg-amber-50 rounded p-1.5 mt-2 border border-amber-200">
          <strong>Privacy note:</strong> Marker denotes general last-seen vicinity, not exact residence or current location.
        </p>
        <button id="view-case-btn-${item.id}" class="mt-2 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded text-center transition cursor-pointer">
          View Case & Submit Sighting &rarr;
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-case-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectCase) onSelectCase(item);
          };
        }
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    if (validLocationsCount > 0 && mapInstanceRef.current) {
      if (cases.length === 1 && typeof cases[0].latitude === 'number') {
        mapInstanceRef.current.setView([cases[0].latitude, cases[0].longitude], 12);
      } else if (validLocationsCount > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [cases, selectedCaseId, onSelectCase]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-slate-700 shadow border border-slate-200 pointer-events-none flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-900 inline-block"></span> Standard Case
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ml-2"></span> Critical / Endangered
      </div>
    </div>
  );
};
