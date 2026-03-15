import { useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search cards...' }: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(timer);
  }, [local, value, onChange]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px 12px 44px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange(''); }}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px',
            padding: '4px', lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  );
}
