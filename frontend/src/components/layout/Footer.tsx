import { Share2, Heart, MessageCircle, PlayCircle, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter bar */}
      <div className="bg-primary-500">
        <div className="container-app py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-xl">Stay Fresh, Stay Updated</h3>
              <p className="text-primary-100 text-sm mt-0.5">Exclusive offers, healthy tips, and updates to your inbox.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <button type="submit" className="px-5 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-sm shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl text-white">Fresh<span className="text-primary-400">ora</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Sri Lanka's grocery delivery platform. Fresh produce, daily essentials, and more — delivered to your door across Colombo.
            </p>
            <div className="flex gap-3">
              {[Share2, Heart, MessageCircle, PlayCircle].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-gray-800 hover:bg-primary-500 rounded-lg transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['All Categories', 'Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Beverages', 'Snacks'].map((item) => (
                <li key={item}><a href="#" className="text-sm hover:text-primary-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2.5">
              {['FAQs', 'Shipping & Delivery', 'Returns & Refunds', 'Track My Order', 'Contact Us'].map((item) => (
                <li key={item}><a href="#" className="text-sm hover:text-primary-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4">About Us</h4>
            <ul className="space-y-2.5 mb-6">
              {['Our Story', 'Careers', 'Blog', 'Press'].map((item) => (
                <li key={item}><a href="#" className="text-sm hover:text-primary-400 transition-colors">{item}</a></li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mb-3">Get the App</h4>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                <Smartphone size={16} className="text-primary-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Download on</p>
                  <p className="text-xs font-semibold text-white">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                <Smartphone size={16} className="text-primary-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Get it on</p>
                  <p className="text-xs font-semibold text-white">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Freshora. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">Terms & Conditions</Link>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
