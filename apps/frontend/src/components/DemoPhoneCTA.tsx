'use client';

import { useState } from 'react';

interface DemoPhoneCTAProps {
  phoneNumber?: string;
  className?: string;
}

export default function DemoPhoneCTA({ 
  phoneNumber = process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER || '(555) 123-4567',
  className = ''
}: DemoPhoneCTAProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    }
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber.replace(/[^\d]/g, '')}`, '_self');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Animated pulse background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-75 animate-pulse"></div>
      
      {/* Main CTA Card */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 border-2 border-blue-200">
        <div className="text-center">
          {/* Phone Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg 
              className="h-8 w-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
              />
            </svg>
          </div>

          {/* Headline */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Try ProntoPlus Now
          </h3>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            Call our AI receptionist demo and experience the future of orthodontic patient management
          </p>

          {/* Phone Number Display */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2 font-mono">
              {phoneNumber}
            </div>
            <div className="flex items-center justify-center text-sm text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Available 24/7
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Call Button (Mobile) */}
            <button
              onClick={handleCall}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center sm:hidden"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </button>

            {/* Copy Button (Desktop) */}
            <button
              onClick={handleCopyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center hidden sm:flex"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Number'}
            </button>

            {/* Call Button (Desktop) */}
            <button
              onClick={handleCall}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center hidden sm:flex"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Demo
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Response
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Natural Conversation
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Lead Capture
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
}
