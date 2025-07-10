import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon, SparklesIcon, CameraIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1459550532302-ba13832edcdf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHx2aXJ0dWFsJTIwdHJ5LW9ufGVufDB8fHx8MTc1MjEzNjYwMnww&ixlib=rb-4.1.0&q=85",
      title: "Virtual Reality Fashion",
      description: "Experience the future of fashion"
    },
    {
      url: "https://images.pexels.com/photos/32904016/pexels-photo-32904016.jpeg",
      title: "Fashion Technology",
      description: "AI-powered virtual try-on"
    },
    {
      url: "https://images.unsplash.com/photo-1535730142260-496e3db19f6f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTIwNDA4NjV8MA&ixlib=rb-4.1.0&q=85",
      title: "Smart Shopping",
      description: "Try before you buy"
    }
  ];

  const features = [
    {
      icon: <CameraIcon className="h-8 w-8" />,
      title: "Upload Your Photo",
      description: "Simply upload a photo of yourself wearing regular clothes"
    },
    {
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      title: "Choose Your Dress",
      description: "Paste any dress URL from your favorite online store"
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "AI Magic",
      description: "Our advanced AI creates a realistic try-on experience"
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: "Perfect Fit",
      description: "See how the dress looks on you before making a purchase"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "This app saved me from so many returns! I can see exactly how dresses look on me.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e5a8c1?w=150"
    },
    {
      name: "Emma Davis",
      rating: 5,
      comment: "The AI is incredibly accurate. The virtual try-on looks so realistic!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    },
    {
      name: "Lisa Chen",
      rating: 5,
      comment: "I love how easy it is to try on multiple dresses without leaving my home.",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo gradient-text">VirtualTryOn</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tryon">Try Now</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Try On</span>
                <br />
                <span className="text-white">Any Dress</span>
                <br />
                <span className="text-slate-300">Virtually</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-xl">
                Experience the future of online shopping with our AI-powered virtual try-on technology. 
                See how any dress looks on you before making a purchase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/tryon"
                  className="btn-primary inline-flex items-center gap-2 justify-center"
                >
                  Try Now <ChevronRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/gallery"
                  className="btn-secondary inline-flex items-center gap-2 justify-center"
                >
                  View Gallery
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-200">{image.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Our simple 4-step process makes virtual try-on effortless and accurate
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="card text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-6 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of satisfied customers who love our virtual try-on experience
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-300">"{testimonial.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Try on any dress virtually with our cutting-edge AI technology. It's free, fast, and incredibly accurate.
            </p>
            <Link
              to="/tryon"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors"
            >
              Start Virtual Try-On <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="logo gradient-text text-2xl mb-4">VirtualTryOn</div>
            <p className="text-slate-400 mb-6">
              Experience the future of online fashion shopping with AI-powered virtual try-on technology.
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link to="/tryon" className="text-slate-400 hover:text-white transition-colors">Try Now</Link>
              <Link to="/gallery" className="text-slate-400 hover:text-white transition-colors">Gallery</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;