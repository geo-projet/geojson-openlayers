'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OLMap from '@/components/Map';
import LayerSwitcher, { basemaps } from '@/components/LayerSwitcher';

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedBasemap, setSelectedBasemap] = useState(basemaps[0].id);
  const [thematicLayerVisible, setThematicLayerVisible] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/data');
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
          }
          const data = await response.json();
          setGeojsonData(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen"><p>Chargement de la session...</p></div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className="h-screen flex flex-col">
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10">
        <div>
          <h1 className="text-xl font-bold">Votre Carte Personnalisée</h1>
          <p className="text-sm text-gray-500">Connecté en tant que {session.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Déconnexion
        </button>
      </header>

      <div className="flex-grow relative">
        {geojsonData ? (
          <>
            <LayerSwitcher 
              selectedBasemap={selectedBasemap} 
              onBasemapChange={setSelectedBasemap} 
              thematicLayerVisible={thematicLayerVisible}
              onThematicLayerToggle={setThematicLayerVisible}
            />
            <OLMap 
              geojsonData={geojsonData} 
              basemapId={selectedBasemap} 
              thematicLayerVisible={thematicLayerVisible} 
            />
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>Chargement de la carte...</p>
          </div>
        )}
      </div>
    </main>
  );
}