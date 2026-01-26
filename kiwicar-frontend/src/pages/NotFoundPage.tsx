import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Button from '@/components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button size="lg">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/buy">
            <Button variant="outline" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Browse Cars
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
