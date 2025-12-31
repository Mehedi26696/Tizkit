// PricingTable component
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import Link from 'next/link';

// Define your plans
const plans = [
  {
    name: 'Free',
    price: '$0',
    description: "Try Tikzit's core features with AI assist and live preview",
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
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
    href: '/register',
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
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default' as const,
    href: '/register',
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
    href: '/contact',
  },
];

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function CongestedPricing() {
  return (
    <div id='pricing' className="w-full py-12 sm:py-16 md:py-20 lg:py-24 mx-auto flex items-center justify-center bg-[#f5f3ef]">
      <div className="container font-[Helvetica] px-4 sm:px-6 md:px-8">
        <motion.div 
          className="mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            variants={fadeInUpVariants}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight"
          >
            Plans & <span className='text-[#FA5F55]'>Pricing</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUpVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg"
          >
            Choose the plan that works for you
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-3 max-w-7xl mx-auto">
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
              className="rounded-3xl bg-[#f9f4eb]/30 border-2 border-gray-500/20 p-6 sm:p-8 flex flex-col transition-shadow duration-300"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-2xl sm:text-3xl font-normal text-gray-900">
                    {plan.name}
                  </h3>
                  <span className={cn(
                    "text-4xl sm:text-5xl font-normal",
                    plan.name === 'Pro' ? "text-[#FA5F55]" : "text-gray-900"
                  )}>
                    {plan.price}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed min-h-[3rem]">
                  {plan.description}
                </p>
              </div>

              {/* Button */}
              <div className="mb-6">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full rounded-full text-base sm:text-lg font-medium py-5 sm:py-6 transition-all duration-300",
                    plan.buttonVariant === 'default'
                      ? "bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                      : "bg-white hover:bg-[#FA5F55]/10 text-[#FA5F55]  hover:border-[#FA5F55]/80"
                  )}
                >
                  <Link href={plan.href}>
                    {plan.buttonText}
                  </Link>
                </Button>
              </div>

              {/* Features */}
              <ul className="space-y-3 sm:space-y-4 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                    ) : (
                      <Minus className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-300" strokeWidth={2.5} />
                    )}
                    <span className={cn(
                      "text-sm sm:text-base",
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
      </div>
    </div>
  );
}
