'use client';

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import type Feature from 'ol/Feature';
import type { FeatureLike } from 'ol/Feature';
import MapBrowserEvent, { type MapEventType } from 'ol/MapBrowserEvent';
import 'ol/ol.css';

interface MapProps {
  geojsonData: GeoJSON.FeatureCollection | null;
  basemapId: string;
  thematicLayerVisible: boolean;
}

// Définition des couches de fond de carte
const basemapLayers = {
  osm: new TileLayer({
    source: new OSM(),
    properties: { id: 'osm' },
  }),
  'carto-light': new TileLayer({
    source: new XYZ({
      url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attributions: '© CartoDB, © OpenStreetMap contributors',
    }),
    properties: { id: 'carto-light' },
  }),
  'carto-dark': new TileLayer({
    source: new XYZ({
      url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attributions: '© CartoDB, © OpenStreetMap contributors',
    }),
    properties: { id: 'carto-dark' },
  }),
  satellite: new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: '© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }),
    properties: { id: 'satellite' },
  }),
};

export default function OLMap({ geojsonData, basemapId, thematicLayerVisible }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const highlightedFeatureRef = useRef<Feature | null>(null);
  const highlightStyle = new Style({
    fill: new Fill({ color: 'rgba(255, 255, 0, 0.6)' }),
    stroke: new Stroke({ color: '#ffcc00', width: 3 }),
    image: new CircleStyle({ radius: 8, fill: new Fill({ color: '#ffcc00' }) })
  });

  // Initialisation de la carte
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: Object.values(basemapLayers),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  // Gestion du changement de fond de carte
  useEffect(() => {
    if (!mapInstance.current) return;
    Object.values(basemapLayers).forEach(layer => {
      const isVisible = layer.get('id') === basemapId;
      layer.setVisible(isVisible);
    });
  }, [basemapId]);

  // Gestion de la couche de données GeoJSON
  useEffect(() => {
    if (!mapInstance.current || !geojsonData) return;

    const map = mapInstance.current;
    const oldLayer = map.getLayers().getArray().find(layer => layer.get('id') === 'geojson-layer');
    if (oldLayer) {
      map.removeLayer(oldLayer);
    }

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: 'EPSG:3857',
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(0, 150, 255, 0.4)' }),
        stroke: new Stroke({ color: '#003366', width: 2 }),
      }),
      properties: { id: 'geojson-layer' },
    });

    map.addLayer(vectorLayer);

    const extent = vectorSource.getExtent();
    if (extent && isFinite(extent[0])) {
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }
  }, [geojsonData]);

  // Gestion de la visibilité de la couche thématique
  useEffect(() => {
    if (!mapInstance.current) return;
    const thematicLayer = mapInstance.current.getLayers().getArray().find(layer => layer.get('id') === 'geojson-layer');
    if (thematicLayer) {
      thematicLayer.setVisible(thematicLayerVisible);
    }
  }, [thematicLayerVisible]);

  // Gestion du clic sur la carte pour surligner la feature vectorielle
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    function handleClick(evt: unknown) {
      let featureFound = false;
      // @ts-expect-error: evt has pixel property at runtime
      map.forEachFeatureAtPixel(evt.pixel, (feature: FeatureLike) => {
        featureFound = true;
        if (highlightedFeatureRef.current) {
          highlightedFeatureRef.current.setStyle(undefined);
        }
        (feature as Feature).setStyle(highlightStyle);
        highlightedFeatureRef.current = feature as Feature;
        return true;
      });
      if (!featureFound && highlightedFeatureRef.current) {
        highlightedFeatureRef.current.setStyle(undefined);
        highlightedFeatureRef.current = null;
      }
    }
    map.on('singleclick', handleClick);
    return () => {
      map.un('singleclick', handleClick);
    };
  }, [highlightStyle]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="relative" />;
}
