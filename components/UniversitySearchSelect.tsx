'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface UniversityOption {
  value: string;
  label: string;
  country?: string;
  university?: string;
  city?: string;
}

interface UniversitySearchSelectProps {
  options: UniversityOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function UniversitySearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Søk etter universitet...',
  className = '',
  required = false,
}: UniversitySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter and search options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase().trim();
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const country = option.country?.toLowerCase() || '';
      const university = option.university?.toLowerCase() || '';
      const city = option.city?.toLowerCase() || '';

      // Check if query matches anywhere in label, country, university, or city
      return (
        label.includes(query) ||
        country.includes(query) ||
        university.includes(query) ||
        city.includes(query)
      );
    });
  }, [options, searchQuery]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length, searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredOptions, highlightedIndex, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            size={16}
          />
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? searchQuery : selectedOption?.label || ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
          />
          {value && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                inputRef.current?.focus();
              } else {
                setSearchQuery('');
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 sm:max-h-80 overflow-hidden">
          <ul
            ref={listRef}
            className="overflow-y-auto max-h-60 sm:max-h-80 py-2"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                Ingen resultater funnet
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-50 text-gray-900'
                  } ${
                    option.value === value ? 'bg-primary/20 font-medium' : ''
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="text-sm">{option.label}</div>
                  {option.country && option.university && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.country}
                      {option.city && ` • ${option.city}`}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

