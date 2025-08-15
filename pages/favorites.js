import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { Heart, Search, Filter, SortAsc, SortDesc, Calendar, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { FavoritesLoading } from '../components/LoadingSpinner';
import { FavoritesEmptyState, ErrorEmptyState } from '../components/EmptyState';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('savedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/');
      return;
    }
    loadFavorites();
  }, [session, status, router, sortBy, sortOrder, currentPage]);

  const loadFavorites = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        order: sortOrder
      });

      const response = await axios.get(`/api/favorites?${params}`);
      
      if (response.data.success) {
        setFavorites(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to load favorites');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (job, isFavorite) => {
    if (!session) return;

    try {
      if (!isFavorite) {
        // Remove from favorites
        await axios.delete(`/api/favorites?jobId=${job.jobId}`);
        
        // Remove from local state
        setFavorites(prev => prev.filter(fav => fav.jobId !== job.jobId));
        
        // Reload if current page becomes empty
        if (favorites.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadFavorites();
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert(error.response?.data?.message || 'Failed to remove favorite');
    }
  };

  // Filter and search favorites
  const getFilteredFavorites = () => {
    let filtered = [...favorites];

    // Apply employment type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(job => 
        job.employmentType?.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredFavorites = getFilteredFavorites();
  const uniqueEmploymentTypes = [...new Set(favorites.map(job => job.employmentType).filter(Boolean))];

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Head>
          <title>My Favorites - JobFinder</title>
          <meta name="description" content="View and manage your saved job opportunities." />
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FavoritesLoading />
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>My Favorites - JobFinder</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorEmptyState error={error} onRetry={loadFavorites} />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Favorites ({favorites.length}) - JobFinder</title>
        <meta name="description" content="View and manage your saved job opportunities. Keep track of positions you're interested in." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Favorites
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {favorites.length} saved job{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              {favorites.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Search className="w-5 h-5" />
                    <p className="text-sm">
                      Start searching for jobs and save your favorites by clicking the heart icon.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 mt-3 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <span>Go to job search</span>
                    <Search className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {favorites.length > 0 ? (
              <>
                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search favorites
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by title, company, or location..."
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    {/* Employment Type Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Employment type
                      </label>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="input-field pl-10"
                        >
                          <option value="all">All types</option>
                          {uniqueEmploymentTypes.map(type => (
                            <option key={type} value={type}>
                              {type === 'FULLTIME' ? 'Full-time' :
                               type === 'PARTTIME' ? 'Part-time' :
                               type === 'CONTRACTOR' ? 'Contract' :
                               type === 'INTERN' ? 'Internship' : type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sort by
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSort('savedAt')}
                          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sortBy === 'savedAt'
                              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Date</span>
                          {sortBy === 'savedAt' && (
                            sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSort('company')}
                          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sortBy === 'company'
                              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Company</span>
                          {sortBy === 'company' && (
                            sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredFavorites.length === favorites.length
                        ?` Showing all ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                        : `Showing ${filteredFavorites.length} of ${favorites.length} favorites`
                      }
                    </p>
                  </div>
                </div>

                {/* Favorites Grid */}
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((job) => (
                      <JobCard
                        key={job._id || job.jobId}
                        job={{
                          id: job.jobId,
                          title: job.title,
                          company: job.company,
                          location: job.location,
                          employmentType: job.employmentType,
                          applyLink: job.applyLink,
                          companyLogo: job.companyLogo,
                          description: job.description,
                          salary: job.salary,
                          postedDate: job.savedAt
                        }}
                        isFavorite={true}
                        onToggleFavorite={(jobData, isFav) => handleToggleFavorite(job, isFav)}
                        showFullDescription={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No favorites match your filters
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search term or filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                      }}
                      className="mt-4 btn-secondary"
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <FavoritesEmptyState onSearchJobs={() => router.push('/')} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
