const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    gender: {
      type: String,
      enum: ['women', 'men', 'unisex'],
      default: 'women'
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      default: 'M'
    },
    stylePreferences: [{
      type: String,
      enum: ['casual', 'formal', 'streetwear', 'luxury', 'minimalist', 'bohemian']
    }],
    favoriteColors: [String],
    budget: {
      min: Number,
      max: Number
    }
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal'],
      default: 'card'
    },
    last4: String,
    brand: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  completedStyleQuiz: {
    type: Boolean,
    default: false
  },
  styleQuizResults: {
    styleType: String,
    colorPalette: [String],
    sizePreferences: [String]
  },
  newsletterSubscribed: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema); 