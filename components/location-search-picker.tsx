'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Navigation, Loader2, X, GripVertical } from 'lucide-react';

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

// ── Leaflet map with draggable marker (loaded dynamically — no SSR) ─────────

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

// Recenter the map whenever coords change
const MapRecenter = dynamic(
  () =>
    import('react-leaflet').then((m) => {
      function Controller({ lat, lng }: { lat: number; lng: number }) {
        const map = m.useMap();
        useEffect(() => {
          map.setView([lat, lng], map.getZoom());
        }, [lat, lng, map]);
        return null;
      }
      return { default: Controller };
    }),
  { ssr: false },
);

interface MiniMapProps {
  lat: number;
  lng: number;
  onDragEnd: (lat: number, lng: number) => void;
}

function MiniMap({ lat, lng, onDragEnd }: MiniMapProps) {
  // Import leaflet icon only in browser so SSR is safe
  const [icon, setIcon] = useState<import('leaflet').Icon | null>(null);

  useEffect(() => {
    import('leaflet').then((L) => {
      setIcon(
        new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      );
    });
  }, []);

  if (!icon) return null;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '200px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <MapRecenter lat={lat} lng={lng} />
      <Marker
        position={[lat, lng]}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = (e.target as import('leaflet').Marker).getLatLng();
            onDragEnd(pos.lat, pos.lng);
          },
        }}
      />
    </MapContainer>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function LocationSearchPicker({ onSelect, onCancel }: LocationSearchPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
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
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }),
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`,
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

  // Called when user drags the marker to a new position
  async function handleMarkerDrag(lat: number, lng: number) {
    setSelected((prev) => (prev ? { ...prev, lat, lng } : prev));
    // Silently reverse-geocode in the background to update the label
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`,
      );
      const data = await res.json();
      const label = formatShortAddress(data) || 'Local selecionado';
      setSelected({ lat, lng, label });
      setQuery(label);
    } catch {
      // keep old label if reverse fails
    } finally {
      setReverseLoading(false);
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
            onClick={() => {
              setQuery('');
              setSelected(null);
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
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
      {!selected && (
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
      )}

      {/* Map + draggable marker */}
      {selected && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-teal-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-teal-700 flex-1 truncate">{selected.label}</p>
            {reverseLoading && <Loader2 size={11} className="animate-spin text-teal-400 flex-shrink-0" />}
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <MiniMap
              lat={selected.lat}
              lng={selected.lng}
              onDragEnd={handleMarkerDrag}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow text-[10px] text-slate-500 flex items-center gap-1 pointer-events-none z-[400]">
              <GripVertical size={10} />
              Arraste o marcador para ajustar
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
          </p>
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
          disabled={!selected || reverseLoading}
          className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-40"
        >
          Confirmar local
        </button>
      </div>
    </div>
  );
}
