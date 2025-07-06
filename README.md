# Trendz - Luxury Fashion E-commerce Platform

A comprehensive MERN stack fashion e-commerce platform inspired by Oscar de la Renta, built with React, Node.js, MongoDB, and modern web technologies.

## 🚀 Features

### Frontend
- **React 18** with Vite for fast development
- **TailwindCSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **Context API** for state management
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Stripe/Razorpay** payment integration
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Key Features
- 🎥 Cinematic hero section with autoplay videos
- 🛍️ Advanced product filtering and search
- 💝 Wishlist functionality
- 🛒 Shopping cart with live updates
- 👤 User authentication and profiles
- 📧 Newsletter subscription
- 📱 Fully responsive design
- ⚡ Performance optimized
- 🔍 SEO friendly

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- React Router DOM
- Lucide React
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Stripe
- Nodemailer
- Multer
- Bcrypt
- Cors

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trendz.git
   cd trendz
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp env.example .env
   cd client
   cp env.example .env
   ```

4. **Configure Environment Variables**
   
   Root `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/trendz
   JWT_SECRET=your_jwt_secret_here
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

   Client `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

5. **Start the development servers**
   ```bash
   # Start backend server (from root directory)
   npm run server
   
   # Start frontend development server (from client directory)
   cd client
   npm run dev
   ```

## 🏗️ Project Structure

```
trendz/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   │   ├── components/    # Reusable components
│   │   │   ├── home/      # Home page components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── server/                # Backend Node.js application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── package.json           # Root package.json
└── README.md             # Project documentation
```

## 🎨 Design System

### Colors
- **Primary**: #ffffff (White)
- **Secondary**: #f8f9fa (Light Gray)
- **Accent**: #B48D56 (Warm Gold)
- **Text**: #1a1a1a (Dark Gray)
- **Background**: #ffffff (White)

### Typography
- **Body**: Inter (Sans-serif)
- **Headings**: Playfair Display (Serif)
- **Monospace**: System monospace fonts

### Components
- **Buttons**: Primary, Secondary, and Text variants
- **Cards**: Product cards with hover effects
- **Forms**: Styled form inputs and validation
- **Navigation**: Sticky navbar with dropdowns
- **Footer**: Multi-column layout with social links

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Heroku)
1. Set up environment variables
2. Deploy the `server` directory
3. Configure MongoDB connection

## 📱 Features Overview

### Home Page
- Cinematic hero section with video background
- Featured collections with hover effects
- New arrivals grid
- Newsletter signup
- Category navigation

### Product Pages
- Advanced filtering (category, price, color, size)
- Search with typeahead
- Product image carousel
- Wishlist functionality
- Add to cart with options

### User Features
- Authentication (login/register)
- User profiles
- Order history
- Wishlist management
- Newsletter preferences

### Shopping Cart
- Live cart updates
- Quantity management
- Multi-step checkout
- Payment integration
- Order confirmation

## 🔧 Development

### Available Scripts

**Root Directory:**
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build frontend for production
```

**Client Directory:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Server Directory:**
```bash
npm start            # Start production server
npm run dev          # Start development server
npm run test         # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Oscar de la Renta's elegant design aesthetic
- Built with modern web technologies for optimal performance
- Designed for accessibility and user experience

## 📞 Support

For support, email support@trendz.com or create an issue in this repository.

---

**Trendz** - Where elegance meets innovation in fashion e-commerce. 