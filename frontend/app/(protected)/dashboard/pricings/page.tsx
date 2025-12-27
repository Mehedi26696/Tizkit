"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: "Try Tizkit's core features with AI assist and live preview",
    features: [
      { text: 'Daily credits reset every 24 hours', included: true },
      { text: 'AI-assisted LaTeX editing', included: true },
      { text: 'Live preview with cursor sync', included: true },
      { text: 'Template library access', included: true },
      { text: 'PDF & PNG export', included: true },
      { text: 'Live collaboration', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced features', included: false },
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    isCurrent: true,
  },
  {
    name: 'Pro',
    price: '$9',
    description: 'For power users and teams who need constant access',
    features: [
      { text: 'Unlimited AI generations & compiles', included: true },
      { text: 'Priority rendering', included: true },
      { text: 'Advanced error console', included: true },
      { text: 'Version history & restore', included: true },
      { text: 'All export formats (PDF, SVG, PNG, TikZ)', included: true },
      { text: 'Live collaboration (coming soon)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom integrations', included: false },
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    isCurrent: false,
  },
  {
    name: 'Team',
    price: '$15',
    description: 'Shared workspace, project permissions, analytics',
    features: [
      { text: 'Unlimited everything', included: true },
      { text: 'Shared workspace', included: true },
      { text: 'Project permissions & roles', included: true },
      { text: 'Team analytics dashboard', included: true },
      { text: 'SSO authentication', included: true },
      { text: 'Live collaboration included', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations & SLA', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'default' as const,
    isCurrent: false,
  },
];

const faqItems = [
  {
    id: '1',
    title: 'Can I upgrade or downgrade my plan anytime?',
    content:
      'Yes, you can change your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    id: '2',
    title: 'What payment methods do you accept?',
    content:
      'We accept all major credit cards, PayPal, and wire transfers for Team plans.',
  },
  {
    id: '3',
    title: 'Is there a discount for annual billing?',
    content:
      'Yes! Annual plans get 2 months free compared to monthly billing.',
  },
  {
    id: '4',
    title: 'What happens if I exceed my usage limits?',
    content:
      "You'll be notified before hitting limits. Free users can upgrade, or wait for the daily reset.",
  },
  {
    id: '5',
    title: 'Do you offer refunds?',
    content:
      'We offer a 14-day money-back guarantee for Pro and Team plans if you\'re not satisfied.',
  },
];

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function PricingsPage() {
  const router = useRouter();

  return (
    <div className="ml-64 min-h-screen bg-[#f9f4eb]/50 p-8">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        

        {/* Pricing Section */}
        <motion.div 
          className="mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            className="mb-12 space-y-4 text-center"
            variants={fadeInUpVariants}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
              Plans and <span className='text-[#FA5F55]'>Pricing </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Unlock more features and capabilities with our flexible plans
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={cn(
                  "rounded-3xl bg-white border-2 p-8 flex flex-col transition-all duration-300",
                  plan.isCurrent 
                    ? "border-[#FA5F55] shadow-lg" 
                    : "border-gray-200 hover:border-[#FA5F55]/40 hover:shadow-md"
                )}
              >
                {plan.isCurrent && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-[#FA5F55] text-white rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-3xl font-normal text-gray-900">
                      {plan.name}
                    </h3>
                    <span className={cn(
                      "text-5xl font-normal",
                      plan.name === 'Pro' ? "text-[#FA5F55]" : "text-gray-900"
                    )}>
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed min-h-[3rem]">
                    {plan.description}
                  </p>
                </div>

                {/* Button */}
                <div className="mb-6">
                  <Button
                    size="lg"
                    disabled={plan.isCurrent}
                    className={cn(
                      "w-full rounded-full text-lg font-medium py-6 transition-all duration-300",
                      plan.buttonVariant === 'default'
                        ? "bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                        : "bg-white hover:bg-[#FA5F55]/10 text-[#FA5F55] border-2 border-[#FA5F55]/40 hover:border-[#FA5F55]/80",
                      plan.isCurrent && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {plan.buttonText}
                  </Button>
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#FA5F55]" strokeWidth={2.5} />
                      ) : (
                        <Minus className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-300" strokeWidth={2.5} />
                      )}
                      <span className={cn(
                        "text-base",
                        feature.included ? "text-gray-900" : "text-gray-400"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-4xl md:text-5xl font-normal tracking-tight">
              Frequently Asked{' '}
              <span className="text-[#FA5F55]">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* Decorative gradient */}
            <motion.div 
              className="bg-[#FA5F55]/10 absolute -top-4 -left-4 -z-10 h-60 w-60 rounded-full blur-3xl"
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
              className="bg-[#FA5F55]/10 absolute -right-4 -bottom-4 -z-10 h-60 w-60 rounded-full blur-3xl"
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
              className="w-full rounded-xl border-2 p-6 backdrop-blur-sm border-[#FA5F55] bg-white/50"
              defaultValue="1"
            >
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem
                    value={item.id}
                    className={cn(
                      'border-[#FA5F55]/60 my-2 overflow-hidden rounded-lg border py-3 px-3 shadow-md transition-all border-b-2 border-b-[#FA5F55]/40 bg-[#f9f4eb]',
                      'data-[state=open]:bg-[#f9f4eb]/60 data-[state=open]:shadow-lg data-[state=open]:scale-[1.02]',
                      'hover:shadow-lg hover:scale-[1.01]',
                    )}
                  >
                    <AccordionPrimitive.Header className="flex">
                      <AccordionPrimitive.Trigger
                        className={cn(
                          'ml-2 group flex flex-1 items-center justify-between gap-4 py-4 text-left text-lg font-medium',
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
                        'ml-2 text-[#1f1e24] overflow-hidden pt-0 pb-4 text-base',
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
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-24 text-center bg-gradient-to-br from-[#FA5F55]/10 to-[#f9f4eb] rounded-3xl p-12 border-2 border-[#FA5F55]/40"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-normal mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-6 text-lg">
            Our team is here to help you choose the right plan
          </p>
          <Button
            size="lg"
            className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white rounded-full px-8 py-6 text-lg"
          >
            Contact Support
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
