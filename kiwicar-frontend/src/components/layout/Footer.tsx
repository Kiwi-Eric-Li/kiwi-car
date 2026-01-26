import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const footerLinks = {
  buy: [
    { name: 'Browse Cars', href: '/buy' },
    { name: 'Search by Make', href: '/buy?makes=' },
    { name: 'Electric Vehicles', href: '/buy?fuelTypes=Electric' },
    { name: 'SUVs', href: '/buy?bodyTypes=SUV' },
  ],
  sell: [
    { name: 'List Your Car', href: '/sell' },
    { name: 'Pricing Guide', href: '/sell' },
    { name: 'Seller Tips', href: '/sell' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">KiwiCar</span>
            </Link>
            <p className="text-sm text-gray-400">
              New Zealand's AI-powered used car trading platform. Buy and sell with confidence.
            </p>
          </div>

          {/* Buy */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Buy</h3>
            <ul className="space-y-2">
              {footerLinks.buy.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Sell</h3>
            <ul className="space-y-2">
              {footerLinks.sell.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} KiwiCar. All rights reserved.</p>
          <p>Made with care in New Zealand</p>
        </div>
      </div>
    </footer>
  );
}
