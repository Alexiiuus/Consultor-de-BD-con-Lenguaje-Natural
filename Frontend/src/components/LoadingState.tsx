import React from 'react';
export const LoadingState: React.FC<{text?:string}> = ({text}) => (
  <div className="text-center text-lg text-gray-500 animate-pulse p-6">{text || 'Cargando...'}</div>
);
export default LoadingState;
