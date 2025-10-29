import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api.js';
import fallbackMap from '../assets/media-map.json';

const MediaMapContext = createContext({ resolve: (p) => p, ready: false });

export const MediaMapProvider = ({ children }) => {
  const [map, setMap] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/media/map')
      .then((res) => res.ok ? res.json() : { assets: {} })
      .then((data) => {
        if (!isMounted) return;
        const remote = data.assets || {};
        const chosen = Object.keys(remote).length ? remote : (fallbackMap || {});
        setMap(chosen);
        setReady(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setMap(fallbackMap || {});
        setReady(true);
      });
    return () => { isMounted = false; };
  }, []);

  const resolve = useMemo(() => {
    return (path) => {
      if (!path || typeof path !== 'string') return path;
      // Normalize relative path to key form like in migration-output.json
      // Remove leading slash
      const clean = path.replace(/^\//, '').replace(/\\/g, '/');
      // Try exact match
      const hit = map[clean];
      if (hit && hit.url) return hit.url;
      // Try with known root prefixes
      const siteAssetsKey = `site-assets/${clean}`;
      if (map[siteAssetsKey]?.url) return map[siteAssetsKey].url;
      // For images that were converted from webp->jpg etc., try dropping extension
      const noExt = clean.replace(/\.[^/.]+$/, '');
      const alt = Object.entries(map).find(([k]) => k.replace(/\.[^/.]+$/, '') === noExt);
      if (alt?.[1]?.url) return alt[1].url;
      return path; // fallback original
    };
  }, [map]);

  const value = useMemo(() => ({ resolve, ready, raw: map }), [resolve, ready, map]);
  return (
    <MediaMapContext.Provider value={value}>
      {children}
    </MediaMapContext.Provider>
  );
};

export const useMedia = () => useContext(MediaMapContext);
