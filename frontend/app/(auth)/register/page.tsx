"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || undefined,
      });
      toast.success('Registration successful! Welcome aboard!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f9f4eb] overflow-hidden">
      {/* Animated coral gradient blobs */}
      <div className="bg-[#FA5F55]/20 absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="bg-[#FA5F55]/20 absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto rounded-2xl border border-[#FA5F55]/30 bg-white/60 backdrop-blur-md shadow-xl p-8 relative">
          <div className="text-center">
            <Image 
              src="/images/Log.png"
              alt="Logo"
              width={180}
              height={40}
              className="mx-auto"
            />
            <div className="mt-5 space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-[#2a2a2a]">
                Create your account
              </h3>
              <p className="">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#FA5F55] hover:text-[#fa7a6d] transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
          <form className="space-y-5 mt-8" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium text-[#2a2a2a]">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="mt-2 w-full rounded-lg border border-[#FA5F55]/30 bg-white/80 px-3 py-2 shadow-sm outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="font-medium text-[#2a2a2a]">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="mt-2 w-full rounded-lg border border-[#FA5F55]/30 bg-white/80 px-3 py-2 shadow-sm outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="font-medium text-[#2a2a2a]">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-[#FA5F55]/30 bg-white/80 px-3 py-2 shadow-sm outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <label className="font-medium text-[#2a2a2a]">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="mt-2 w-full rounded-lg border border-[#FA5F55]/30 bg-white/80 px-3 py-2 shadow-sm outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 mt-2 mr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-[#FA5F55]" />
                  ) : (
                    <Eye size={20} className="text-[#FA5F55]" />
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#FA5F55] px-4 py-2 font-medium text-white duration-150 hover:bg-[#fa7a6d] active:bg-[#FA5F55] shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
