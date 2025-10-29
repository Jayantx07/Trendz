const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  brand: {
    type: String,
    required: true,
    default: 'Trendz'
  },
  category: {
    type: String,
    required: true,
    enum: ['dresses', 'tops', 'bottoms', 'outerwear', 'accessories', 'shoes', 'bags', 'jewelry']
  },
  subcategory: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['women', 'men', 'unisex']
  },
  collections: [{
    type: String,
    enum: ['Dark Florals', 'Fall 2025', 'Street Luxe', 'Bridal', 'Evening', 'Day Wear']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: false,
      index: true
    },
    colorName: {
      type: String,
      required: false
    },
    assetType: {
      type: String,
      enum: ['image'],
      default: 'image'
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    publicId: {
      type: String,
      required: false,
      index: true
    },
    assetType: {
      type: String,
      enum: ['video'],
      default: 'video'
    },
    type: {
      type: String,
      enum: ['preview', 'lookbook', 'runway'],
      default: 'preview'
    },
    duration: Number
  }],
  variants: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE']
    },
    color: {
      name: {
        type: String,
        required: true
      },
      hex: String
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      unique: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    salePrice: {
      type: Number,
      min: 0
    },
    isOnSale: {
      type: Boolean,
      default: false
    }
  }],
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  tags: [String],
  features: [{
    name: String,
    description: String,
    icon: String
  }],
  materials: [{
    name: String,
    percentage: Number
  }],
  care: {
    washing: String,
    drying: String,
    ironing: String,
    dryCleaning: String
  },
  measurements: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShippingThreshold: {
      type: Number,
      default: 1499
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    images: [String],
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  arTryOn: {
    enabled: {
      type: Boolean,
      default: false
    },
    modelUrl: String,
    instructions: String
  },
  viewCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ collections: 1 });
productSchema.index({ isOnSale: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : '');
});

// Virtual for lowest price
productSchema.virtual('lowestPrice').get(function() {
  if (this.isOnSale && this.salePrice) {
    return this.salePrice;
  }
  return this.basePrice;
});

// Method to update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;
  }
  return this.save();
};

// Pre-save middleware to update sale status
productSchema.pre('save', function(next) {
  if (this.salePrice && this.salePrice < this.basePrice) {
    this.isOnSale = true;
    this.discountPercentage = Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
  } else {
    this.isOnSale = false;
    this.discountPercentage = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 