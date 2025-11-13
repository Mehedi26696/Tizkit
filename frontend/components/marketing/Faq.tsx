"use client"
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import Image from 'next/image';

const items = [
  {
    id: '1',
    title: 'Is there a free plan?',
    content:
      'Yes—core features plus daily credits that renew every 24 hours.',
  },
  {
    id: '2',
    title: 'Do I need to install LaTeX locally?',
    content:
      'No. Everything runs in your browser with cloud compile and preview.',
  },
  {
    id: '3',
    title: 'Will my .tex projects work?',
    content:
      'Absolutely. Import your source; we preserve structure and assets.',
  },
  {
    id: '4',
    title: 'When is live collaboration launching?',
    content:
      "It's on the near roadmap. Pro users get early access.",
  },
  {
    id: '5',
    title: 'What can I export?',
    content:
      'PDF, SVG, PNG, and complete TikZ/LaTeX bundles for submissions or backup.',
  },
];

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

const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
  },
};

export default function Faq1() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <motion.div 
          className="mb-8 sm:mb-10 md:mb-12 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            variants={headerVariants}
            className="mb-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight"
          >
            Questions?{' '}
            <span className="from-primary bg-gradient-to-r to-[#FA5F55] bg-clip-text text-transparent">
              We've
            </span>
          </motion.h2>
          <motion.h2
            variants={headerVariants}
            transition={{ delay: 0.2 }}
            className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight"
          >
            got <span className='text-[#FA5F55]'>Answers</span>
          
          </motion.h2>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-4xl px-2 sm:px-4 md:px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Decorative gradient */}
          <motion.div 
            className="bg-[#FA5F55]/10 absolute -top-4 -left-4 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
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
            className="bg-[#FA5F55]/10 absolute -right-4 -bottom-4 -z-10 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 rounded-full blur-3xl"
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
            className="w-full rounded-xl border p-3 sm:p-4 md:p-6 backdrop-blur-sm border-[#FA5F55]"
            defaultValue="1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={item.id}
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
                      <span className="hover:border-b-2 hover:border-b-[#FA5F55]/40 cursor-pointer transition-all duration-300">{item.title}</span>
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
                      'ml-1 sm:ml-2 text-[#1f1e24] overflow-hidden pt-0 pb-3 sm:pb-4 text-sm sm:text-base md:text-lg',
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
                      {item.content}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
        
      </div>
    </section>
  );
}
