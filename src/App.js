// src/App.js
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ——— Fix default marker icons in CRA ———
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// ——— FlyTo helper ———
function FlyToMarker({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, zoom, { duration: 1.5 });
  }, [map, position, zoom]);
  return null;
}

export default function App() {
  // base URL for fetches ('' locally, or your GitHub Pages URL in production)
  const base = process.env.PUBLIC_URL || '';

  // your five city markers
  const cities = [
    { id: 'copenhagen', name: 'Copenhagen', coords: [55.6761, 12.5683], zoom: 12 },
    { id: 'aarhus',     name: 'Aarhus',     coords: [56.1629, 10.2039], zoom: 12 },
    { id: 'odense',     name: 'Odense',     coords: [55.4038, 10.4024], zoom: 12 },
    { id: 'aalborg',    name: 'Aalborg',    coords: [57.0488,  9.9217], zoom: 12 },
    { id: 'esbjerg',    name: 'Esbjerg',    coords: [55.4765,  8.4594], zoom: 12 },
  ];

  // state for dynamic, per-city polygons
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityGeoJson,  setCityGeoJson]  = useState(null);

  // state for always-on Copenhagen boroughs
  const [boroughsFeature, setBoroughsFeature] = useState(null);

  // — fetch Copenhagen boroughs on mount —
  useEffect(() => {
    const names = [
      'Indre By', 'Østerbro', 'Nørrebro', 'Vesterbro-Kongens Enghave',
      'Valby', 'Vanløse', 'Brønshøj-Husum', 'Bispebjerg',
      'Amager Øst', 'Amager Vest', 'Dyrehaven'
    ];

    fetch(`${base}/geojson/bydele.json`)
      .then(res => res.json())
      .then((fc) => {
        const features = fc.features.filter(f => {
          const name = f.properties.navn || f.properties.name;
          return names.includes(name);
        });
        if (features.length) {
          setBoroughsFeature({ type: 'FeatureCollection', features });
        } else {
          console.warn('No matching boroughs found in bydele.json');
        }
      })
      .catch(err => console.error('Error loading bydele.json:', err));
  }, [base]);

  // — fetch per-city GeoJSON when a city marker is clicked —
  useEffect(() => {
    if (!selectedCity) return;
    fetch(`${base}/geojson/${selectedCity.id}.json`)
      .then(res => res.json())
      .then(setCityGeoJson)
      .catch(err => console.error('Failed loading city GeoJSON:', err));
  }, [base, selectedCity]);

  return (
    <MapContainer
      center={[56.0, 10.0]}
      zoom={7}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {boroughsFeature && (
        <GeoJSON
          data={boroughsFeature}
          style={() => ({ color: '#0066cc', weight: 2, fillOpacity: 0.1 })}
          onEachFeature={(feature, layer) => {
            const name = feature.properties.navn || feature.properties.name;
            layer.bindTooltip(name, { sticky: true });
            layer.on({
              mouseover: e => e.target.setStyle({ weight: 3, fillOpacity: 0.4 }),
              mouseout:  e => e.target.setStyle({ weight: 2, fillOpacity: 0.1 })
            });
          }}
        />
      )}

      {cities.map(city => (
        <Marker
          key={city.id}
          position={city.coords}
          eventHandlers={{ click: () => setSelectedCity(city) }}
        />
      ))}

      {selectedCity && (
        <FlyToMarker position={selectedCity.coords} zoom={selectedCity.zoom} />
      )}

      {cityGeoJson && (
        <GeoJSON
          data={cityGeoJson}
          style={() => ({ color: '#444', weight: 1, fillOpacity: 0.2 })}
          onEachFeature={(feature, layer) => {
            const name = feature.properties.navn || feature.properties.name;
            layer.bindTooltip(name, { sticky: true });
            layer.on({
              mouseover: e => e.target.setStyle({ weight: 3, fillOpacity: 0.4 }),
              mouseout:  e => e.target.setStyle({ weight: 1, fillOpacity: 0.2 })
            });
          }}
        />
      )}
    </MapContainer>
  );
}
