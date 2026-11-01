// src/components/events/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiStar } from 'react-icons/fi';
import { HiPlay } from 'react-icons/hi';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  Music: 'bg-pink-500/20 text-pink-400',
  Technology: 'bg-blue-500/20 text-blue-400',
  Sports: 'bg-green-500/20 text-green-400',
  Art: 'bg-purple-500/20 text-purple-400',
  Food: 'bg-yellow-500/20 text-yellow-400',
  Business: 'bg-indigo-500/20 text-indigo-400',
  Comedy: 'bg-orange-500/20 text-orange-400',
  Education: 'bg-cyan-500/20 text-cyan-400',
  Health: 'bg-emerald-500/20 text-emerald-400',
  Other: 'bg-gray-500/20 text-gray-400',
};

const EventCard = ({ event }) => {
  const { _id, title, category, date, location, price, image, totalSeats, bookedSeats,
          averageRating, totalReviews, status, video } = event;

  const availableSeats = totalSeats - bookedSeats;
  const isSoldOut = availableSeats <= 0;
  const isLive = video?.liveStream?.isLive;

  return (
    <div className="event-card glass rounded-2xl overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-dark-700">
        {image?.url ? (
          <img
            src={image.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[category] || CATEGORY_COLORS.Other}`}>
            {category}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
              <HiPlay size={10} /> LIVE
            </span>
          )}
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm rotate-[-5deg]">SOLD OUT</span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-orange-gradient text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg">
            {price === 0 ? 'FREE' : `₹${price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-white text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FiCalendar size={13} className="text-primary-400 flex-shrink-0" />
            <span>{format(new Date(date), 'EEE, MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FiMapPin size={13} className="text-primary-400 flex-shrink-0" />
            <span className="truncate">{location?.venue}, {location?.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FiUsers size={13} className="text-primary-400 flex-shrink-0" />
              <span>{isSoldOut ? 'Sold out' : `${availableSeats} seats left`}</span>
            </div>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <FiStar size={12} />
                <span className="font-semibold">{averageRating}</span>
                <span className="text-gray-500">({totalReviews})</span>
              </div>
            )}
          </div>
        </div>

        <Link
          to={`/events/${_id}`}
          className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isSoldOut
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-orange-gradient text-white hover:opacity-90 shadow-lg shadow-primary-500/20'
          }`}
          onClick={isSoldOut ? (e) => e.preventDefault() : undefined}
        >
          {isSoldOut ? 'Sold Out' : 'View Details →'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
