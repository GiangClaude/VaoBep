import { useState } from 'react';

export default function ImageWithFallBack({ src, alt, className, ...props }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <div 
        className={`bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center ${className}`}
        {...props}
      >
        <svg 
          className="w-12 h-12 text-orange-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div 
          className={`bg-gradient-to-br from-orange-50 to-yellow-50 animate-pulse ${className}`}
          {...props}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}