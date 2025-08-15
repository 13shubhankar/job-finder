import { useState } from 'react';
import { Heart, ExternalLink, MapPin, Building2, DollarSign, Calendar, X } from 'lucide-react';
import PropTypes from 'prop-types';

export default function JobCard({ job, isFavorite, onToggleFavorite, showFullDescription = false, onLoginRequired }) {
  const [imageError, setImageError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // This function is called when the heart button is clicked
  const handleToggleFavorite = async () => {
    // Check if the onLoginRequired function is provided. If it is, call it.
    // If it's not provided, assume login isn't required for this context (e.g., anonymous browsing).
    // The parent component is responsible for providing this function.
    if (onLoginRequired) {
      const isLoggedIn = await onLoginRequired();
      if (!isLoggedIn) {
        setShowLoginModal(true); // Show the custom modal instead of alert()
        return;
      }
    }

    // Prevent multiple clicks while the favorite action is in progress
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      // Call the parent's onToggleFavorite function with the job and new favorite status
      await onToggleFavorite(job, !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Function to close the login modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch {
      return null;
    }
  };

  const getEmploymentTypeBadge = (type) => {
    const badges = {
      FULLTIME: { class: 'badge-blue', text: 'Full-time' },
      PARTTIME: { class: 'badge-green', text: 'Part-time' },
      CONTRACTOR: { class: 'badge-purple', text: 'Contract' },
      INTERN: { class: 'badge-gray', text: 'Internship' },
      TEMPORARY: { class: 'badge-gray', text: 'Temporary' },
    };
    return badges[type] || { class: 'badge-gray', text: type || 'Not specified' };
  };

  const badge = getEmploymentTypeBadge(job.employmentType);
  const postedDate = formatDate(job.postedDate);
  const truncatedDescription =
    job.description?.length > 200 ? `${job.description.substring(0, 200)}...` : job.description;

  return (
    <>
      <div className="card card-hover group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {job.companyLogo && !imageError ? (
                  <img
                    src={job.companyLogo}
                    alt={`${job.company} logo`}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{job.company}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`badge ${badge.class}`}>{badge.text}</span>
                  {job.isRemote && <span className="badge badge-green">Remote</span>}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${
                  isFavorite ? 'fill-current' : ''
                } ${favoriteLoading ? 'animate-pulse' : 'group-hover:scale-110'}`}
              />
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {job.title}
          </h2>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-700 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{job.location}</span>
            </div>

            {job.salary && (
              <div className="flex items-center text-gray-700 dark:text-gray-400 text-sm">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{job.salary}</span>
              </div>
            )}

            {postedDate && (
              <div className="flex items-center text-gray-700 dark:text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Posted {postedDate}</span>
              </div>
            )}
          </div>

          {job.description && (
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {showFullDescription ? job.description : truncatedDescription}
              </p>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Required Skills:
              </h4>
              <div className="flex flex-wrap gap-1">
                {job.requirements.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {job.requirements.length > 5 && (
                  <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{job.requirements.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-1">
                {job.benefits.slice(0, 3).map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
                {job.benefits.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{job.benefits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary flex items-center justify-center space-x-2 py-2.5 text-sm font-medium group"
              onClick={(e) => {
                if (job.applyLink === '#' || !job.applyLink) {
                  e.preventDefault();
                }
              }}
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {(!job.applyLink || job.applyLink === '#') && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Application link not available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl text-center relative">
            <button
              onClick={closeLoginModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sign in Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You must be signed in to add jobs to your favorites.
            </p>
            <button
              onClick={closeLoginModal}
              className="btn-primary w-full"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Add PropTypes for better type checking
JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  showFullDescription: PropTypes.bool,
  onLoginRequired: PropTypes.func, // Make the prop optional
};
