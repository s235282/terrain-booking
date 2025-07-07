import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

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
  const base = process.env.PUBLIC_URL || '';

  const cities = [
    { id: 'aalborg',        name: 'Aalborg',        coords: [57.0467,  9.9359],  zoom: 12 },
    { id: 'allinge',       name: 'Allinge',       coords: [55.2778, 14.8014],  zoom: 12 },
    { id: 'fredericia',    name: 'Fredericia',    coords: [55.5667,  9.7500],  zoom: 12 },
    { id: 'frederikshavn', name: 'Frederikshavn', coords: [57.4410, 10.5340],  zoom: 12 },
    { id: 'haderslev',     name: 'Haderslev',     coords: [55.2500,  9.5000],  zoom: 12 },
    { id: 'høvelte',       name: 'Høvelte',       coords: [55.8567, 12.3956],  zoom: 12 },
    { id: 'herning',       name: 'Herning',       coords: [56.1386,  8.9897],  zoom: 12 },
    { id: 'holstebro',     name: 'Holstebro',     coords: [56.3667,  8.6167],  zoom: 12 },
    { id: 'næstved',       name: 'Næstved',       coords: [55.2333, 11.7667],  zoom: 12 },
    { id: 'nørresundby',   name: 'Nørresundby',   coords: [57.0667,  9.9167],  zoom: 12 },
    { id: 'oksbøl',        name: 'Oksbøl',        coords: [55.6258,  8.2792],  zoom: 12 },
    { id: 'rønne',         name: 'Rønne',         coords: [55.0986, 14.7014],  zoom: 12 },
    { id: 'slagelse',      name: 'Slagelse',      coords: [55.4049, 11.3531],  zoom: 12 },
    { id: 'skive',         name: 'Skive',         coords: [56.5667,  9.0333],  zoom: 12 },
    { id: 'skrydstrup',    name: 'Skrydstrup',    coords: [55.2422,  9.2595],  zoom: 12 },
    { id: 'skalstrup',     name: 'Skalstrup',     coords: [55.6500, 12.0833],  zoom: 12 },
    { id: 'thisted',       name: 'Thisted',       coords: [56.9569,  8.6944],  zoom: 12 },
    { id: 'varde',         name: 'Varde',         coords: [55.6211,  8.4806],  zoom: 12 },
    { id: 'vordingborg',   name: 'Vordingborg',   coords: [55.0080, 11.9110],  zoom: 12 },
    { id: 'karup',         name: 'Karup',         coords: [56.3086,  9.1683],  zoom: 12 },
  ];

  const [selectedCity, setSelectedCity] = useState(null);
  const [cityGeoJson,  setCityGeoJson]  = useState(null);
  const [boroughsFeature, setBoroughsFeature] = useState(null);

  // Load Copenhagen boroughs once
  useEffect(() => {
    const names = ["Indgang Vest", "Indgang Øst", "Stampen", "Bøllemosen"];
    fetch(`${base}/geojson/bydele.json`)
      .then(res => res.json())
      .then((fc) => {
        const features = fc.features.filter(f => {
          const n = f.properties.navn || f.properties.name;
          return names.includes(n);
        });
        setBoroughsFeature({ type: 'FeatureCollection', features });
      })
      .catch(console.error);
  }, [base]);

  // Load selected city GeoJSON
  useEffect(() => {
    if (!selectedCity) return;
    fetch(`${base}/geojson/${selectedCity.id}.json`)
      .then(res => res.json())
      .then(setCityGeoJson)
      .catch(console.error);
  }, [base, selectedCity]);

  return (
    <div className="App-layout">
      <Sidebar />

      <MapContainer
        className="map-container"
        center={[56.0, 10.0]}
        zoom={7}
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
    </div>
  );
}
