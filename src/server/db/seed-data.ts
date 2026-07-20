import type { ProductCategory } from '@/shared/types';

export const SEED_PRODUCTS: {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
}[] = [
  {
    name: 'Linen Blend Shirt',
    description:
      'Breathable linen-cotton blend in warm sand tone. Relaxed fit for everyday wear.',
    price: 68,
    category: 'tops',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    name: 'Structured Blazer',
    description: 'Tailored single-breasted blazer in deep olive. Perfect for layering.',
    price: 145,
    category: 'outerwear',
    imageUrl:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L'],
    inStock: true,
  },
  {
    name: 'Wide-Leg Trousers',
    description:
      'High-waist wide-leg trousers in soft clay beige. Clean drape, minimal crease.',
    price: 92,
    category: 'bottoms',
    imageUrl:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
    sizes: ['28', '30', '32', '34'],
    inStock: true,
  },
  {
    name: 'Midi Wrap Dress',
    description:
      'Fluid wrap dress in dusty rose. Adjustable waist, elbow-length sleeves.',
    price: 118,
    category: 'dresses',
    imageUrl:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
  },
  {
    name: 'Merino Crew Sweater',
    description:
      'Fine-gauge merino wool crew neck in heather taupe. Lightweight warmth.',
    price: 86,
    category: 'tops',
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    name: 'Canvas Tote',
    description:
      'Unstructured canvas tote in natural ecru. Reinforced handles, interior pocket.',
    price: 54,
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    sizes: ['One Size'],
    inStock: true,
  },
];
