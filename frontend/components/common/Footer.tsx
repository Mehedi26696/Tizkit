// Footer component
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Twitter,
  Moon,
  Sun,
  ArrowDownLeft,
  MessageCircle,
} from 'lucide-react';

const data = () => ({
  navigation: {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Documentation', href: '/docs' },
    ],
    resources: [
      { name: 'LaTeX Guide', href: '/guide' },
      { name: 'TikZ Examples', href: '/examples' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
  socialLinks: [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: MessageCircle, label: 'Discord', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
  ],
  bottomLinks: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
});

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function FooterStandard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  if (!mounted) return null;

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Decorative gradient blobs */}
      <motion.div 
        className="bg-[#FA5F55]/10 absolute top-20 left-10 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
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
      <motion.div 
        className="bg-[#FA5F55]/10 absolute bottom-20 right-10 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      {/* Top border with animation */}
      <div className="animate-energy-flow via-[#FA5F55] h-px w-full bg-gradient-to-r from-transparent to-transparent" />
      
      <div className="relative w-full px-4 sm:px-6 md:px-8">
        {/* Top Section */}
        <motion.div 
          className="container m-auto grid grid-cols-1 gap-8 sm:gap-10 md:gap-12 py-12 sm:py-16 md:py-20 lg:grid-cols-5"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {/* Company Info */}
          <motion.div 
            className="space-y-4 sm:space-y-6 lg:col-span-2"
            variants={fadeInUpVariants}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image 
                  src="/images/Log.png" 
                  alt="Tikzit Logo" 
                  width={132} 
                  height={132}
                  className="transition-all duration-300"
                />
              </motion.div>
            </Link>
            <motion.p 
              className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed"
              variants={fadeInUpVariants}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Create LaTeX the way you think. Turn ideas into elegant diagrams, tables, and papers—without the friction.
            </motion.p>
            <motion.div 
              className="flex items-center gap-2 flex-wrap"
              variants={fadeInUpVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex gap-2">
                {data().socialLinks.map(({ icon: Icon, label, href }, index) => (
                  <motion.div
                    key={label}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      asChild
                      className="border-[#FA5F55]/30 hover:border-[#FA5F55] hover:bg-[#FA5F55] hover:text-white cursor-pointer shadow-none transition-all duration-500 hover:scale-110 hover:-rotate-12 hover:shadow-lg"
                    >
                      <Link href={href}>
                        <Icon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: data().socialLinks.length * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="border-[#FA5F55]/30 hover:border-[#FA5F55] hover:bg-[#FA5F55] hover:text-white cursor-pointer shadow-none transition-all duration-500 hover:scale-110 hover:-rotate-12 hover:shadow-lg"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div 
            className="grid w-full grid-cols-2 items-start justify-between gap-6 sm:gap-8 lg:col-span-3"
            variants={fadeInUpVariants}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {(['product', 'company', 'resources', 'legal'] as const).map(
              (section, sectionIndex) => (
                <motion.div 
                  key={section} 
                  className="w-full"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
                >
                  <h3 className="border-[#FA5F55] mb-3 sm:mb-4 -ml-4 sm:-ml-5 border-l-2 pl-4 sm:pl-5 text-sm font-semibold tracking-wider uppercase">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {data().navigation[section].map((item, itemIndex) => (
                      <motion.li 
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05), duration: 0.4 }}
                      >
                        <Link
                          href={item.href}
                          className="group text-muted-foreground hover:text-[#FA5F55] decoration-[#FA5F55] -ml-4 sm:-ml-5 inline-flex items-center gap-2 text-sm sm:text-base underline-offset-8 transition-all duration-500 hover:pl-4 sm:hover:pl-5 hover:underline"
                        >
                          <ArrowDownLeft className="text-[#FA5F55] rotate-[225deg] opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100" />
                          {item.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ),
            )}
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <div className="animate-rotate-3d via-[#FA5F55] h-px w-full bg-gradient-to-r from-transparent to-transparent" />
        <motion.div 
          className="text-muted-foreground container m-auto flex flex-col items-center justify-between gap-4 p-4 sm:p-6 text-xs sm:text-sm md:flex-row md:px-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            &copy; {currentYear} Tikzit | All rights reserved
          </motion.p>
          <motion.div 
            className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {data().bottomLinks.map(({ href, label }) => (
              <Link 
                key={href} 
                href={href} 
                className="hover:text-[#FA5F55] transition-colors duration-300 hover:underline underline-offset-4"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        </motion.div>
        <span className="from-[#FA5F55]/20 absolute inset-x-0 bottom-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-t" />
      </div>

      {/* Animations */}
      <style jsx>{`
        /* ===== Animation Presets ===== */
        .animate-rotate-3d {
          animation: rotate3d 8s linear infinite;
        }

        .animate-energy-flow {
          animation: energy-flow 4s linear infinite;
          background-size: 200% 100%;
        }

        /* ===== Keyframes ===== */
        @keyframes rotate3d {
          0% {
            transform: rotateY(0);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes energy-flow {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </footer>
  );
}
