import { Loader2 } from 'lucide-react';

// Main Loading Spinner
export function LoadingSpinner({ size = 'md', text = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {text && <span className="text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
}

// Job Card Skeleton Loader
export function JobCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 skeleton rounded-lg"></div>
            <div>
              <div className="w-24 h-4 skeleton rounded mb-2"></div>
              <div className="w-16 h-3 skeleton rounded"></div>
            </div>
          </div>
          <div className="w-8 h-8 skeleton rounded-full"></div>
        </div>

        {/* Job Title */}
        <div className="w-3/4 h-6 skeleton rounded mb-3"></div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 skeleton rounded"></div>
            <div className="w-32 h-4 skeleton rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 skeleton rounded"></div>
            <div className="w-24 h-4 skeleton rounded"></div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 skeleton rounded"></div>
          <div className="w-4/5 h-4 skeleton rounded"></div>
          <div className="w-3/5 h-4 skeleton rounded"></div>
        </div>

        {/* Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="w-full h-10 skeleton rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Search Results Loading
export function SearchResultsLoading() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Searching for jobs..." />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This may take a few seconds...
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Favorites Loading
export function FavoritesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 skeleton rounded"></div>
        <div className="w-32 h-6 skeleton rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Page Loading Overlay
export function PageLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mt-4">
          Loading...
        </p>
      </div>
    </div>
  );
}

// Button Loading State
export function ButtonLoading({ children, loading, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Pulse Loading Animation
export function PulseLoader() {
  return (
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
      <div
        className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"
        style={{ animationDelay: '0.1s' }}
      ></div>
      <div
        className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"
        style={{ animationDelay: '0.2s' }}
      ></div>
    </div>
  );
}

// Shimmer Effect Component
export function ShimmerLoader({ className = '' }) {
  return <div className={`shimmer ${className}`}></div>;
}
