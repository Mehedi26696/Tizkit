"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreditCard, Zap, Clock, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { getCredits, getCreditHistory } from '@/lib/api/billing';
import type { CreditsInfo, CreditTransaction } from '@/types/billing';
import Link from 'next/link';

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function BillingPage() {
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoadingCredits(true);
        const [credits, history] = await Promise.all([
          getCredits(),
          getCreditHistory(10)
        ]);
        setCreditsInfo(credits);
        setCreditHistory(history);
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };
    
    fetchBillingData();
  }, []);

  return (
    <div className="ml-64 min-h-screen bg-[#f9f4eb]/50 p-8">
      <main className="max-w-5xl mx-auto">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center gap-2 text-[#FA5F55] hover:text-[#FA5F55]/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#FA5F55]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#1f1e24]">Billing & Subscription</h1>
              <p className="text-[#1f1e24]/60">Manage your plan, credits, and payment</p>
            </div>
          </div>
        </motion.div>

        {isLoadingCredits ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-[#1f1e24] mb-4">Current Plan</h2>
              
              <div className="p-5 bg-gradient-to-r from-[#FA5F55]/10 to-[#f9f4eb] rounded-xl border-2 border-[#FA5F55]/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "px-4 py-2 rounded-full text-base font-semibold",
                      creditsInfo?.plan_type === 'PRO' ? "bg-[#FA5F55] text-white" :
                      creditsInfo?.plan_type === 'TEAM' ? "bg-purple-600 text-white" :
                      "bg-gray-200 text-gray-700"
                    )}>
                      {creditsInfo?.plan_type || 'FREE'} Plan
                    </div>
                    {creditsInfo?.is_unlimited && (
                      <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <Zap className="w-4 h-4" />
                        Unlimited Credits
                      </span>
                    )}
                  </div>
                  <Link href="/dashboard/pricings">
                    <Button 
                      className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white"
                    >
                      {creditsInfo?.plan_type === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
                    </Button>
                  </Link>
                </div>

                {/* Credits Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-[#FA5F55]">{creditsInfo?.available_credits ?? 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Available Credits</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-gray-700">{creditsInfo?.daily_credits ?? 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Daily Credits</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-green-600">{creditsInfo?.purchased_credits ?? 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Purchased</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-orange-600">{creditsInfo?.used_credits ?? 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Used Today</p>
                  </div>
                </div>

                {creditsInfo?.last_daily_reset && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last reset: {new Date(creditsInfo.last_daily_reset).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Usage Progress */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-[#1f1e24] mb-4">Credits Usage</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Daily Credits Used</span>
                    <span className="font-medium">{creditsInfo?.used_credits ?? 0} / {creditsInfo?.daily_credits ?? 0}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FA5F55] rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((creditsInfo?.used_credits ?? 0) / (creditsInfo?.daily_credits || 1)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                {(creditsInfo?.purchased_credits ?? 0) > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Purchased Credits Remaining</span>
                      <span className="font-medium text-green-600">{creditsInfo?.purchased_credits}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FA5F55]" />
                  <h2 className="text-xl font-semibold text-[#1f1e24]">Transaction History</h2>
                </div>
              </div>

              {creditHistory.length > 0 ? (
                <div className="space-y-3">
                  {creditHistory.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between py-3 px-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/10 hover:border-[#FA5F55]/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                          transaction.transaction_type === 'USAGE' ? "bg-red-100 text-red-600" :
                          transaction.transaction_type === 'PURCHASE' ? "bg-green-100 text-green-600" :
                          transaction.transaction_type === 'DAILY_RESET' ? "bg-blue-100 text-blue-600" :
                          transaction.transaction_type === 'BONUS' ? "bg-purple-100 text-purple-600" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {transaction.credits_amount > 0 ? '+' : ''}
                          {transaction.credits_amount}
                        </div>
                        <div>
                          <p className="font-medium text-[#1f1e24]">
                            {transaction.service_type 
                              ? transaction.service_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                              : transaction.transaction_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-semibold",
                          transaction.credits_amount > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {transaction.credits_amount > 0 ? '+' : ''}{transaction.credits_amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          Balance: {transaction.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your credit history will appear here</p>
                </div>
              )}
            </motion.div>

            {/* Payment Methods Placeholder */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-[#1f1e24] mb-4">Payment Methods</h2>
              
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No payment methods added</p>
                <p className="text-sm mb-4">Add a payment method to purchase credits or upgrade your plan</p>
                <Button 
                  variant="outline" 
                  className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10"
                >
                  Add Payment Method
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
