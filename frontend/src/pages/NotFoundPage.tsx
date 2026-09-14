import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">🥦</div>
        <h1 className="text-6xl font-extrabold text-primary-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Looks like this page went out of stock! Let's get you back to fresh groceries.
        </p>
        <Link to="/" className="btn-primary py-3 px-8 text-base">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
