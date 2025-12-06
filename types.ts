

export enum Category {
  WOMEN = 'Women',
  MEN = 'Men',
  ACCESSORIES = 'Accessories',
  WATCHES = 'Watches',
  BAGS = 'Bags'
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc';
export type Role = 'User' | 'Partner' | 'Admin';
export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
export type OrderStatus = 'Processing' | 'Pending Approval' | 'Accepted' | 'Shipped' | 'Completed' | 'Returned' | 'Cancelled' | 'Rejected';

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
  buyPrice?: number;
  isForSale?: boolean;
  ownerId?: string;
  images: string[];
  description: string;
  availableSizes: string[];
  color: string;
  occasion: string;
  condition?: string;
  reviews: Review[];
  rentalCount?: number;
  autoSellAfterRentals?: number;
  rentalDuration?: number;
}

export interface ProductFilter {
  category: Category | 'All';
  searchQuery: string;
  color: string;
  size: string;
  occasion: string;
  maxPrice: number;
  sortBy: SortOption;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'Credit' | 'Debit' | 'Withdrawal' | 'Fee';
  amount: number;
  description: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Failed';
  paymentMethod?: string; // e.g. "Wallet", "Bank Transfer", "Card ending ****"
}

export interface UserProfile {
  name: string;
  memberSince: string;
  subscriptionTier: 'Gold' | 'Platinum' | 'Diamond';
  activeRentals: number;
}