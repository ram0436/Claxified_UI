export class Common {
  title: String = "";
  discription: String = "";
  subCategoryId: Number = 0;
  categoryId: Number = 0;
  price: Number = 0;
  pincode: String = "";
  state: String = "";
  city: String = "";
  nearBy: String = "";
  name: String = "";
  mobile: String = "";
  isPremium: Boolean = false;
  isActive: Boolean = true;
  createdBy: Number = 0;
  createdOn: String = "";
  modifiedBy: Number = 0;
  modifiedOn: String = "";
}

// src/app/shared/model/category.model.ts

export enum CategoryId {
  Gadgets = 1,
  Vehicles = 2,
  Properties = 3,
  Jobs = 4,
  ElectronicsAndAppliances = 5,
  Furniture = 6,
  Books = 7,
  SportsAndHobbies = 8,
  Pets = 9,
  Fashion = 10,
  CommercialServices = 11,
}

export const CATEGORY_MAPPING: { [key: string]: string } = {
  [CategoryId.Gadgets]: "Gadgets",
  [CategoryId.Vehicles]: "Vehicles",
  [CategoryId.Properties]: "Properties",
  [CategoryId.Jobs]: "Jobs",
  [CategoryId.ElectronicsAndAppliances]: "Electronics & Appliances",
  [CategoryId.Furniture]: "Furniture",
  [CategoryId.Books]: "Books",
  [CategoryId.SportsAndHobbies]: "Sports & Hobbies",
  [CategoryId.Pets]: "Pets",
  [CategoryId.Fashion]: "Fashion",
  [CategoryId.CommercialServices]: "Commercial Services",
};

export function getCategoryRoute(categoryId: string | number): string {
  const category = CATEGORY_MAPPING[categoryId] || "";
  if (category.includes("Electronics & Appliances")) return "Electronics";
  if (category.includes("Sports & Hobbies")) return "Sports";
  return category;
}

export interface WishlistItem {
  id: number;
  productId: string;
  categoryId: string;
  createdBy: string | null;
  createdOn: string;
}
