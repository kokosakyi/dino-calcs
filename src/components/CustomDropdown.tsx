import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  label,
  className = ''
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.id === value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex].id);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.id === value);
      const prevIndex = (currentIndex - 1 + options.length) % options.length;
      onChange(options[prevIndex].id);
    }
  };

  return (
    <div className={`custom-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <label className="dropdown-label">{label}</label>
      <div
        className={`custom-dropdown ${isOpen ? 'open' : ''}`}
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="dropdown-selected">
          <span className="dropdown-selected-label">{selectedOption?.label}</span>
          {selectedOption?.sublabel && (
            <span className="dropdown-selected-sublabel">{selectedOption.sublabel}</span>
          )}
          <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        {isOpen && (
          <div className="dropdown-menu" role="listbox">
            {options.map(option => (
              <div
                key={option.id}
                className={`dropdown-option ${option.id === value ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.id);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.id === value}
              >
                <span className="option-label">{option.label}</span>
                {option.sublabel && (
                  <span className="option-sublabel">{option.sublabel}</span>
                )}
                {option.id === value && (
                  <svg className="option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
