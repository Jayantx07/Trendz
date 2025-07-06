const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      size: {
        type: String,
        required: true
      },
      color: {
        name: {
          type: String,
          required: true
        },
        hex: String
      },
      sku: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  shipping: {
    cost: {
      type: Number,
      required: true,
      default: 0
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    address: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'United States'
      },
      phone: String
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  total: {
    type: Number,
    required: true
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'apple_pay', 'google_pay'],
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  notes: {
    customer: String,
    internal: String
  },
  returnPolicy: {
    eligible: {
      type: Boolean,
      default: true
    },
    deadline: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      }
    }
  },
  emailNotifications: {
    confirmation: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    shipping: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    delivery: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `TZ${year}${month}${random}`;
  }
  next();
});

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Apply discount
  let discountAmount = 0;
  if (this.discount.percentage > 0) {
    discountAmount = (this.subtotal * this.discount.percentage) / 100;
  } else {
    discountAmount = this.discount.amount;
  }
  
  // Calculate tax (example: 8.5%)
  this.tax = (this.subtotal - discountAmount) * 0.085;
  
  // Calculate total
  this.total = this.subtotal - discountAmount + this.tax + this.shipping.cost;
  
  return this.save();
};

// Update status with history
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
  return this.save();
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (!this.returnPolicy.eligible) return false;
  if (this.status !== 'delivered') return false;
  return new Date() <= this.returnPolicy.deadline;
};

// Get order summary
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    status: this.status,
    total: this.total,
    itemCount: this.items.length,
    createdAt: this.createdAt,
    estimatedDelivery: this.shipping.estimatedDelivery
  };
};

module.exports = mongoose.model('Order', orderSchema); 