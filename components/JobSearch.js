import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, MapPin, Briefcase, Loader2 } from 'lucide-react';

export default function JobSearch({ onSearch, loading }) {
  const { data: session } = useSession();
  const [searchData, setSearchData] = useState({
    query: '',
    location: '',
    employmentTypes: []
  });
  const [errors, setErrors] = useState({});

  const employmentOptions = [
    { value: 'FULLTIME', label: 'Full-time' },
    { value: 'PARTTIME', label: 'Part-time' },
    { value: 'CONTRACTOR', label: 'Contract' },
    { value: 'INTERN', label: 'Internship' }
  ];

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleEmploymentTypeChange = (type) => {
    setSearchData(prev => ({
      ...prev,
      employmentTypes: prev.employmentTypes.includes(type)
        ? prev.employmentTypes.filter(t => t !== type)
        : [...prev.employmentTypes, type]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!searchData.query.trim()) {
      newErrors.query = 'Job title or keywords are required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSearch(searchData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-pink-50 dark:bg-slate-900 rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200 dark:border-gray-800 backdrop-blur-sm transition-all hover:shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text dark:text-transparent animate-gradient">
            Find Your Next Dream Job
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Search thousands of curated job opportunities from top companies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="job-title" className="block text-sm font-semibold text-white dark:text-gray-300">
              Job Title or Keywords *
            </label>
            <div className="relative group">
              <Briefcase className="absolute inset-y-3 left-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-purple-500 transition-colors" />
              <input

                id="job-title"
                type="text"
                value={searchData.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager..."
                className={`w-full pl-10 input-field border rounded-lg py-3 px-4 bg-white dark:bg-gray-800 text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-blue-500 dark:focus:border-purple-500 transition-all ${
                  errors.query ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                disabled={loading}
              />
            </div>
            {errors.query && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.query}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Location (Optional)
            </label>
            <div className="relative group">
              <MapPin className="absolute inset-y-3 left-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-purple-500 transition-colors" />
              <input
                id="location"
                type="text"
                value={searchData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. New York, Remote..."
                className="w-full pl-10 input-field border rounded-lg py-3 px-4 bg-white dark:bg-gray-800 text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-blue-500 dark:focus:border-purple-500 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Employment Type (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {employmentOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-purple-500 cursor-pointer transition-all ${
                    searchData.employmentTypes.includes(option.value) ? 'border-blue-500 ring-2 ring-blue-500 dark:border-purple-500 dark:ring-purple-500' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={searchData.employmentTypes.includes(option.value)}
                    onChange={() => handleEmploymentTypeChange(option.value)}
                    className="h-4 w-4 text-blue-600 dark:text-purple-600 focus:ring-blue-500 dark:focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !searchData.query.trim()}
              className="flex-1 py-3 text-lg rounded-lg bg-blue-600 dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Jobs
                </>
              )}
            </button>
          </div>
        </form>

        {session && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400 gap-y-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                Live job search
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                1000+ companies
              </div>
              {session.user?.favoritesCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {session.user.favoritesCount} saved jobs
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
