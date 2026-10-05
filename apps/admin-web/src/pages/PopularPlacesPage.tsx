import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type { PopularPlace } from '@yocabs/api-client';
import { api } from '../api';
import { Card, DataTable, ErrorMessage, PageHeader } from '../components/ui';
import { useAction } from '../hooks';

const KEY = ['popular-places'];

// react-leaflet's default marker icon references image files the bundler doesn't resolve on its
// own; pointing it at the CDN copies is the standard workaround.
const MARKER_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [20.2961, 85.8245]; // Bhubaneswar

// Every "free, no key" tile host (OpenStreetMap's own servers, CARTO's anonymous basemaps) ends up
// blocking or gating embedded apps like this one sooner or later. MapTiler's free tier needs a key
// but is meant for exactly this, and won't suddenly stop working. Sign up at maptiler.com and set
// VITE_MAPTILER_API_KEY (as a Railway build variable for admin-web, since Vite bakes it in at
// build time - see Dockerfile).
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY as string | undefined;

interface DraftPlace {
  id: string | null;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  displayOrder: number;
}

const BLANK: DraftPlace = {
  id: null,
  name: '',
  subtitle: '',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
  displayOrder: 0,
};

function PinPicker({ position, onPick }: { position: [number, number]; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onPick(event.latlng.lat, event.latlng.lng),
  });
  return <Marker position={position} icon={MARKER_ICON} />;
}

export function PopularPlacesPage() {
  const query = useQuery({ queryKey: KEY, queryFn: () => api.popularPlaces.list() });
  const [draft, setDraft] = useState<DraftPlace>(BLANK);

  const create = useAction(
    (input: DraftPlace) =>
      api.admin.popularPlaces.create({
        name: input.name,
        subtitle: input.subtitle || null,
        latitude: input.latitude,
        longitude: input.longitude,
        displayOrder: input.displayOrder,
      }),
    [KEY],
  );
  const update = useAction(
    (input: DraftPlace & { id: string }) =>
      api.admin.popularPlaces.update(input.id, {
        name: input.name,
        subtitle: input.subtitle || null,
        latitude: input.latitude,
        longitude: input.longitude,
        displayOrder: input.displayOrder,
      }),
    [KEY],
  );
  const remove = useAction((id: string) => api.admin.popularPlaces.remove(id), [KEY]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;

    if (draft.id) {
      update.mutate({ ...draft, id: draft.id }, { onSuccess: () => setDraft(BLANK) });
    } else {
      create.mutate(draft, { onSuccess: () => setDraft(BLANK) });
    }
  }

  function edit(place: PopularPlace) {
    setDraft({
      id: place.id,
      name: place.name,
      subtitle: place.subtitle ?? '',
      latitude: place.latitude,
      longitude: place.longitude,
      displayOrder: place.displayOrder,
    });
  }

  const saving = create.isPending || update.isPending;
  const places = query.data ?? [];

  return (
    <>
      <PageHeader title="Popular places" />
      <Card title="What this is">
        <p className="muted">
          The destinations shown as quick picks on the tourist home screen, before anyone types
          anything. Click the map to drop a pin where a place should be, then name it and save.
        </p>
      </Card>

      <Card title={draft.id ? 'Edit a place' : 'Add a place'}>
        {MAPTILER_KEY ? (
          <div className="map-picker">
            <MapContainer
              center={[draft.latitude, draft.longitude]}
              zoom={11}
              style={{ height: 320, width: '100%', borderRadius: 8 }}
            >
              <TileLayer
                url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
                attribution="&copy; OpenStreetMap contributors &copy; MapTiler"
                maxZoom={20}
              />
              <PinPicker
                position={[draft.latitude, draft.longitude]}
                onPick={(latitude, longitude) => setDraft((d) => ({ ...d, latitude, longitude }))}
              />
            </MapContainer>
          </div>
        ) : (
          <p className="muted">
            The map needs a free MapTiler API key to load. Sign up at{' '}
            <a href="https://www.maptiler.com/" target="_blank" rel="noreferrer">
              maptiler.com
            </a>
            , then set <code>VITE_MAPTILER_API_KEY</code> as a Railway variable for this service
            and redeploy. Until then, type coordinates in manually below.
          </p>
        )}

        <form onSubmit={submit} className="inline-form">
          <input
            placeholder="Name (e.g. Puri)"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <input
            placeholder="Subtitle (e.g. Odisha)"
            value={draft.subtitle}
            onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Order"
            title="Display order (lower shows first)"
            value={draft.displayOrder}
            onChange={(e) => setDraft((d) => ({ ...d, displayOrder: Number(e.target.value) || 0 }))}
            style={{ width: 80 }}
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            title="Latitude (used when the map isn't available)"
            value={draft.latitude}
            onChange={(e) => setDraft((d) => ({ ...d, latitude: Number(e.target.value) || 0 }))}
            style={{ width: 110 }}
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            title="Longitude (used when the map isn't available)"
            value={draft.longitude}
            onChange={(e) => setDraft((d) => ({ ...d, longitude: Number(e.target.value) || 0 }))}
            style={{ width: 110 }}
          />
          <button className="primary" disabled={saving}>
            {draft.id ? 'Save changes' : 'Add place'}
          </button>
          {draft.id ? (
            <button type="button" onClick={() => setDraft(BLANK)}>
              Cancel
            </button>
          ) : null}
        </form>
        <p className="muted">
          Pinned at {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)}
        </p>
        {create.isError ? <ErrorMessage error={create.error} /> : null}
        {update.isError ? <ErrorMessage error={update.error} /> : null}
      </Card>

      {remove.isError ? <ErrorMessage error={remove.error} /> : null}
      {query.isError ? (
        <ErrorMessage error={query.error} />
      ) : (
        <DataTable
          rows={places}
          rowKey={(place) => place.id}
          columns={[
            { header: 'Name', cell: (p) => p.name },
            { header: 'Subtitle', cell: (p) => p.subtitle ?? '-' },
            { header: 'Order', cell: (p) => p.displayOrder },
            {
              header: 'Coordinates',
              cell: (p) => `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`,
            },
            {
              header: '',
              align: 'right',
              cell: (p) => (
                <>
                  <button onClick={() => edit(p)}>Edit</button>{' '}
                  <button onClick={() => remove.mutate(p.id)} disabled={remove.isPending}>
                    Delete
                  </button>
                </>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
