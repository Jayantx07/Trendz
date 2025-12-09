const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      gender,
      collection,
      minPrice,
      maxPrice,
      size,
      color,
      discount,
      sort = 'newest',
      search,
      q,
      onSale,
      featured,
      newArrivals,
      bestsellers
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category) {
      const categories = category.split(',');
      if (categories.length > 1) {
        filter.category = { $in: categories };
      } else {
        filter.category = category;
      }
    }
    
    if (gender) {
      const genders = gender.split(',');
      if (genders.length > 1) {
        filter.gender = { $in: genders };
      } else {
        filter.gender = gender;
      }
    }

    if (collection) filter.collections = collection;
    if (onSale === 'true') filter.isOnSale = true;
    if (featured === 'true') filter.isFeatured = true;
    if (newArrivals === 'true') filter.isNew = true;
    if (bestsellers === 'true') filter.isBestseller = true;

    // Price filter
    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;

      const effectivePriceExpr = {
        $cond: {
          if: { $gt: ["$salePrice", 0] },
          then: "$salePrice",
          else: "$basePrice"
        }
      };

      filter.$expr = {
        $and: [
          { $gte: [effectivePriceExpr, min] },
          { $lte: [effectivePriceExpr, max] }
        ]
      };
    }

    // Size filter
    if (size) {
      const sizes = size.split(',');
      if (sizes.length > 1) {
        filter['variants.size'] = { $in: sizes };
      } else {
        filter['variants.size'] = size;
      }
    }

    // Color filter
    if (color) {
      const colors = color.split(',');
      if (colors.length > 1) {
        // Construct regex for each color and use $or
        filter['$or'] = colors.map(c => ({
          'variants.color.name': { $regex: c, $options: 'i' }
        }));
      } else {
        filter['variants.color.name'] = { $regex: color, $options: 'i' };
      }
    }

    // Discount filter
    if (discount) {
      filter.discountPercentage = { $gte: parseInt(discount) };
    }

    // Search filter
    const searchQuery = search || q;
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price-low':
        sortObj = { basePrice: 1 };
        break;
      case 'price-high':
        sortObj = { basePrice: -1 };
        break;
      case 'rating':
        sortObj = { 'ratings.average': -1 };
        break;
      case 'popular':
        sortObj = { viewCount: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let products;

    if (sort === 'price-low' || sort === 'price-high') {
      const sortDir = sort === 'price-low' ? 1 : -1;
      products = await Product.aggregate([
        { $match: filter },
        {
          $addFields: {
            effectivePrice: {
              $cond: {
                if: { $gt: ["$salePrice", 0] },
                then: "$salePrice",
                else: "$basePrice"
              }
            }
          }
        },
        { $sort: { effectivePrice: sortDir } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        { 
          $project: { 
            name: 1, 
            slug: 1, 
            images: { url: 1, isPrimary: 1 }, 
            basePrice: 1, 
            salePrice: 1, 
            isOnSale: 1, 
            discountPercentage: 1, 
            category: 1, 
            gender: 1, 
            ratings: 1 
          } 
        }
      ]);
    } else {
      products = await Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name slug images.url images.isPrimary basePrice salePrice isOnSale discountPercentage category gender ratings')
        .lean();
    }

    const withPrimary = (products || []).map(p => {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const primary = imgs.find(i => i.isPrimary) || imgs[0];
      return {
        ...p,
        primaryImage: primary ? primary.url : '',
      };
    });

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      products: withPrimary,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error getting products' });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({ slug, status: 'active' })
      .populate('relatedProducts', 'name slug primaryImage basePrice salePrice isOnSale')
      .populate('reviews.user', 'firstName lastName');

    // If not found by slug, try by _id
    if (!product && slug.match(/^[a-fA-F0-9]{24}$/)) {
      product = await Product.findOne({ _id: slug, status: 'active' })
        .populate('relatedProducts', 'name slug primaryImage basePrice salePrice isOnSale')
        .populate('reviews.user', 'firstName lastName');
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error getting product' });
  }
});

// Get product variants
router.get('/:slug/variants', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, status: 'active' })
      .select('variants');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.variants);
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(500).json({ message: 'Server error getting variants' });
  }
});

// Search products
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(5)
    .select('name slug primaryImage category');

    res.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error getting search suggestions' });
  }
});

// Get featured products
router.get('/featured/collections', async (req, res) => {
  try {
    const collections = [
      { name: 'Dark Florals', slug: 'dark-florals' },
      { name: 'Fall 2025', slug: 'fall-2025' },
      { name: 'Street Luxe', slug: 'street-luxe' }
    ];

    const featuredCollections = await Promise.all(
      collections.map(async (collection) => {
        const products = await Product.find({
          status: 'active',
          collections: collection.name,
          isFeatured: true
        })
        .limit(4)
        .select('name slug primaryImage basePrice salePrice isOnSale');

        return {
          ...collection,
          products
        };
      })
    );

    res.json(featuredCollections);
  } catch (error) {
    console.error('Get featured collections error:', error);
    res.status(500).json({ message: 'Server error getting featured collections' });
  }
});

// Get new arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const newArrivals = await Product.find({
      status: 'active',
      isNew: true
    })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('name slug primaryImage basePrice salePrice isOnSale category');

    res.json(newArrivals);
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Server error getting new arrivals' });
  }
});

// Get bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const bestsellers = await Product.find({
      status: 'active',
      isBestseller: true
    })
    .sort({ 'ratings.average': -1, viewCount: -1 })
    .limit(8)
    .select('name slug primaryImage basePrice salePrice isOnSale category ratings');

    res.json(bestsellers);
  } catch (error) {
    console.error('Get bestsellers error:', error);
    res.status(500).json({ message: 'Server error getting bestsellers' });
  }
});

// Get sale products
router.get('/sale', async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const saleProducts = await Product.find({
      status: 'active',
      isOnSale: true
    })
    .sort({ discountPercentage: -1 })
    .limit(parseInt(limit))
    .select('name slug primaryImage basePrice salePrice discountPercentage category');

    res.json(saleProducts);
  } catch (error) {
    console.error('Get sale products error:', error);
    res.status(500).json({ message: 'Server error getting sale products' });
  }
});

// Add product review (authenticated)
router.post('/:slug/reviews', auth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findOne({ slug, status: 'active' });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.user.userId,
      rating,
      title,
      comment
    });

    // Update average rating
    await product.updateAverageRating();

    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
});

// Get product filters
router.get('/filters/options', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const genders = await Product.distinct('gender');
    const collections = await Product.distinct('collections');
    const sizes = await Product.distinct('variants.size');
    const colors = await Product.distinct('variants.color.name');

    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' }
        }
      }
    ]);

    res.json({
      categories,
      genders,
      collections,
      sizes,
      colors,
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Server error getting filters' });
  }
});

module.exports = router; 