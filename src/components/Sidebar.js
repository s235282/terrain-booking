import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const [type, setType] = useState(null); // 'skydebane' or 'øvelsesterræn'

  return (
    <aside className="sidebar">
      <section className="filter-group">
        <h3>Type</h3>
        <div className="type-buttons">
          <button
            className={`type-btn ${type === 'skydebane' ? 'selected' : ''}`}
            onClick={() => setType('skydebane')}
          >
            Skydebane
          </button>
          <button
            className={`type-btn ${type === 'øvelsesterræn' ? 'selected' : ''}`}
            onClick={() => setType('øvelsesterræn')}
          >
            Øvelsesterræn
          </button>
        </div>
      </section>

      <section className="filter-group">
        <label htmlFor="date">Dato</label>
        <input id="date" type="date" placeholder="Vælg dato" />
      </section>

      <section className="filter-group">
        <label htmlFor="time">Tidsrum</label>
        <input id="time" type="time" placeholder="Vælg tidsrum" />
      </section>

      <section className="filter-group">
        <label htmlFor="location">Sted</label>
        <select id="location" defaultValue="">
          <option value="" disabled>Vælg sted</option>
          {[
            'Aalborg','Allinge','Fredericia','Frederikshavn','Haderslev',
            'Høvelte','Herning','Holstebro','Næstved','Nørresundby',
            'Oksbøl','Rønne','Slagelse','Skive','Skrydstrup',
            'Skalstrup','Thisted','Varde','Vordingborg','Karup'
          ].map(city => (
            <option key={city} value={city.toLowerCase()}>
              {city}
            </option>
          ))}
        </select>
      </section>

      <button className="search-btn">SØG</button>
    </aside>
  );
}
