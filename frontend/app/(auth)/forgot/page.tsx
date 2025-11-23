"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f9f4eb] overflow-hidden">
      {/* Animated coral gradient blobs */}
      <div className="bg-[#FA5F55]/20 absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="bg-[#FA5F55]/20 absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-3xl animate-pulse z-0" />
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full max-w-md mx-auto rounded-2xl border border-[#FA5F55]/30 bg-white/60 backdrop-blur-md shadow-xl p-8 relative">
          <div className="text-center">
            <Image 
              src="/images/Logo2.png"
              alt="Logo"
              width={80}
              height={40}
              className="mx-auto"
            />
            <div className="mt-5 space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-[#2a2a2a]">
                Forgot your password?
              </h3>
              <p className="text-[#2a2a2a] text-base">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
          </div>
          {emailSent ? (
            <div className="mt-8 text-center text-[#FA5F55] font-medium">
              If an account exists, a reset link has been sent to your email.
            </div>
          ) : (
            <form className="space-y-6 mt-8" onSubmit={e => { e.preventDefault(); setEmailSent(true); }}>
              <div>
                <label className="font-medium text-[#2a2a2a]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#FA5F55]/30 bg-white/80 px-3 py-2 shadow-sm outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition"
                />
              </div>
              <button className="w-full rounded-lg bg-[#1b1b1b] px-4 py-2 font-medium text-white duration-150 hover:bg-[#fa7a6d] active:bg-[#FA5F55] shadow transition">
                Send reset link
              </button>
            </form>
          )}
          <div className="text-center mt-4">
            <Link href="/login" className="text-[#FA5F55] hover:underline transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
