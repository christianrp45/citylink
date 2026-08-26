'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Navigation, Loader2, X } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

interface LocationSearchPickerProps {
  onSelect: (lat: number, lng: number, label: string) => void;
  onCancel: () => void;
}

function formatShortAddress(result: NominatimResult): string {
  const a = result.address;
  if (!a) return result.display_name.split(',').slice(0, 2).join(', ');
  const parts = [
    a.road,
    a.suburb || a.city || a.town,
    a.state,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : result.display_name.split(',').slice(0, 2).join(', ');
}

export function LocationSearchPicker({ onSelect, onCancel }: LocationSearchPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selected, setSelected] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&accept-language=pt-BR&countrycodes=br`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  function handlePick(result: NominatimResult) {
    const label = formatShortAddress(result);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelected({ lat, lng, label });
    setQuery(label);
    setOpen(false);
    setResults([]);
  }

  async function handleGPS() {
    setGpsLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Reverse geocode to get a readable label
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`
      );
      const data = await res.json();
      const label = formatShortAddress(data) || 'Minha localização';
      setSelected({ lat, lng, label });
      setQuery(label);
      setOpen(false);
    } catch {
      alert('Não foi possível obter sua localização GPS. Verifique as permissões do navegador.');
    } finally {
      setGpsLoading(false);
    }
  }

  function handleConfirm() {
    if (selected) {
      onSelect(selected.lat, selected.lng, selected.label);
    }
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Buscar endereço, bairro ou cidade…"
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSelected(null); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X size={14} />
          </button>
        )}

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((r) => (
              <button
                key={r.place_id}
                onClick={() => handlePick(r)}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <MapPin size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">
                    {formatShortAddress(r)}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {r.display_name.split(',').slice(1, 4).join(',')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GPS button */}
      <button
        onClick={handleGPS}
        disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {gpsLoading
          ? <Loader2 size={13} className="animate-spin text-teal-500" />
          : <Navigation size={13} className="text-teal-500" />}
        {gpsLoading ? 'Obtendo localização…' : 'Usar minha localização atual (GPS)'}
      </button>

      {/* Selected preview */}
      {selected && (
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
          <MapPin size={14} className="text-teal-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-teal-700 truncate">{selected.label}</p>
            <p className="text-[10px] text-teal-500">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-40"
        >
          Confirmar local
        </button>
      </div>
    </div>
  );
}
