// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/events/EventCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';
import { FiCalendar, FiUsers, FiShield, FiZap } from 'react-icons/fi';

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education'];

const StatCard = ({ icon, value, label }) => (
  <div className="glass rounded-2xl p-6 text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="font-display font-bold text-3xl gradient-text">{value}</div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="glass rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-orange-gradient flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
      <Icon className="text-white" size={20} />
    </div>
    <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await eventService.getFeaturedEvents();
        setFeatured(data.data.events);
      } catch {
        // fallback silently
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden dot-pattern">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary-400 font-medium mb-8 animate-fade-in">
            <HiSparkles className="animate-spin-slow" />
            India's #1 Event Management Platform
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-slide-up">
            Experience Events
            <br />
            <span className="gradient-text">Like Never Before</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover thousands of events — concerts, tech talks, sports, and more.
            Book tickets instantly, get PDF confirmations, and create memories.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-gradient text-white font-bold rounded-2xl shadow-2xl shadow-primary-500/30 hover:opacity-90 hover:scale-105 transition-all duration-200"
            >
              Explore Events
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-bold rounded-2xl hover:border-primary-500/40 transition-all duration-200"
            >
              Join FESTIVA
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StatCard icon="🎉" value="500+" label="Events Hosted" />
            <StatCard icon="👥" value="50K+" label="Happy Attendees" />
            <StatCard icon="🏙️" value="25+" label="Cities Covered" />
            <StatCard icon="⭐" value="4.9" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-white mb-2">Browse by Category</h2>
          <p className="text-gray-400">Find events that match your passion</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${cat}`}
              className="px-5 py-2.5 glass rounded-full text-sm font-medium text-gray-300 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/10 transition-all duration-200"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Events ────────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl text-white">Featured Events</h2>
            <p className="text-gray-400 mt-1">Hand-picked experiences just for you</p>
          </div>
          <Link to="/events" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
            View all <HiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🎪</div>
            <p className="text-lg">No featured events yet. Check back soon!</p>
            <Link to="/events" className="mt-4 inline-block text-primary-400 hover:underline">Browse all events →</Link>
          </div>
        )}
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-white mb-2">Why Choose FESTIVA?</h2>
          <p className="text-gray-400">Everything you need for a seamless event experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={FiZap} title="Instant Booking" desc="Book tickets in seconds with secure Razorpay payment gateway." />
          <FeatureCard icon={FiShield} title="OTP Verified" desc="Every transaction is secured with email OTP verification." />
          <FeatureCard icon={FiCalendar} title="PDF Tickets" desc="Get beautiful PDF tickets emailed instantly after payment." />
          <FeatureCard icon={FiUsers} title="Live Streaming" desc="Watch events live or access recorded videos anytime." />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-orange-gradient opacity-5"></div>
          <div className="relative">
            <h2 className="font-display font-black text-4xl text-white mb-4">
              Ready to Experience Something Amazing?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of event-goers discovering incredible experiences every day.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-gradient text-white font-bold rounded-2xl shadow-2xl shadow-primary-500/30 hover:opacity-90 hover:scale-105 transition-all"
            >
              <HiSparkles /> Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
