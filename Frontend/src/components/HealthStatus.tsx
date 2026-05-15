import React from 'react';
import { getHealth } from '../api/datasets';

function HealthStatus() {
  const [status, setStatus] = React.useState<'ok' | 'error' | 'loading'>('loading');

  React.useEffect(() => {
    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <span className="text-yellow-500">Checando backend...</span>;
  if (status === 'ok') return <span className="text-green-600">Backend disponible</span>;
  return <span className="text-red-600">Backend NO disponible</span>;
}

export default HealthStatus;
