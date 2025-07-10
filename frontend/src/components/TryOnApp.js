import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  PhotoIcon, 
  LinkIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TryOnApp = () => {
  const [step, setStep] = useState(1);
  const [dressUrl, setDressUrl] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setUserImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(prev => ({
          ...prev,
          preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const handleSubmit = async () => {
    if (!dressUrl || !userImage) {
      toast.error('Please provide both dress URL and your photo');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('Preparing your images...');

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 'Downloading dress image...', progress: 20 },
        { step: 'Processing your photo...', progress: 40 },
        { step: 'Applying AI magic...', progress: 60 },
        { step: 'Creating virtual try-on...', progress: 80 },
        { step: 'Finalizing results...', progress: 95 }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProcessingStep(progressSteps[currentStep].step);
          setProgress(progressSteps[currentStep].progress);
          currentStep++;
        }
      }, 2000);

      // Prepare form data
      const formData = new FormData();
      formData.append('dress_url', dressUrl);
      formData.append('user_image', userImage);

      // Make API call
      const response = await fetch(`${API}/tryon`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      setProcessingStep('Complete!');
      
      // Get the generated image
      const imageResponse = await fetch(`${API}/tryon/${data.id}/base64`);
      const imageData = await imageResponse.json();
      
      setResult({
        ...data,
        generatedImageData: `data:image/png;base64,${imageData.generated_image_data}`,
        originalImageData: `data:image/png;base64,${imageData.original_image_data}`
      });
      
      setStep(3);
      toast.success('Virtual try-on completed!');
      
    } catch (error) {
      console.error('Error creating try-on:', error);
      toast.error('Failed to create virtual try-on. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgress(0);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.generatedImageData;
    link.download = `virtual-tryon-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const shareImage = async () => {
    if (!result) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Virtual Try-On',
          text: 'Check out how I look in this dress!',
          url: window.location.href
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  const resetApp = () => {
    setStep(1);
    setDressUrl('');
    setUserImage(null);
    setResult(null);
    setIsProcessing(false);
    setProcessingStep('');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo gradient-text">VirtualTryOn</Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tryon" className="text-purple-400">Try Now</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
          </ul>
        </div>
      </nav>

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Virtual <span className="gradient-text">Try-On</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Upload your photo and paste a dress URL to see how it looks on you
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step >= stepNumber 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'border-slate-600 text-slate-400'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-0.5 transition-colors ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-slate-600'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Input Form */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Step 1: Provide Your Details
              </h2>
              
              {/* Dress URL Input */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">
                  <LinkIcon className="h-5 w-5 inline mr-2" />
                  Dress URL
                </label>
                <input
                  type="url"
                  value={dressUrl}
                  onChange={(e) => setDressUrl(e.target.value)}
                  placeholder="Paste the URL of the dress you want to try on..."
                  className="input-field"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Copy and paste the URL from any online store (e.g., Amazon, Zara, etc.)
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">
                  <PhotoIcon className="h-5 w-5 inline mr-2" />
                  Your Photo
                </label>
                <div
                  {...getRootProps()}
                  className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
                >
                  <input {...getInputProps()} />
                  <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  {userImage ? (
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">Photo uploaded successfully!</p>
                      <p className="text-sm text-slate-400">{userImage.name}</p>
                      {userImage.preview && (
                        <img
                          src={userImage.preview}
                          alt="Preview"
                          className="mt-4 max-w-32 max-h-32 object-cover rounded-lg mx-auto"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">
                        {isDragActive ? 'Drop your photo here' : 'Upload your photo'}
                      </p>
                      <p className="text-sm text-slate-400">
                        Drag and drop or click to select • JPG, PNG, WebP • Max 10MB
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  For best results, use a photo where you're wearing a shirt and pants, facing forward
                </p>
              </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!dressUrl || !userImage}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Preview
                </button>
            </motion.div>
          )}

          {/* Step 2: Preview and Confirm */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Step 2: Preview and Confirm
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Dress Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Dress to Try On</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">URL:</div>
                    <div className="text-white text-sm break-all mb-4">{dressUrl}</div>
                    <div className="text-center">
                      <img
                        src={dressUrl}
                        alt="Dress to try on"
                        className="max-w-full max-h-64 object-contain rounded-lg mx-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="text-slate-400 hidden">
                        <PhotoIcon className="h-16 w-16 mx-auto mb-2" />
                        <p>Unable to load image preview</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Photo Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Your Photo</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">File: {userImage.name}</div>
                    <div className="text-center">
                      <img
                        src={userImage.preview}
                        alt="Your photo"
                        className="max-w-full max-h-64 object-contain rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  {isProcessing ? 'Processing...' : 'Create Virtual Try-On'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Processing Screen */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="card max-w-md mx-4 text-center">
                <div className="loading-spinner mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Creating Your Virtual Try-On
                </h3>
                <p className="text-slate-400 mb-6">{processingStep}</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400 mt-2">{progress}% Complete</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Your Virtual Try-On Result
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Original Photo */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Original Photo</h3>
                  <div className="image-container">
                    <img
                      src={result.originalImageData}
                      alt="Original"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>

                {/* Generated Result */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">With Virtual Dress</h3>
                  <div className="image-container">
                    <img
                      src={result.generatedImageData}
                      alt="Virtual try-on result"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadImage}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Download Result
                </button>
                <button
                  onClick={shareImage}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ShareIcon className="h-5 w-5" />
                  Share Result
                </button>
                <button
                  onClick={resetApp}
                  className="btn-secondary"
                >
                  Try Another Dress
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryOnApp;