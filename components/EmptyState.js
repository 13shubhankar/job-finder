import { Search, Heart, FileX, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({ 
  type = 'search', 
  title, 
  description, 
  action,
  className = '' 
}) {
  const configs = {
    search: {
      icon: Search,
      title: 'No jobs found',
      description: 'Try adjusting your search criteria or keywords to find more opportunities.',
      iconColor: 'text-blue-500'
    },
    favorites: {
      icon: Heart,
      title: 'No saved jobs yet',
      description: 'Start searching for jobs and save the ones you like by clicking the heart icon.',
      iconColor: 'text-red-500'
    },
    error: {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: 'We encountered an error while loading your data. Please try again.',
      iconColor: 'text-orange-500'
    },
    noResults: {
      icon: FileX,
      title: 'No results',
      description: 'We couldn\'t find any matches for your search.',
      iconColor: 'text-gray-500'
    },
    welcome: {
      icon: Briefcase,
      title: 'Welcome to JobFinder',
      description: 'Search thousands of job opportunities from top companies worldwide.',
      iconColor: 'text-primary-500'
    },
  };

  const config = configs[type] || configs.search;
  const IconComponent = config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full bg-gray-100 dark:bg-gray-800 ${config.iconColor}`}>
            <IconComponent className="w-12 h-12" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {finalTitle}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {finalDescription}
        </p>

        {/* Action Button */}
        {action && (
          <div className="space-y-4">
            {action}
          </div>
        )}

        {/* Decorative Elements */}
        <div className="mt-8 opacity-30">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <div className="w-2 h-2 bg-current rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specific Empty State Components
export function SearchEmptyState({ onReset, searchTerm }) {
  return (
    <EmptyState
      type="search"
      title="No jobs found"
      description={ 
        searchTerm 
          ? `No jobs match "${searchTerm}". Try different keywords or location.` 
          : "Try adjusting your search criteria to find more opportunities."
      }
      action={
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear filters</span>
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Suggestions:</p>
            <ul className="mt-2 space-y-1 text-left max-w-xs mx-auto">
              <li>• Try broader keywords</li>
              <li>• Remove location filters</li>
              <li>• Check different job types</li>
            </ul>
          </div>
        </div>
      }
    />
  );
}

export function FavoritesEmptyState({ onSearchJobs }) {
  return (
    <EmptyState
      type="favorites"
      action={
        <button
          onClick={onSearchJobs}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search Jobs</span>
        </button>
      }
    />
  );
}

export function ErrorEmptyState({ onRetry, error }) {
  return (
    <EmptyState
      type="error"
      title="Oops! Something went wrong"
      description={
        error 
          ? `Error: ${error}`
          : "We encountered an unexpected error. Please try again."
      }
      action={
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      }
    />
  );
}

export function WelcomeEmptyState() {
  return (
    <EmptyState
      type="welcome"
      title="Find Your Dream Job"
      description="Search through thousands of job opportunities from top companies. Sign in to get started and save your favorite positions."
      className="py-20 text-white"
    />
  );
}