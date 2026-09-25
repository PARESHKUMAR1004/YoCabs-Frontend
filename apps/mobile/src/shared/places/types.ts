export interface Place {
  id: string;
  name: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
}

/**
 * Where places come from. The app depends only on this interface, so Google/Mapbox can replace
 * the built-in providers without touching any screen.
 */
export interface PlaceProvider {
  search(query: string, signal?: AbortSignal): Promise<Place[]>;
  /** Suggestions shown before the person types anything. */
  popular(): Place[];
}
