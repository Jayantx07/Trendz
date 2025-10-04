// Local product catalog used as a fallback for the Product Detail page
// Slugs are derived from names by lowercasing and replacing non-alphanumerics with dashes

export const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const mk = (p) => ({
  id: slugify(p.name),
  slug: slugify(p.name),
  rating: 4.7,
  reviewCount: 128,
  onSale: false,
  isNew: false,
  colors: ['Black', 'White', 'Green', 'Beige'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  features: [
    'Breathable premium fabric',
    'Tailored modern silhouette',
    'Hand-finished detailing',
  ],
  care: [
    'Dry clean recommended',
    'Iron on low heat',
    'Store away from direct sunlight',
  ],
  longDescription:
    'Crafted in premium breathable fabric, this design features a refined silhouette with considered detailing. Perfect for day-to-evening transitions and styled comfort.',
  ...p,
});

export const localProducts = [
  // Gowns / Full length
  mk({
    name: 'Liquid Pattern Gown',
    category: 'Gowns',
    price: 5200,
    images: [
      '/images/products/dresses/gowns/blue white liquid pattern gown.jpg',
      '/images/products/dresses/full length pieces/zebra liquid pattern full lenght piece.jpg',
    ],
  }),
  mk({
    name: 'Evening Gown',
    category: 'Gowns',
    price: 6400,
    images: [
      '/images/products/dresses/full length pieces/evening-gown-1.jpg',
      '/images/products/dresses/full length pieces/shiny silver dress.jpg',
    ],
  }),
  mk({
    name: 'Shiny Silver Dress',
    category: 'Gowns',
    price: 5650,
    images: [
      '/images/products/dresses/full length pieces/shiny silver dress.jpg',
      '/images/products/dresses/full length pieces/white full piece.jpg',
    ],
  }),
  mk({
    name: 'White Full Piece',
    category: 'Gowns',
    price: 4200,
    images: [
      '/images/products/dresses/full length pieces/white full piece.jpg',
      '/images/products/dresses/full length pieces/black full piece.jpg',
    ],
  }),

  // Kurtas & Outfits
  mk({
    name: 'Classic Kurta',
    category: 'Kurtas',
    price: 3200,
    images: [
      '/images/products/dresses/kurtas/kurta.jpg',
      '/images/products/dresses/full outfits/frame kurta 2.jpg',
    ],
  }),
  mk({
    name: 'Frame Kurta',
    category: 'Kurtas',
    price: 3300,
    images: [
      '/images/products/dresses/full outfits/frame kurta.jpg',
      '/images/products/dresses/full outfits/frame kurta 2.jpg',
    ],
  }),
  mk({
    name: 'Beige Outfit',
    category: 'Outfits',
    price: 3500,
    images: [
      '/images/products/dresses/full outfits/biege outifit.jpg',
      '/images/products/dresses/full outfits/black outfit.jpg',
    ],
  }),
  mk({
    name: 'Black Outfit',
    category: 'Outfits',
    price: 3600,
    images: [
      '/images/products/dresses/full outfits/black outfit.jpg',
      '/images/products/dresses/full outfits/black outfit topper view.jpg',
    ],
  }),

  // One piece / long pieces
  mk({
    name: 'Maroon One Piece',
    category: 'One Piece',
    price: 4800,
    images: [
      '/images/products/dresses/one piece/maroon one piece.jpg',
      '/images/products/dresses/one piece/maroon piece with top.jpg',
    ],
  }),
  mk({
    name: 'One-side Sleeve Black',
    category: 'One Piece',
    price: 5100,
    images: [
      '/images/products/dresses/one piece/one side sleeve black one piece.jpg',
      '/images/products/dresses/full length pieces/side cut long piece black 2.jpg',
    ],
  }),
  mk({
    name: 'Side Cut Long Black',
    category: 'One Piece',
    price: 4600,
    images: [
      '/images/products/dresses/full length pieces/side cut long piece black.jpg',
      '/images/products/dresses/full length pieces/side cut long piece black 2.jpg',
    ],
  }),
  mk({
    name: 'Black Full Piece',
    category: 'One Piece',
    price: 5000,
    images: [
      '/images/products/dresses/full length pieces/black full piece.jpg',
      '/images/products/dresses/full length pieces/white full piece.jpg',
    ],
  }),

  // Skirts
  mk({ name: 'Beige Skirt', category: 'Skirts', price: 2100, images: [
    '/images/products/dresses/skirts/biege skirt.jpg',
    '/images/products/dresses/skirts/white skirt 1-3.jpg',
  ]}),
  mk({ name: 'Black & White Pattern', category: 'Skirts', price: 2300, images: [
    '/images/products/dresses/skirts/black and white pattern skirt.jpg',
    '/images/products/dresses/skirts/black skirt 1-1.jpg',
  ]}),
  mk({ name: 'Green Velvet Skirt', category: 'Skirts', price: 2600, images: [
    '/images/products/dresses/skirts/green valvet skirt.jpg',
    '/images/products/dresses/skirts/green skirt .jpg',
  ]}),
  mk({ name: 'Zebra Liquid Pattern', category: 'Skirts', price: 2400, images: [
    '/images/products/dresses/skirts/zebra liquid pattern skirt.jpg',
    '/images/products/dresses/skirts/black skirt back.jpg',
  ]}),

  // Toppers & Scarves & Bottoms
  mk({ name: 'Topper', category: 'Toppers', price: 2800, images: [
    '/images/products/dresses/toppers/Topper.jpg',
    '/images/products/dresses/full outfits/black outfit topper view.jpg',
  ]}),
  mk({ name: 'Scarf', category: 'Accessories', price: 1400, images: [
    '/images/products/dresses/full outfits/scarf-1.jpg',
    '/images/products/dresses/full outfits/black outfit.jpg',
  ]}),
  mk({ name: 'Bottom', category: 'Bottoms', price: 1900, images: [
    '/images/products/dresses/bottom/bottom.webp',
    '/images/products/dresses/skirts/black skirt 2-1.jpg',
  ]}),
];

export const getProductBySlug = (slug) => localProducts.find(p => p.slug === slug);
