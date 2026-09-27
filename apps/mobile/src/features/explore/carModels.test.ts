import type { ExplorePartnerVehicle } from '@yocabs/api-client';
import { categoriesOfCars, groupCarsByModel } from './carModels';

const car = (
  partnerId: string,
  make: string,
  model: string,
  category: ExplorePartnerVehicle['vehicle']['category'],
  photos: string[] = [],
): ExplorePartnerVehicle =>
  ({
    partnerId,
    partnerName: partnerId,
    partnerRating: 0,
    partnerReviewCount: 0,
    vehicle: { id: `${partnerId}-${model}`, make, model, category, photos },
  }) as ExplorePartnerVehicle;

const cars = [
  car('a', 'Maruti Suzuki', 'Dzire', 'SEDAN'),
  car('b', 'Maruti', ' dzire ', 'SEDAN', ['/photo/dzire']),
  car('a', 'Honda', 'City', 'SEDAN'),
  car('c', 'Hyundai', 'Creta', 'SUV', ['/photo/creta']),
  car('c', 'Mahindra', 'XUV700', 'SUV'),
];

describe('groupCarsByModel', () => {
  it('treats spelling and spacing variants of a model as one car', () => {
    const dzire = groupCarsByModel(cars).find((model) => model.key === 'SEDAN:dzire');
    expect(dzire?.cabCount).toBe(2);
    expect(dzire?.partnerCount).toBe(2);
  });

  it('counts a partner once however many of that model they run', () => {
    const models = groupCarsByModel([
      car('a', 'Toyota', 'Innova', 'SUV'),
      car('a', 'Toyota', 'Innova', 'SUV'),
    ]);
    expect(models).toHaveLength(1);
    expect(models[0]).toMatchObject({ cabCount: 2, partnerCount: 1 });
  });

  it('borrows the first photo any partner added', () => {
    const models = groupCarsByModel(cars);
    expect(models.find((model) => model.model === 'Dzire')?.photo).toBe('/photo/dzire');
    expect(models.find((model) => model.model === 'City')?.photo).toBeNull();
  });

  it('puts the most widely available models first', () => {
    expect(groupCarsByModel(cars)[0]?.model).toBe('Dzire');
  });
});

describe('categoriesOfCars', () => {
  it('lists each vehicle type once', () => {
    expect(categoriesOfCars(cars)).toEqual(['SEDAN', 'SUV']);
  });
});
