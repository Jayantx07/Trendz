import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Facebook, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer = () => {
  const footerLinks = {};

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/trendz', icon: Instagram },
    { name: 'YouTube', href: 'https://youtube.com/trendz', icon: Youtube },
    { name: 'Facebook', href: 'https://facebook.com/trendz', icon: Facebook },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/trendz', icon: Instagram }
  ];

  return (
    <footer className="bg-white text-black border-t-2 border-black">
      {/* Newsletter Section */}
      <section className="border-b border-gray-800 hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-tenor font-bold mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-neutral-800 mb-6">
                Be the first to know about new arrivals, exclusive offers, and fashion insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent transition-colors"
                  />
                </div>
                <button className="h-full px-8 py-4 bg-black text-white rounded-[3px] font-semibold hover:bg-accent transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-tenor font-bold mb-4">
                Sign up for texts and enjoy 10% off your order
              </h3>
              <p className="text-neutral-800 mb-6">
                Get exclusive offers and updates via text message
              </p>
              <button className="btn-secondary rounded-[3px]">
                Claim Offer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-tenor mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-neutral-800">888.782.6357</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-neutral-800">customerservice@trendz.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-1" />
                <span className="text-neutral-800">
                  Our Client Services team is available Monday-Friday from 9 AM - 6 PM (EST).
                </span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-tenor mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-800 hover:text-accent transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-sm text-neutral-800">Follow Us</span>
              <div className="flex items-center gap-4 hidden">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-neutral-800 hover:text-accent transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Language/Country Selector */}
            <div className="flex items-center gap-4 hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-800">Shipping to:</span>
                <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white">
                  <option value="us">United States (USD $)</option>
                  <option value="ca">Canada (CAD)</option>
                  <option value="uk">United Kingdom (GBP)</option>
                  <option value="eu">Europe (EUR)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-neutral-800">
              © 2025 Trendz. All rights reserved
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-800">
              <Link to="/legal/terms" className="hover:text-accent transition-colors">
                Terms of Use
              </Link>
              <Link to="/legal/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/legal/accessibility" className="hover:text-accent transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>

        {/* Large Trendz Logo at the very bottom */}
        <div className="w-full flex justify-center items-center mt-12 mb-4">
          <img src="/images/Logo black.png" alt="Trendz Logo" className="h-20 md:h-24 object-contain" />
        </div>
      </div>
    </footer>
  );
};

export default Footer; 