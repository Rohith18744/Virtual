import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  CalendarIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Gallery = () => {
  const [tryons, setTryons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTryon, setSelectedTryon] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    fetchTryons();
  }, []);

  const fetchTryons = async () => {
    try {
      const response = await fetch(`${API}/tryons`);
      if (!response.ok) throw new Error('Failed to fetch try-ons');
      
      const data = await response.json();
      
      // Fetch images for each tryon
      const tryonsWithImages = await Promise.all(
        data.map(async (tryon) => {
          try {
            const imageResponse = await fetch(`${API}/tryon/${tryon.id}/base64`);
            const imageData = await imageResponse.json();
            return {
              ...tryon,
              generatedImageData: `data:image/png;base64,${imageData.generated_image_data}`,
              originalImageData: `data:image/png;base64,${imageData.original_image_data}`
            };
          } catch (error) {
            console.error(`Error fetching image for tryon ${tryon.id}:`, error);
            return tryon;
          }
        })
      );
      
      setTryons(tryonsWithImages);
    } catch (error) {
      console.error('Error fetching try-ons:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (tryonId) => {
    if (feedback.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tryon_id: tryonId,
          rating: feedback.rating,
          comment: feedback.comment
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      toast.success('Thank you for your feedback!');
      setFeedback({ rating: 0, comment: '' });
      setSelectedTryon(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo gradient-text">VirtualTryOn</Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tryon">Try Now</Link></li>
            <li><Link to="/gallery" className="text-purple-400">Gallery</Link></li>
          </ul>
        </div>
      </nav>

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Try-On <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Explore virtual try-on results from our community
            </p>
          </div>

          {/* Gallery Grid */}
          {tryons.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Try-Ons Yet</h3>
              <p className="text-slate-400 mb-6">
                Be the first to create a virtual try-on! Start by uploading your photo and selecting a dress.
              </p>
              <Link to="/tryon" className="btn-primary inline-flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Create Your First Try-On
              </Link>
            </div>
          ) : (
            <div className="gallery-grid">
              {tryons.map((tryon, index) => (
                <motion.div
                  key={tryon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="gallery-item"
                >
                  <div className="relative group">
                    <img
                      src={tryon.generatedImageData || '/placeholder-image.jpg'}
                      alt="Virtual try-on result"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setSelectedTryon(tryon)}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(tryon.timestamp)}
                    </div>
                    <p className="text-white font-medium mb-2">Virtual Try-On Result</p>
                    <p className="text-slate-400 text-sm">
                      Status: <span className="capitalize text-green-400">{tryon.status}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing details */}
      {selectedTryon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Try-On Details</h2>
              <button
                onClick={() => setSelectedTryon(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Original Photo */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Original Photo</h3>
                <img
                  src={selectedTryon.originalImageData}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              </div>

              {/* Generated Result */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Virtual Try-On Result</h3>
                <img
                  src={selectedTryon.generatedImageData}
                  alt="Virtual try-on result"
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{formatDate(selectedTryon.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-green-400 capitalize">{selectedTryon.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dress URL:</span>
                  <a 
                    href={selectedTryon.dress_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 truncate max-w-xs"
                  >
                    View Original Dress
                  </a>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Rate This Try-On</h4>
              
              {/* Star Rating */}
              <div className="star-rating mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedback({...feedback, rating: star})}
                    className={`star ${feedback.rating >= star ? 'filled' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              {/* Comment */}
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                placeholder="Leave a comment about this try-on result..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none"
                rows="3"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleFeedbackSubmit(selectedTryon.id)}
                  className="btn-primary"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setSelectedTryon(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;