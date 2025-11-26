export enum Category {
  WOMEN = 'Women',
  MEN = 'Men',
  ACCESSORIES = 'Accessories',
  WATCHES = 'Watches',
  BAGS = 'Bags'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  rentalPrice: number;
  retailPrice: number;
  imageUrl: string;
  description: string;
  availableSizes: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  subscriptionTier: 'Gold' | 'Platinum' | 'Diamond';
  activeRentals: number;
}