import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  // The session object is still retrieved in case it's needed for other features in the future,
  // but it's no longer a requirement for the search itself.
  const session = await getServerSession(req, res, authOptions);

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    });
  }

  // A simple map of common country names to their ISO 3166-1 alpha-2 codes.
  // You can expand this map to include more countries as needed.
  const countryCodeMap = {
    'india': 'in',
    'united states': 'us',
    'usa': 'us',
    'united kingdom': 'gb',
    'uk': 'gb',
    'germany': 'de',
    'canada': 'ca',
    'australia': 'au',
    'japan': 'jp',
    'china': 'cn'
  };

  try {
    const { query, location, employment_types } = req.query;

    // Validate required parameters
    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Job title/query is required'
      });
    }

    // Prepare search parameters
    const searchParams = new URLSearchParams({
      query: query.trim(),
      page: '1',
      num_pages: '1',
      date_posted: 'all',
    });

    // Determine the country code based on the provided location string.
    let countryCode = null;
    if (location && location.trim() !== '') {
      const lowerCaseLocation = location.trim().toLowerCase();
      // Check if the location is a full country name in our map.
      if (countryCodeMap[lowerCaseLocation]) {
        countryCode = countryCodeMap[lowerCaseLocation];
      } else {
        // If it's not a country, treat it as a city/state and just append it as the location.
        searchParams.append('location', location.trim());
      }
    }

    // Explicitly add the country code if it was determined.
    // This is the key change to ensure the API searches outside the US.
    if (countryCode) {
      searchParams.append('country', countryCode);
    }

    // Add employment types if provided
    if (employment_types && employment_types.length > 0) {
      const types = Array.isArray(employment_types) ? employment_types : [employment_types];
      searchParams.append('employment_types', types.join(','));
    }

    // Prepare request options
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
      }
    };

    // Construct the full API URL.
    const apiUrl = `https://${options.headers['X-RapidAPI-Host']}/search?${searchParams}`;
    console.log('Fetching jobs from:', apiUrl);

    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('JSearch API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });

      return res.status(response.status).json({
        error: 'External API Error',
        message: 'Failed to fetch jobs from external service',
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    const data = await response.json();

    // Transform and clean the job data
    const jobs = data.data || [];
    const transformedJobs = jobs.map(job => ({
      id: job.job_id || `${job.employer_name}-${Date.now()}`,
      title: job.job_title || 'No title available',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state
        ?` ${job.job_city}, ${job.job_state} `
        : job.job_country || 'Location not specified',
      employmentType: job.job_employment_type || 'Not specified',
      applyLink: job.job_apply_link || '#',
      companyLogo: job.employer_logo || null,
      description: job.job_description || '',
      salary: job.job_salary || '',
      postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
      requirements: job.job_required_skills || [],
      benefits: job.job_benefits || [],
      isRemote: job.job_is_remote || false
    }));

    // Return successful response
    res.status(200).json({
      success: true,
      data: transformedJobs,
      total: transformedJobs.length,
      query: {
        searchTerm: query,
        location: location || null,
        employmentTypes: employment_types || null,
        country: countryCode || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Job search error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Unable to connect to job search service. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while searching for jobs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
