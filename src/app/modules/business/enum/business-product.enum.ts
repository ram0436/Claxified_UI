export enum PriceUnit {
  Piece = 1,
  Kg = 2,
  Gram = 3,
  Liter = 4,
  Meter = 5,
  Box = 6,
  Set = 7,
  Pack = 8,
  Dozen = 9,
  Pair = 10,
  Bundle = 11,
  Bottle = 12,
  Bag = 13,
  Roll = 14,
  SquareFoot = 15,
  SquareMeter = 16,
}

export enum ProductCondition {
  New = 1,
  Used = 2,
  Refurbished = 3,
}

export enum ProductAvailabilityStatus {
  InStock = 1,
  OutOfStock = 2,
}

export enum WarrantyPeriodUnit {
  Month = 1,
  Year = 2,
}

export const PRICE_UNIT_OPTIONS: { value: PriceUnit; label: string }[] = [
  { value: PriceUnit.Piece, label: "Piece" },
  { value: PriceUnit.Kg, label: "Kg" },
  { value: PriceUnit.Gram, label: "Gram" },
  { value: PriceUnit.Liter, label: "Liter" },
  { value: PriceUnit.Meter, label: "Meter" },
  { value: PriceUnit.Box, label: "Box" },
  { value: PriceUnit.Set, label: "Set" },
  { value: PriceUnit.Pack, label: "Pack" },
  { value: PriceUnit.Dozen, label: "Dozen" },
  { value: PriceUnit.Pair, label: "Pair" },
  { value: PriceUnit.Bundle, label: "Bundle" },
  { value: PriceUnit.Bottle, label: "Bottle" },
  { value: PriceUnit.Bag, label: "Bag" },
  { value: PriceUnit.Roll, label: "Roll" },
  { value: PriceUnit.SquareFoot, label: "Square Foot" },
  { value: PriceUnit.SquareMeter, label: "Square Meter" },
];

export const PRODUCT_CONDITION_OPTIONS: {
  value: ProductCondition;
  label: string;
}[] = [
  { value: ProductCondition.New, label: "New" },
  { value: ProductCondition.Used, label: "Used" },
  { value: ProductCondition.Refurbished, label: "Refurbished" },
];

export const AVAILABILITY_STATUS_OPTIONS: {
  value: ProductAvailabilityStatus;
  label: string;
}[] = [
  { value: ProductAvailabilityStatus.InStock, label: "In Stock" },
  { value: ProductAvailabilityStatus.OutOfStock, label: "Out of Stock" },
];

export const WARRANTY_PERIOD_UNIT_OPTIONS: {
  value: WarrantyPeriodUnit;
  label: string;
}[] = [
  { value: WarrantyPeriodUnit.Month, label: "Month(s)" },
  { value: WarrantyPeriodUnit.Year, label: "Year(s)" },
];

export enum EntityType {
  Product = 1,
  Service = 2,
}
