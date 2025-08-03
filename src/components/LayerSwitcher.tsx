'use client';

import { useState } from 'react';

// Définition des fonds de carte disponibles
export const basemaps = [
  { id: 'osm', name: 'OpenStreetMap' },
  { id: 'carto-light', name: 'Carte Claire' },
  { id: 'carto-dark', name: 'Carte Sombre' },
  { id: 'satellite', name: 'Satellite' },
];

interface LayerSwitcherProps {
  selectedBasemap: string;
  onBasemapChange: (basemapId: string) => void;
  thematicLayerVisible: boolean;
  onThematicLayerToggle: (isVisible: boolean) => void;
}

// Icône SVG pour les couches
const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function LayerSwitcher({
  selectedBasemap,
  onBasemapChange,
  thematicLayerVisible,
  onThematicLayerToggle,
}: LayerSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white rounded-md shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Sélecteur de couches"
      >
        <LayersIcon />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Fonds de carte</h3>
          <div className="space-y-2">
            {basemaps.map((basemap) => (
              <label key={basemap.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="basemap"
                  value={basemap.id}
                  checked={selectedBasemap === basemap.id}
                  onChange={() => onBasemapChange(basemap.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{basemap.name}</span>
              </label>
            ))}
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-semibold mb-2 text-gray-800">Couches thématiques</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={thematicLayerVisible}
                onChange={(e) => onThematicLayerToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Afrique</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
