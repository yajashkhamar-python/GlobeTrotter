import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function SafeImage({ src, alt, className = "", style = {}, fallbackIcon, fallbackText }) {
  const [error, setError] = useState(false);

  const IconComponent = fallbackIcon || ImageIcon;

  if (!src || error) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--color-surface-alt)',
          color: 'var(--color-text-muted)',
          width: '100%',
          height: '100%',
          ...style 
        }}
      >
        <IconComponent size={32} style={{ marginBottom: fallbackText ? '8px' : '0' }} />
        {fallbackText && <span style={{ fontSize: '12px', fontWeight: 600 }}>{fallbackText}</span>}
      </div>
    );
  }


  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      onError={() => setError(true)}
    />
  );
}
