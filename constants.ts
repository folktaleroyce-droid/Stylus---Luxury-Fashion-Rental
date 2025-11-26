import { Category, Product, UserProfile } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Velvet Evening Gown',
    brand: 'Alexander McQueen',
    category: Category.WOMEN,
    rentalPrice: 150,
    retailPrice: 3200,
    imageUrl: 'https://picsum.photos/id/433/800/1200',
    description: 'A floor-length velvet gown featuring a dramatic neckline and intricate beadwork. Perfect for galas and red carpet events.',
    availableSizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: '2',
    name: 'Oyster Perpetual Tuxedo',
    brand: 'Tom Ford',
    category: Category.MEN,
    rentalPrice: 200,
    retailPrice: 4500,
    imageUrl: 'https://picsum.photos/id/1059/800/1200',
    description: 'Impeccably tailored tuxedo with satin lapels. Exudes confidence and timeless sophistication.',
    availableSizes: ['48', '50', '52', '54']
  },
  {
    id: '3',
    name: 'Royal Sapphire Clutch',
    brand: 'Chanel',
    category: Category.ACCESSORIES,
    rentalPrice: 85,
    retailPrice: 1800,
    imageUrl: 'https://picsum.photos/id/364/800/800',
    description: 'A statement piece embellished with sapphire-toned crystals and gold hardware.',
    availableSizes: ['One Size']
  },
  {
    id: '4',
    name: 'Heritage Chronograph',
    brand: 'Patek Philippe',
    category: Category.WATCHES,
    rentalPrice: 500,
    retailPrice: 45000,
    imageUrl: 'https://picsum.photos/id/175/800/800',
    description: 'The epitome of watchmaking excellence. Hand-finished movement with a rose gold case.',
    availableSizes: ['One Size']
  },
  {
    id: '5',
    name: 'Golden Silk Wrap',
    brand: 'Hermès',
    category: Category.ACCESSORIES,
    rentalPrice: 60,
    retailPrice: 450,
    imageUrl: 'https://picsum.photos/id/879/800/800',
    description: '100% hand-rolled silk scarf featuring the iconic equestrian motifs.',
    availableSizes: ['One Size']
  },
  {
    id: '6',
    name: 'Monogram Keepall',
    brand: 'Louis Vuitton',
    category: Category.BAGS,
    rentalPrice: 120,
    retailPrice: 2100,
    imageUrl: 'https://picsum.photos/id/292/800/800',
    description: 'The classic travel bag. Durable, stylish, and instantly recognizable.',
    availableSizes: ['55cm']
  }
];

export const MOCK_USER: UserProfile = {
  name: "Victoria Sterling",
  memberSince: "Oct 2023",
  subscriptionTier: "Diamond",
  activeRentals: 2
};