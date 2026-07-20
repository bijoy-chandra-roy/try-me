import type { ProductCategory, ProductCustomField } from '@/shared/types';

export const SEED_PRODUCTS: {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  sizes: string[];
  customFields: ProductCustomField[];
  inStock: boolean;
  stockQuantity: number;
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
    customFields: [
      { label: 'Material', options: ['Linen-cotton blend'] },
      { label: 'Fit', options: ['Relaxed', 'Regular'] },
    ],
    inStock: true,
    stockQuantity: 25,
  },
  {
    name: 'Structured Blazer',
    description: 'Tailored single-breasted blazer in deep olive. Perfect for layering.',
    price: 145,
    category: 'outerwear',
    imageUrl:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L'],
    customFields: [
      { label: 'Color', options: ['Deep olive', 'Charcoal'] },
      { label: 'Lining', options: ['Partial'] },
    ],
    inStock: true,
    stockQuantity: 15,
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
    customFields: [
      { label: 'Rise', options: ['High'] },
      { label: 'Care', options: ['Dry clean', 'Hand wash'] },
    ],
    inStock: true,
    stockQuantity: 20,
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
    customFields: [
      { label: 'Length', options: ['Midi'] },
      { label: 'Closure', options: ['Wrap tie'] },
    ],
    inStock: true,
    stockQuantity: 18,
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
    customFields: [
      { label: 'Material', options: ['100% merino wool'] },
      { label: 'Gauge', options: ['Fine'] },
    ],
    inStock: true,
    stockQuantity: 30,
  },
  {
    name: 'Canvas Tote',
    description:
      'Unstructured canvas tote in natural ecru. Reinforced handles, interior pocket.',
    price: 54,
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    sizes: [],
    customFields: [
      { label: 'Material', options: ['Heavy canvas'] },
      { label: 'Colors', options: ['Ecru', 'Olive', 'Clay'] },
      { label: '', options: ['Interior pocket', 'Reinforced handles'] },
    ],
    inStock: true,
    stockQuantity: 40,
  },
];
