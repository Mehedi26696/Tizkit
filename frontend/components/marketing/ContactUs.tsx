'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Twitter, Facebook, Instagram, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function ContactUs() {
  const [state, setState] = React.useState({
    name: '',
    email: '',
    message: '',
    errors: {} as Record<string, string>,
    submitting: false,
    submitted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ ...state, submitting: true });

    // Console log only
    console.log('Form submitted:', {
      name: state.name,
      email: state.email,
      message: state.message,
    });

    setTimeout(() => {
      setState({
        ...state,
        submitting: false,
        submitted: true,
        name: '',
        email: '',
        message: '',
      });
    }, 1000);
  };

  return (
    <section id='contact' className="w-full py-12 sm:py-16 md:py-20 lg:py-24 mx-auto flex items-center justify-center bg-[#f5f3ef]">
      <div className="container font-[Helvetica] px-4 sm:px-6 md:px-8 max-w-4xl">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8 sm:space-y-12 md:space-y-16"
        >
        {/* Header Section */}
        <motion.div 
          className="space-y-3 sm:space-y-4 text-center"
          variants={fadeInUpVariants}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
            Let&apos;s Get in <span className='text-[#FA5F55]'>Touch</span>
          </h2>
          <p className="text-[#1f1e24]/60 text-base sm:text-lg max-w-2xl mx-auto">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-3xl bg-[#f9f4eb]/30 border-2 border-gray-500/20 p-6 sm:p-8 md:p-12 grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12"
        >
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-semibold text-[#1f1e24] mb-8">Send us a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-[#1f1e24]">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1f1e24]/20 bg-[#f9f4eb]/30 text-[#1f1e24] placeholder:text-[#1f1e24]/40 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium mb-2 text-[#1f1e24]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={state.email}
                  onChange={(e) => setState({ ...state, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1f1e24]/20 bg-[#f9f4eb]/30 text-[#1f1e24] placeholder:text-[#1f1e24]/40 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none transition-all"
                  placeholder="Enter your email"
                />
                {state.errors.email && (
                  <p className="text-sm text-red-500">{state.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-[#1f1e24]">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  value={state.message}
                  onChange={(e) => setState({ ...state, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1f1e24]/20 bg-[#f9f4eb]/30 text-[#1f1e24] placeholder:text-[#1f1e24]/40 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none transition-all resize-none"
                  placeholder="Enter your message"
                />
                {(state.errors as any).message && (
                  <p className="text-sm text-red-500">{(state.errors as any).message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={state.submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full py-4 px-6 rounded-full text-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
                  "bg-[#2a2a2a] hover:bg-[#FA5F55]/90 text-white shadow-md hover:shadow-lg",
                  state.submitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {state.submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {state.submitted && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-600 font-medium"
                >
                  Message sent successfully! We&apos;ll get back to you soon.
                </motion.p>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold text-[#1f1e24] mb-8">Connect with Us</h3>
            
            <div className="space-y-6 mb-8">
              {/* Email */}
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 bg-[#FA5F55]/10 rounded-xl border-2 border-[#FA5F55]/20">
                  <Mail className="w-6 h-6 text-[#FA5F55]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1f1e24]/60 mb-1">Email us at</p>
                  <a href="mailto:Tizkit@gmai.com" className="text-[#1f1e24] font-medium hover:text-[#FA5F55] transition-colors">
                    Tizkit@gmai.com
                  </a>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 bg-[#FA5F55]/10 rounded-xl border-2 border-[#FA5F55]/20">
                  <Phone className="w-6 h-6 text-[#FA5F55]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1f1e24]/60 mb-1">Call us at</p>
                  <p className="text-[#1f1e24] font-medium">01540201438</p>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div 
                className="flex items-start gap-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 bg-[#FA5F55]/10 rounded-xl border-2 border-[#FA5F55]/20">
                  <MapPin className="w-6 h-6 text-[#FA5F55]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1f1e24]/60 mb-1">Location</p>
                  <p className="text-[#1f1e24] font-medium">
                    University of Dhaka,<br />
                    Dhaka, Bangladesh
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm font-medium text-[#1f1e24]/60 mb-4">Follow us on</p>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Github, href: '#', label: 'Github' },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-[#1f1e24]/5 hover:bg-[#FA5F55]/10 rounded-xl border-2 border-[#1f1e24]/20 hover:border-[#FA5F55]/40 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-[#1f1e24] hover:text-[#FA5F55] transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
