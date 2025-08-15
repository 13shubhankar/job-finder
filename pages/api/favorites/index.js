import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectMongoDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'You must be signed in to manage favorites' 
    });
  }

  try {
    await connectMongoDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account not found in database' 
      });
    }

    switch (req.method) {
      case 'GET':
        return handleGetFavorites(req, res, user);
      case 'POST':
        return handleAddFavorite(req, res, user);
      case 'DELETE':
        return handleRemoveFavorite(req, res, user);
      default:
        return res.status(405).json({ 
          error: 'Method not allowed',
          message: `${req.method} method is not supported` 
        });
    }
  } catch (error) {
    console.error('Favorites API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET /api/favorites - Get user's favorite jobs
async function handleGetFavorites(req, res, user) {
  try {
    const { page = 1, limit = 10, sortBy = 'savedAt', order = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort favorites
    const sortOrder = order === 'asc' ? 1 : -1;
    let sortedFavorites = [...user.favorites];
    
    if (sortBy === 'savedAt') {
      sortedFavorites.sort((a, b) => (new Date(b.savedAt) - new Date(a.savedAt)) * sortOrder);
    } else if (sortBy === 'title') {
      sortedFavorites.sort((a, b) => a.title.localeCompare(b.title) * sortOrder);
    } else if (sortBy === 'company') {
      sortedFavorites.sort((a, b) => a.company.localeCompare(b.company) * sortOrder);
    }
    
    // Apply pagination
    const paginatedFavorites = sortedFavorites.slice(skip, skip + limitNum);
    
    return res.status(200).json({
      success: true,
      data: paginatedFavorites,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(user.favorites.length / limitNum),
        totalItems: user.favorites.length,
        itemsPerPage: limitNum,
        hasNextPage: skip + limitNum < user.favorites.length,
        hasPrevPage: pageNum > 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve favorites',
      message: error.message
    });
  }
}

// POST /api/favorites - Add job to favorites
async function handleAddFavorite(req, res, user) {
  try {
    const jobData = req.body;
    
    // Validate required fields
    const requiredFields = ['id', 'title', 'company', 'location', 'employmentType', 'applyLink'];
    const missingFields = requiredFields.filter(field => {
      const value = field === 'id' ? jobData.id : jobData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check if job already exists in favorites
    const existingJob = user.favorites.find(job => job.jobId === jobData.id);
    if (existingJob) {
      return res.status(409).json({
        error: 'Already in favorites',
        message: 'This job is already in your favorites',
        data: existingJob
      });
    }
    
    // Prepare job data for saving
    const favoriteJobData = {
      jobId: jobData.id,
      title: jobData.title.trim(),
      company: jobData.company.trim(),
      location: jobData.location.trim(),
      employmentType: jobData.employmentType,
      applyLink: jobData.applyLink,
      companyLogo: jobData.companyLogo || null,
      description: jobData.description || '',
      salary: jobData.salary || '',
      savedAt: new Date()
    };
    
    // Add to favorites using model method
    await user.addToFavorites(favoriteJobData);
    
    return res.status(201).json({
      success: true,
      message: 'Job added to favorites successfully',
      data: favoriteJobData,
      totalFavorites: user.favorites.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({
      error: 'Failed to add favorite',
      message: error.message
    });
  }
}

// DELETE /api/favorites - Remove job from favorites
async function handleRemoveFavorite(req, res, user) {
  try {
    const { jobId } = req.query;
    
    if (!jobId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Job ID is required'
      });
    }
    
    // Check if job exists in favorites
    const existingJob = user.favorites.find(job => job.jobId === jobId);
    if (!existingJob) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Job not found in favorites'
      });
    }
    
    // Remove from favorites using model method
    await user.removeFromFavorites(jobId);
    
    return res.status(200).json({
      success: true,
      message: 'Job removed from favorites successfully',
      removedJob: existingJob,
      totalFavorites: user.favorites.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({
      error: 'Failed to remove favorite',
      message: error.message
    });
  }
}