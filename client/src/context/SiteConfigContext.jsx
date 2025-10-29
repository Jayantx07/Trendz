import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api.js';

const SiteConfigContext = createContext({ config: null, loading: true });

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch('/site-config')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => { if (!mounted) return; setConfig(data || {}); })
      .catch(() => { if (!mounted) return; setConfig({}); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({ config, loading }), [config, loading]);
  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);
