"use client";

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Mail, Github, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from '../../dashboard/components/Sidebar';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

import { faqs } from "@/lib/constants/help-data";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
  }),
};

export default function HelpCenterPage() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.full_name || user?.username || 'User';

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50 font-[Helvetica]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-64 p-8 pt-24">
        

        {/* Help Center Header */}
        <motion.div 
          className="mb-8 sm:mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-1 text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
            Questions?{' '}
            <span className="text-[#FA5F55]">
              We've got
            </span>
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
            <span className='text-[#FA5F55]'>Answers</span>
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="relative mx-auto max-w-4xl mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Decorative gradients */}
          <motion.div 
            className="bg-[#FA5F55]/10 absolute -top-4 -left-4 -z-10 h-48 w-48 sm:h-60 sm:w-60 rounded-full blur-3xl"
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
            className="bg-[#FA5F55]/10 absolute -right-4 -bottom-4 -z-10 h-48 w-48 sm:h-60 sm:w-60 rounded-full blur-3xl"
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

          <Accordion
            type="single"
            collapsible
            className="w-full rounded-xl border p-4 sm:p-6 backdrop-blur-sm border-[#FA5F55]"
            defaultValue="1"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={faq.id}
                  className={cn(
                    'border-[#FA5F55]/60 my-2 overflow-hidden rounded-lg border py-2 sm:py-3 px-2 sm:px-3 shadow-md transition-all border-b-2 border-b-[#FA5F55]/40 bg-[#f9f4eb]',
                    'data-[state=open]:bg-[#f9f4eb]/60 data-[state=open]:shadow-lg data-[state=open]:scale-[1.02]',
                    'hover:shadow-lg hover:scale-[1.01]',
                  )}
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={cn(
                        'ml-1 sm:ml-2 group flex flex-1 items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-medium',
                        'hover:text-primary transition-all duration-300 outline-none',
                        'focus-visible:ring-primary/50 focus-visible:ring-2',
                        'data-[state=open]:text-primary',
                      )}
                    >
                      <span className="hover:border-b-2 hover:border-b-[#FA5F55]/40 cursor-pointer transition-all duration-300">{faq.question}</span>
                      <PlusIcon
                        size={18}
                        className={cn(
                          'text-[#1f1e24] shrink-0 transition-all duration-500 ease-out',
                          'group-data-[state=open]:rotate-45 group-data-[state=open]:text-[#FA5F55]',
                        )}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent
                    className={cn(
                      'ml-1 sm:ml-2 text-[#1f1e24] overflow-hidden pt-0 pb-3 sm:pb-4 text-sm sm:text-base',
                      'data-[state=open]:animate-accordion-down',
                      'data-[state=closed]:animate-accordion-up',
                    )}
                  >
                    <motion.div 
                      className="border-[#1f1e24]/30 border-t pt-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {faq.answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
         
          <h3 className="text-2xl font-semibold text-[#1f1e24] mb-6 text-center">
            Contact Support
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.a
              href="mailto:support@tizkit.com"
              className="flex items-center gap-4 p-4 bg-white border-2 border-[#1f1e24]/20 rounded-lg hover:border-[#FA5F55]/50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                <Mail className="w-5 h-5 text-[#FA5F55]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1f1e24]">Email Us</h4>
                <p className="text-xs text-[#1f1e24]/60">support@tizkit.com</p>
              </div>
            </motion.a>

            <motion.a
              href="https://github.com/Mehedi26696/Latex-Helper---Tizkit/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white border-2 border-[#1f1e24]/20 rounded-lg hover:border-[#1f1e24]/40 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-[#1f1e24]/10 rounded-lg">
                <Github className="w-5 h-5 text-[#1f1e24]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1f1e24]">GitHub Issues</h4>
                <p className="text-xs text-[#1f1e24]/60">Report bugs & features</p>
              </div>
            </motion.a>

            <motion.a
              href="#"
              className="flex items-center gap-4 p-4 bg-white border-2 border-[#1f1e24]/20 rounded-lg hover:border-blue-500/50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1f1e24]">Community</h4>
                <p className="text-xs text-[#1f1e24]/60">Join our Discord</p>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
