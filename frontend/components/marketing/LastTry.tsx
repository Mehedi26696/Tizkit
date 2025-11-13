"use client";
import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const LastTry = () => {
  return (
    <section className="relative w-full">
      <div className="">
        <div className="relative  overflow-hidden min-h-[400px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/gradient.png"
              alt="Last Try Background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text contrast */}
           
          </div>

          {/* Decorative gradient blobs */}
          <motion.div 
            className="bg-[#FA5F55]/20 absolute top-20 left-20 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Content */}
          <motion.div 
            className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.h1
              variants={fadeInUpVariants}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight font-[helvetica] tracking-tight text-white my-3 sm:mb-6"
            >
              LaTeX Made Easy
            </motion.h1>

            <motion.p
              variants={fadeInUpVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-md sm:text-lg md:text-xl text-white/90 mb-3 sm:mb-4 tracking-tight"
            >
              Edit visually, compile instantly, export perfectly.
            </motion.p>

            <motion.div
              variants={fadeInUpVariants}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 sm:mt-8 md:mt-10"
            >
              <Button
                asChild
                size="lg"
                className="bg-[#1e1e24] hover:bg-[#1e1e24]/90 text-white font-normal px-8 py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#FA5F55]/30"
              >
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-[#FA5F55]/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LastTry;
