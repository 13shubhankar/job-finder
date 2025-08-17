import mongoose from 'mongoose';

// Job schema for favorites
const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  employmentType: { type: String, required: true },
  applyLink: { type: String, required: true },
  companyLogo: { type: String, default: null },
  description: { type: String, default: '' },
  salary: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
}, { _id: true });

// User schema
const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  favorites: [JobSchema],
}, { timestamps: true, collection: 'users' });

// Indexes for faster queries
UserSchema.index({ googleId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'favorites.jobId': 1 });

// Methods
UserSchema.methods.addToFavorites = function(jobData) {
  if (!this.favorites.some(job => job.jobId === jobData.jobId)) {
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
    googleId: profile.sub,   // ✅ fixed (Google uses "sub")
    email: profile.email,
    name: profile.name,
    image: profile.picture,
    favorites: []
  });
};

// Export model safely (hot reload)
export default mongoose.models.User || mongoose.model('User', UserSchema);
