export enum Category {
  WOMEN = 'Women',
  MEN = 'Men',
  ACCESSORIES = 'Accessories',
  WATCHES = 'Watches',
  BAGS = 'Bags'
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  rentalPrice: number;
  retailPrice: number;
  images: string[]; // Changed from single imageUrl to array
  description: string;
  availableSizes: string[];
  color: string;
  occasion: string;
  reviews: Review[];
}

export interface ProductFilter {
  category: Category | 'All';
  searchQuery: string;
  color: string;
  size: string;
  occasion: string;
  maxPrice: number;
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