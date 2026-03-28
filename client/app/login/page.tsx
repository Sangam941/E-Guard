'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, AlertCircle, Zap, Mic, Phone, Lock, ImageIcon, ArrowRight, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'motion/react';

export default function LoginPage() {

  const { login, loading } = useAuthStore()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleStart = () => {
    setShowLogin(true);
  };

  if (!showLogin) {
    // Landing Page - Enhanced UI
    return (
      <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
        {/* Animated background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/80 to-gray-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <motion.div 
              className="text-center mb-16 sm:mb-20 md:mb-28"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center justify-center mb-6 sm:mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur-2xl opacity-60"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center border-2 border-green-400/50 shadow-2xl shadow-green-600/50">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <motion.div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-transparent to-green-400" />
                  <span className="text-green-400 text-xs sm:text-sm font-bold tracking-widest uppercase px-3 py-1 bg-green-600/20 rounded-full border border-green-600/50">
                    🚀 AI-Powered Safety
                  </span>
                  <motion.div className="h-1 w-8 sm:w-12 bg-gradient-to-l from-transparent to-green-400" />
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-green-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                  E-Guard AI
                </h1>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-200 mb-6 sm:mb-8 leading-tight">
                  Your Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Digital Guardian</span>
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
                  Advanced AI threat detection, real-time emergency response, and military-grade secure evidence preservation. 
                  <br className="hidden sm:block" />
                  Stay protected 24/7 with end-to-end encryption and intelligent safety assistance.
                </p>
              </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="mb-20 sm:mb-28 md:mb-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <motion.h3 
                className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Powerful <span className="text-green-400">Core Features</span>
              </motion.h3>
              <p className="text-center text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto">
                Everything you need to stay safe in one intelligent platform
              </p>

              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl w-full">
                  {[
                    { icon: Shield, label: 'SOS Alert', description: 'Emergency Response', color: 'from-red-600 to-red-400', lightColor: 'red', delay: 0.1 },
                    { icon: Phone, label: 'Fake Call', description: 'Escape Tool', color: 'from-orange-600 to-orange-400', lightColor: 'orange', delay: 0.3 },
                    { icon: ImageIcon, label: 'Evidence', description: 'Secure Vault', color: 'from-green-600 to-green-400', lightColor: 'green', delay: 0.4 },
                  ].map((feature, i) => (
                  <motion.button
                    key={i}
                    onClick={handleStart}
                    className={`relative group h-full overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-500 hover:shadow-2xl border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: feature.delay + 0.4 }}
                    whileHover={{ scale: 1.08, y: -15 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    {/* Glow effect on hover */}
                    <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl sm:rounded-3xl`} />
                    
                    {/* Card content */}
                    <div className="relative z-10">
                      <motion.div 
                        className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.color} shadow-xl group-hover:shadow-2xl transition-all duration-500`}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
                      >
                        <feature.icon className="w-8 sm:w-10 h-8 sm:h-10 text-white drop-shadow-lg" />
                      </motion.div>
                      <p className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">{feature.label}</p>
                      <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 font-medium">{feature.description}</p>
                      <motion.div 
                        className="mt-4 flex items-center justify-center gap-1 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-xs font-semibold">Explore</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </motion.button>
                ))}
                </div>
              </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div 
              className="mb-20 sm:mb-28"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <motion.h3 
                className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Why Users <span className="text-green-400">Trust E-Guard</span>
              </motion.h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {[
                  { icon: '🔐', title: 'Military-Grade Encryption', desc: 'AES-256 encryption with automatic secure cloud backup' },
                  { icon: '⚡', title: '24/7 Real-Time Monitoring', desc: 'AI-powered threat detection working every second' },
                  { icon: '🛡️', title: 'Instant Emergency Response', desc: 'One-tap SOS with automatic location sharing' },
                  { icon: '📱', title: 'Works Everywhere', desc: 'Mobile-first design for any device, online or offline' },
                  { icon: '🤖', title: 'AI Safety Assistant', desc: 'Get instant safety tips and personalized guidance' },
                  { icon: '✅', title: 'Tamper-Proof Records', desc: 'Immutable timestamped evidence for legal use' },
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="group relative bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-green-500/40 hover:from-gray-800/70 hover:to-gray-700/50 transition-all duration-500 overflow-hidden"
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 40 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 * i + 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 sm:gap-6">
                        <div className="text-4xl sm:text-5xl flex-shrink-0 filter drop-shadow-lg">{benefit.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">{benefit.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              className="mb-16 sm:mb-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="relative bg-gradient-to-r from-green-600/25 via-blue-600/15 to-purple-600/25 backdrop-blur-xl border border-green-500/40 rounded-3xl sm:rounded-4xl p-8 sm:p-12 md:p-20 overflow-hidden group hover:border-green-500/60 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 text-center">
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Ready to Take <span className="text-green-400">Control</span> of Your Safety?
                  </motion.h3>
                  <motion.p 
                    className="text-gray-300 mb-8 sm:mb-12 text-sm sm:text-lg max-w-2xl mx-auto font-light"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Join thousands of users worldwide who are already protected with E-Guard AI
                  </motion.p>
                  
                  <motion.button
                    onClick={handleStart}
                    className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 hover:from-green-500 hover:via-green-400 hover:to-green-300 text-white font-bold py-5 px-10 sm:py-6 sm:px-12 rounded-full transition-all duration-300 flex items-center justify-center gap-3 text-lg sm:text-xl shadow-lg hover:shadow-2xl hover:shadow-green-600/50 group mx-auto"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <span>Get Started Now</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Footer CTA */}
            <motion.div 
              className="text-center border-t border-gray-800/50 pt-8 sm:pt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <p className="text-gray-400 text-sm sm:text-base mb-4">Already have an account?</p>
              <button 
                onClick={() => setShowLogin(true)} 
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold text-lg transition-all group"
              >
                <span>Sign in</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </button>
              <p className="text-xs text-gray-600 mt-8">
                🔒 Military-Grade Security • 🌍 24/7 Global Protection • 🤖 AI-Powered Intelligence
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Login Form Page
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 py-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-green-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-green-600/30">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-4">Sign in to your E-Guard AI account</p>
          <motion.button 
            onClick={() => setShowLogin(false)}
            className="text-xs text-gray-500 hover:text-gray-300 mt-2 transition-colors inline-flex items-center gap-1"
            whileHover={{ x: -5 }}
          >
            ← Back to home
          </motion.button>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                Email Address
              </label>
              <motion.input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="Enter your email"
                whileFocus={{ scale: 1.02 }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all"
                  placeholder="Enter your password"
                  whileFocus={{ scale: 1.02 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-gray-800 border border-gray-700 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-green-400 hover:text-green-300 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-600/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Register Link */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-400 hover:text-green-300 transition-colors font-semibold">
              Sign up
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-gray-500">
            Your security is our priority • Your data is encrypted and secure
          </p>
        </motion.div>
      </div>
    </div>
  );
}