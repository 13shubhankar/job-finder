import mongoose from 'mongoose';

// Job schema for favorites
const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    required: true
  },
  applyLink: {
    type: String,
    required: true
  },
  companyLogo: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  salary: {
    type: String,
    default: ''
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true // Enable _id for subdocuments
});

// User schema
const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  favorites: [JobSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Index for faster queries
UserSchema.index({ googleId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'favorites.jobId': 1 });

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
UserSchema.methods.addToFavorites = function(jobData) {
  // Check if job already exists in favorites
  const existingJob = this.favorites.find(job => job.jobId === jobData.jobId);
  if (!existingJob) {
    this.favorites.push(jobData);
  }
  return this.save();
};

UserSchema.methods.removeFromFavorites = function(jobId) {
  this.favorites = this.favorites.filter(job => job.jobId !== jobId);
  return this.save();
};

UserSchema.methods.isFavorite = function(jobId) {
  return this.favorites.some(job => job.jobId === jobId);
};

// Static methods
UserSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

UserSchema.statics.createFromGoogle = function(profile) {
  return this.create({
    googleId: profile.id,
    email: profile.email,
    name: profile.name,
    image: profile.picture,
    favorites: []
  });
};

// Export model
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', UserSchema);
}

export default User;
