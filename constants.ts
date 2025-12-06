
import { Category, Product, UserProfile } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Velvet Evening Gown',
    brand: 'Alexander McQueen',
    category: Category.WOMEN,
    rentalPrice: 150,
    retailPrice: 3200,
    buyPrice: 2800,
    isForSale: true,
    ownerId: 'stylus-official',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A floor-length velvet gown featuring a dramatic neckline and intricate beadwork. Perfect for galas and red carpet events.',
    availableSizes: ['XS', 'S', 'M', 'L'],
    color: 'Black',
    occasion: 'Gala',
    reviews: [
      { id: 'r1', author: 'Sophia M.', rating: 5, comment: 'Stunning fit. Felt like royalty all night.', date: '2023-11-15' },
      { id: 'r2', author: 'Elena R.', rating: 4, comment: 'Beautiful fabric, but runs slightly long.', date: '2023-12-02' },
      { id: 'r2b', author: 'Jessica T.', rating: 5, comment: 'The velvet is incredibly soft and high quality.', date: '2024-01-20' }
    ],
    rentalCount: 5
  },
  {
    id: '2',
    name: 'Oyster Perpetual Tuxedo',
    brand: 'Tom Ford',
    category: Category.MEN,
    rentalPrice: 200,
    retailPrice: 4500,
    buyPrice: 4000,
    isForSale: false,
    ownerId: 'stylus-official',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Impeccably tailored tuxedo with satin lapels. Exudes confidence and timeless sophistication.',
    availableSizes: ['48', '50', '52', '54'],
    color: 'Black',
    occasion: 'Black Tie',
    reviews: [
      { id: 'r3', author: 'James B.', rating: 5, comment: 'The cut is impeccable. Tom Ford never misses.', date: '2024-01-10' },
      { id: 'r3b', author: 'Michael K.', rating: 5, comment: 'Wore this to the Met Gala. Received endless compliments.', date: '2024-02-15' }
    ],
    rentalCount: 2
  },
  {
    id: '3',
    name: 'Royal Sapphire Clutch',
    brand: 'Chanel',
    category: Category.ACCESSORIES,
    rentalPrice: 85,
    retailPrice: 1800,
    buyPrice: 1650,
    isForSale: true,
    ownerId: '2', // Mock Partner ID
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A statement piece embellished with sapphire-toned crystals and gold hardware.',
    availableSizes: ['One Size'],
    color: 'Blue',
    occasion: 'Cocktail',
    reviews: [
      { id: 'r6', author: 'Claire D.', rating: 5, comment: 'The perfect pop of color for my neutral outfit.', date: '2024-03-01' }
    ],
    rentalCount: 0
  },
  {
    id: '4',
    name: 'Heritage Chronograph',
    brand: 'Patek Philippe',
    category: Category.WATCHES,
    rentalPrice: 500,
    retailPrice: 45000,
    buyPrice: 45000,
    isForSale: false,
    ownerId: 'stylus-official',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The epitome of watchmaking excellence. Hand-finished movement with a rose gold case.',
    availableSizes: ['One Size'],
    color: 'Gold',
    occasion: 'Business',
    reviews: [
        { id: 'r4', author: 'William T.', rating: 5, comment: 'A masterpiece. Keeps perfect time and turns heads.', date: '2023-09-20' },
        { id: 'r4b', author: 'Jonathan P.', rating: 5, comment: 'Verification process was smooth. Watch is pristine.', date: '2024-01-05' }
    ],
    rentalCount: 1
  },
  {
    id: '5',
    name: 'Golden Silk Wrap',
    brand: 'Hermès',
    category: Category.ACCESSORIES,
    rentalPrice: 60,
    retailPrice: 450,
    buyPrice: 400,
    isForSale: true,
    ownerId: 'stylus-official',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1000&auto=format&fit=crop'
    ],
    description: '100% hand-rolled silk scarf featuring the iconic equestrian motifs.',
    availableSizes: ['One Size'],
    color: 'Gold',
    occasion: 'Casual',
    reviews: [
      { id: 'r7', author: 'Amelia S.', rating: 4, comment: 'Beautiful silk, packaged very luxuriously.', date: '2024-02-20' }
    ],
    rentalCount: 8
  },
  {
    id: '6',
    name: 'Monogram Keepall',
    brand: 'Louis Vuitton',
    category: Category.BAGS,
    rentalPrice: 120,
    retailPrice: 2100,
    buyPrice: 1950,
    isForSale: true,
    ownerId: '2', // Mock Partner
    images: [
      'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The classic travel bag. Durable, stylish, and instantly recognizable.',
    availableSizes: ['55cm'],
    color: 'Brown',
    occasion: 'Travel',
    reviews: [
        { id: 'r5', author: 'Sarah L.', rating: 5, comment: 'Perfect condition. Made my weekend trip so much more stylish.', date: '2024-02-14' },
        { id: 'r5b', author: 'David C.', rating: 5, comment: 'Highly recommended for short business trips.', date: '2024-03-10' }
    ],
    rentalCount: 15
  }
];

export const MOCK_USER: UserProfile = {
  name: "Victoria Sterling",
  memberSince: "Oct 2023",
  subscriptionTier: "Diamond",
  activeRentals: 2
};
