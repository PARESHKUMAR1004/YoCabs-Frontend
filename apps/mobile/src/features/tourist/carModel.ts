/** The name of a car as travellers know it: "Dzire", whichever way a partner wrote the make. */
const clean = (text: string) => text.trim().replace(/\s+/g, ' ');

/** Same model, same key: "Dzire" and "dzire " are one car. Makes vary too much to be part of it. */
export const modelKey = (model: string): string => clean(model).toLowerCase();

/** Same brand, same key: "Toyota" and "toyota " are one brand. */
export const brandKey = (make: string): string => clean(make).toLowerCase();

/** "Maruti Suzuki Dzire", without repeating the make when the model already starts with it. */
export function carName(make: string, model: string): string {
  const name = clean(model);
  const maker = clean(make);
  return name.toLowerCase().startsWith(maker.toLowerCase()) ? name : `${maker} ${name}`;
}
