'use client';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login({
        username: formData.email,
        password: formData.password,
      });
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f9f4eb] overflow-hidden">
      {/* Animated coral gradient blobs */}
      <div className="bg-[#FA5F55]/20 absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="bg-[#FA5F55]/20 absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto rounded-2xl border border-[#FA5F55]/30 bg-white/30 p-8 relative">
          <div className="text-center">
            <Image 
              src="/images/Logo2.png"
              alt="Logo"
              width={80}
              height={40}
              className="mx-auto"
              style={{ height: 'auto' }}
            />
            <div className="mt-5 space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-[#2a2a2a]">
                Log in to your account
              </h3>
              <p className="">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-[#FA5F55] hover:text-[#fa7a6d] transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium text-[#2a2a2a]">Email</label>
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
            <div className="relative">
              <label className="font-medium text-[#2a2a2a]">Password</label>
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
              className="w-full rounded-lg bg-[#252525] px-4 py-2 font-medium text-white duration-150 hover:bg-[#fa7a6d] active:bg-[#FA5F55] shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link href="/forgot" className="text-[#FA5F55] hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
