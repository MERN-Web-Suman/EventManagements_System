// src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-dark-800 border-t border-white/5 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center">
              <HiSparkles className="text-white text-sm" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">FESTIVA</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Your ultimate event management platform. Discover, book, and experience unforgettable events.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-400 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4 text-sm">Quick Links</h4>
          <ul className="space-y-2">
            {[['Events', '/events'], ['Login', '/login'], ['Register', '/register']].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>support@festiva.com</li>
            <li>+91 9876543210</li>
            <li>Mon–Sat, 9am–6pm IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 mt-10 pt-6 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} FESTIVA. All rights reserved. Built with ❤️ for event lovers.
      </div>
    </div>
  </footer>
);

export default Footer;
