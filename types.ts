
export enum Category {
  WOMEN = 'Women',
  MEN = 'Men',
  ACCESSORIES = 'Accessories',
  WATCHES = 'Watches',
  BAGS = 'Bags'
}

export type FabricType = 'flowing' | 'rigid' | 'stretch';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';
export type Role = 'User' | 'Partner' | 'Admin';
export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
export type OrderStatus = 'Processing' | 'Pending Approval' | 'Accepted' | 'Shipped' | 'Delivered' | 'Completed' | 'Returned' | 'Cancelled' | 'Rejected';

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface PartnerReview {
  id: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
  itemId: string;
}

export interface DeliveryDetails {
  courier: string;
  riderName?: string;
  riderPhone?: string;
  trackingNumber?: string;
  dispatchTime: string;
  estimatedArrival?: string;
}

export interface FitMetadata {
  shoulderWidth?: number; // Normalized 0-1
  waistWidth?: number;
  hipsWidth?: number;
  length?: number;
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
  isAvailable?: boolean;
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
  // Metaverse Features
  threeDModelType?: 'gown' | 'tuxedo' | 'top' | 'accessory'; 
  fitMetadata?: FitMetadata;
  fabricType?: FabricType;
}

export interface ProductFilter {
  category: Category | 'All';
  searchQuery: string;
  color: string;
  size: string;
  occasion: string;
  maxPrice: number;
  sortBy: SortOption;
  duration: string;
  state: string;
  city: string;
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
  paymentMethod?: string;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  subscriptionTier: 'Ordinary' | 'Premium';
  activeRentals: number;
  savedAvatarData?: string; // Serialized landmark data
}
