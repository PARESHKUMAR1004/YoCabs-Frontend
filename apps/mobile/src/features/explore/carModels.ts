import type { ExplorePartnerVehicle, VehicleCategory } from '@yocabs/api-client';
import { modelKey } from '@/features/tourist/carModel';

/** One car model available around the tourist, however many partners run it. */
export interface CarModel {
  key: string;
  /** "Dzire" */
  model: string;
  /** "Maruti Suzuki" */
  make: string;
  category: VehicleCategory;
  cabCount: number;
  partnerCount: number;
  /** A photo of one of them, if any partner has added one. */
  photo: string | null;
}

/** Groups cabs by model, most widely available first, then by name. */
export function groupCarsByModel(cars: ExplorePartnerVehicle[]): CarModel[] {
  const groups = new Map<string, { model: CarModel; partners: Set<string> }>();

  for (const { partnerId, vehicle } of cars) {
    const key = `${vehicle.category}:${modelKey(vehicle.model)}`;
    const group = groups.get(key) ?? {
      model: {
        key,
        model: vehicle.model.trim(),
        make: vehicle.make.trim(),
        category: vehicle.category,
        cabCount: 0,
        partnerCount: 0,
        photo: null,
      },
      partners: new Set<string>(),
    };

    group.model.cabCount += 1;
    group.partners.add(partnerId);
    group.model.photo ??= vehicle.photos[0] ?? null;
    groups.set(key, group);
  }

  return [...groups.values()]
    .map(({ model, partners }) => ({ ...model, partnerCount: partners.size }))
    .sort((a, b) => b.cabCount - a.cabCount || a.model.localeCompare(b.model));
}

/** The vehicle types that have at least one cab, in a steady order. */
export function categoriesOfCars(cars: ExplorePartnerVehicle[]): VehicleCategory[] {
  return [...new Set(cars.map((car) => car.vehicle.category))].sort();
}
