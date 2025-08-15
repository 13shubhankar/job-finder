import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../components/Navbar';
import JobSearch from '../components/JobSearch';
import JobCard from '../components/JobCard';
import { SearchResultsLoading } from '../components/LoadingSpinner';
import { SearchEmptyState, WelcomeEmptyState, ErrorEmptyState } from '../components/EmptyState';
import { FaLinkedin } from 'react-icons/fa';

// ... your imports stay the same

export default function HomePage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (session) {
      loadFavorites();
    }
  }, [session]);

  const loadFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites');
      const favoriteIds = new Set(response.data.data.map(job => job.jobId));
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    setSearchQuery(searchData);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: searchData.query,
        ...(searchData.location && { location: searchData.location }),
        ...(searchData.employmentTypes?.length > 0 && { 
          employment_types: searchData.employmentTypes.join(',') 
        })
      });

      const response = await axios.get(`/api/jobs/search?${params}`);

      if (response.data.success) {
        setJobs(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (job, isFavorite) => {
    if (!session) {
      alert('Please sign in to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await axios.post('/api/favorites', {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          employmentType: job.employmentType,
          applyLink: job.applyLink,
          companyLogo: job.companyLogo,
          description: job.description,
          salary: job.salary
        });
        setFavorites(prev => new Set([...prev, job.id]));
      } else {
        await axios.delete(`/api/favorites?jobId=${job.id}`);
        setFavorites(prev => {
          const updated = new Set(prev);
          updated.delete(job.id);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert(err.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleReset = () => {
    setJobs([]);
    setError(null);
    setSearchQuery(null);
    setHasSearched(false);
  };

  const renderContent = () => {
    if (loading) return <SearchResultsLoading />;

    if (error) {
      return (
        <ErrorEmptyState 
          error={error}
          onRetry={() => searchQuery && handleSearch(searchQuery)}
        />
      );
    }

    if (hasSearched && jobs.length > 0) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Found {jobs.length} jobs
                {searchQuery?.query && ` for "${searchQuery.query}"`}
                {searchQuery?.location && ` in ${searchQuery.location}`}
              </p>
            </div>
            <button onClick={handleReset} className="btn-secondary text-sm">
              New Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favorites.has(job.id)}
                onToggleFavorite={(jobData, favStatus) => handleToggleFavorite(jobData, favStatus)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (hasSearched && jobs.length === 0) {
      return <SearchEmptyState searchTerm={searchQuery?.query} onReset={handleReset} />;
    }

    return <WelcomeEmptyState />;
  };

  return (
    <>
      <Head>
        <title>
          {hasSearched && searchQuery?.query 
            ? `${searchQuery.query} Jobs - JobFinder`
            : 'JobFinder - Find Your Dream Job'}
        </title>
        <meta
          name="description"
          content={
            hasSearched && searchQuery?.query
              ? `Find ${searchQuery.query} jobs${searchQuery.location ? ` in ${searchQuery.location}` : ''}. Browse opportunities from top companies.`
              : 'Search thousands of job opportunities from top companies worldwide. Find your perfect career match today.'
          }
        />
      </Head>

      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <JobSearch onSearch={handleSearch} loading={loading} />
          </div>
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>

         <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                JobFinder
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-semibold">
              Find opportunities <span className="font-semibold">• Save favorites</span> • Land your dream job
            </p>

            <div className="my-4 border-t border-gray-300 dark:border-gray-700 w-1/3 mx-auto"></div>

            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              <a
                href="https://www.linkedin.com/in/shubhankarraj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 text-blue-600 bg-white"
              >
                <FaLinkedin size={18} />
              </a>
              Made by <span className="font-semibold">NextBroX</span>
              <a
                href="https://www.linkedin.com/in/deepankaraj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800  text-blue-600 bg-white"
              >
                <FaLinkedin size={18} />
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
