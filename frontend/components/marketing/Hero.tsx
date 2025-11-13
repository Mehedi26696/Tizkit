// Hero component

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Navbar from '../common/Navbar';

export default function GradientHero() {
  return (
    <div className=" relative w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="bg-[#f9f4eb] absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-[#FA5F55]/40 absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FA5F5533_1px,transparent_1px),linear-gradient(to_bottom,#FA5F5533_1px,transparent_1px)] bg-[size:16px_16px] opacity-15"></div>

      {/* Navbar at top center */}
      <div className="relative z-20 flex justify-center pt-4">
        <Navbar/>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex justify-center"
            >
            <div className="border-[#FA5F55]/70 bg-white/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
              
              <span className="text-gray-600">
                Visual editing, AI-assisted, & Instant preview
              </span>
              <ChevronRight className="text-gray-600 ml-1 h-4 w-4" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="from-[#FA5F55] via-gray-800/90 to-gray-700/80 bg-gradient-to-tl bg-clip-text text-center text-4xl tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Create LaTeX the way you think
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-700 mx-auto mt-6 max-w-2xl text-center text-lg"
          >
            Tikzit turns ideas into elegant diagrams, tables, and papers—without the friction.
          
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="group bg-[#FA5F55] text-white hover:shadow-[#FF7F50]/30 relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="from-[#FA5F55] via-[#FA5F55]/90 to-[#FA5F55]/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-[#FA5F55]/30 bg-white/50 text-gray-700 hover:border-[#FA5F55]/50 flex items-center gap-2 rounded-full backdrop-blur-sm transition-colors"
            >
              No install · Daily credits included
            </Button>
          </motion.div>

          {/* Feature Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: 'spring',
              stiffness: 50,
            }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="border-[#FA5F55]/20 bg-white/50 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
              <div className="border-[#FA5F55]/20 bg-[#FA5F55]/5 flex h-10 items-center border-b px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-white/50 text-gray-600 mx-auto flex items-center rounded-md px-3 py-1 text-xs">
                  https://tikzit.app
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://i.postimg.cc/0yk8Vz7t/dashboard.webp"
                  alt="Dashboard Preview"
                  className="w-full"
                />
                <div className="from-white absolute inset-0 bg-gradient-to-t to-transparent opacity-0"></div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="border-[#FA5F55]/20 bg-white/80 absolute -top-6 -right-6 h-12 w-12 rounded-lg border p-3 shadow-lg backdrop-blur-md">
              <div className="bg-[#FA5F55]/20 h-full w-full rounded-md"></div>
            </div>
            <div className="border-[#FA5F55]/20 bg-white/80 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-lg backdrop-blur-md"></div>
            <div className="border-[#FA5F55]/20 bg-white/80 absolute right-12 -bottom-6 h-10 w-10 rounded-lg border p-2 shadow-lg backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-[#FA5F55]/20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
