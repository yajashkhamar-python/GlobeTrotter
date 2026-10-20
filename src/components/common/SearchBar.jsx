import React from 'react';
import { Search } from 'lucide-react';
import './common.css';

export default function SearchBar({ placeholder = 'Search...', value, onChange, className = '' }) {
  return (
    <div className={`search-bar-wrapper ${className}`}>
      <Search size={17} className="search-bar-icon" />
      <input
        type="search"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}
