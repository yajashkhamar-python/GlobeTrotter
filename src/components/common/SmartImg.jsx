import React, { useState, useEffect } from 'react';
import { GENERIC_IMG } from '../../utils/imageResolver';

export default function SmartImg({ src, fallback, alt, className, style, priority = false }) {
  const [imgSrc, setImgSrc] = useState(src || fallback || GENERIC_IMG);
  
  useEffect(() => { 
    setImgSrc(src || fallback || GENERIC_IMG); 
  }, [src, fallback]);
  
  return (
    <img 
      src={imgSrc} 
      alt={alt || ''} 
      className={className} 
      style={style || { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      loading={priority ? undefined : "lazy"}
      onError={() => { 
        if (imgSrc !== (fallback || GENERIC_IMG)) setImgSrc(fallback || GENERIC_IMG); 
        else setImgSrc(GENERIC_IMG); 
      }}
    />
  );
}
