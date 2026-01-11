"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  Zap, 
  Clock, 
  TrendingUp, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck,
  X,
  CreditCard as CardIcon
} from 'lucide-react';
import { getCredits, getCreditHistory } from '@/lib/api/billing';
import type { CreditsInfo, CreditTransaction } from '@/types/billing';
import Link from 'next/link';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function BillingPage() {
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  
  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', brand: 'visa', last4: '4242', expiry: '04/24', isDefault: true }
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

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

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !cardName) {
        toast.error("Please fill in all card details");
        return;
    }

    setIsProcessing(true);
    
    // Simulate API Call to Payment Gateway (e.g. Stripe)
    setTimeout(() => {
      const newCard: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        brand: cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        last4: cardNumber.slice(-4),
        expiry: expiry,
        isDefault: paymentMethods.length === 0
      };
      
      setPaymentMethods([...paymentMethods, newCard]);
      setIsProcessing(false);
      setIsAddingCard(false);
      
      // Reset Form
      setCardName('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      
      toast.success("Card added successfully!");
    }, 2500);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleDeleteCard = (id: string) => {
    if (paymentMethods.find(pm => pm.id === id)?.isDefault && paymentMethods.length > 1) {
        toast.error("Set another card as default before deleting this one");
        return;
    }
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success("Payment method removed");
  };

  return (
    <div className="ml-72 min-h-screen bg-[#fffaf5] p-12 custom-scrollbar">
      <main className="max-w-5xl mx-auto pb-20">
        {/* Page Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center gap-2 text-[#FA5F55] hover:text-[#FA5F55]/80 mb-6 transition-all font-bold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#FA5F55] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FA5F55]/20">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#FA5F55]" />
                 <span className="text-[10px] font-black text-[#FA5F55] uppercase tracking-widest">Billing Engine</span>
              </div>
              <h1 className="text-4xl font-[900] text-[#1f1e24] tracking-tight">Billing & Subscription</h1>
              <p className="text-[#1f1e24]/60 font-medium">Manage your plan, credits, and payment infrastructure</p>
            </div>
          </div>
        </motion.div>

        {isLoadingCredits ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-10 h-10 animate-spin text-[#FA5F55]" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Plan Card */}
            <motion.div
              className="bg-white rounded-[2rem] border-2 border-[#e6dbd1]/50 p-8 shadow-sm"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-[#1f1e24] mb-6 flex items-center gap-2">
                 Plan Overview
              </h2>
              
              <div className="p-8 bg-[#f9f4eb] rounded-2xl border-2 border-[#e6dbd1]/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="w-40 h-40 text-[#FA5F55]" />
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest",
                      creditsInfo?.plan_type === 'PRO' ? "bg-[#FA5F55] text-white" :
                      creditsInfo?.plan_type === 'TEAM' ? "bg-purple-600 text-white" :
                      "bg-[#1f1e24] text-white"
                    )}>
                      {creditsInfo?.plan_type || 'FREE'} Plan
                    </div>
                    {creditsInfo?.is_unlimited && (
                      <span className="flex items-center gap-1.5 text-xs text-[#FA5F55] font-black uppercase tracking-widest">
                        <Zap className="w-4 h-4 fill-[#FA5F55]" />
                        Unlimited
                      </span>
                    )}
                  </div>
                  <Link href="/dashboard/pricings">
                    <Button 
                      className="bg-white text-[#1f1e24] hover:bg-[#1f1e24] hover:text-white border-2 border-[#e6dbd1] rounded-xl font-bold px-6 py-6 transition-all shadow-sm"
                    >
                      {creditsInfo?.plan_type === 'FREE' ? 'Upgrade Plan' : 'Modify Subscription'}
                    </Button>
                  </Link>
                </div>

                {/* Credits Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {[
                    { label: 'Available', val: creditsInfo?.available_credits ?? 0, col: 'text-[#FA5F55]' },
                    { label: 'Daily', val: creditsInfo?.daily_credits ?? 0, col: 'text-[#1f1e24]' },
                    { label: 'Purchased', val: creditsInfo?.purchased_credits ?? 0, col: 'text-green-600' },
                    { label: 'Used Today', val: creditsInfo?.used_credits ?? 0, col: 'text-orange-600' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6dbd1]/50">
                      <p className={cn("text-3xl font-[900] tracking-tight mb-1", stat.col)}>{stat.val}</p>
                      <p className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {creditsInfo?.last_daily_reset && (
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-[#1f1e24]/30 uppercase tracking-[0.15em]">
                    <Clock className="w-3 h-3" />
                    <span>Next Refresh in ~14h</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Methods Section */}
            <motion.div
              className="bg-white rounded-[2rem] border-2 border-[#e6dbd1]/50 p-8 shadow-sm"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-[#1f1e24]">Payment Methods</h2>
                    <p className="text-sm text-[#1f1e24]/50 font-medium">Saved cards for fast checkouts</p>
                  </div>
                  <Button 
                    onClick={() => setIsAddingCard(true)}
                    className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white rounded-xl gap-2 font-bold px-5 py-6 h-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add Method
                  </Button>
              </div>
              
              {paymentMethods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((card) => (
                        <div 
                            key={card.id}
                            className={cn(
                                "p-6 rounded-2xl border-2 transition-all relative group",
                                card.isDefault 
                                    ? "bg-[#fffaf5] border-[#FA5F55]/30 shadow-md shadow-[#FA5F55]/5" 
                                    : "bg-white border-[#e6dbd1]/50 hover:border-[#FA5F55]/20"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-white border border-[#e6dbd1] rounded flex items-center justify-center p-1 shadow-sm">
                                        <CardIcon className={cn("w-6 h-6", card.brand === 'visa' ? 'text-blue-600' : 'text-orange-500')} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1f1e24] flex items-center gap-2 capitalize">
                                            {card.brand} •••• {card.last4}
                                            {card.isDefault && (
                                                <span className="bg-[#FA5F55] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Default</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium tracking-wide">Expires {card.expiry}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!card.isDefault && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleSetDefault(card.id)}
                                            className="w-8 h-8 text-slate-400 hover:text-[#FA5F55]"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteCard(card.id)}
                                        className="w-8 h-8 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-[#e6dbd1]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e6dbd1] shadow-sm">
                        <CreditCard className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-bold text-[#1f1e24]">Secure Payments</p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">No payment methods found. Add your first card to enable automated billing.</p>
                </div>
              )}
            </motion.div>

            {/* Transaction History */}
            <motion.div
              className="bg-white rounded-[2rem] border-2 border-[#e6dbd1]/50 p-8 shadow-sm"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#FA5F55]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1f1e24]">Activity Ledger</h2>
                </div>
              </div>

              {creditHistory.length > 0 ? (
                <div className="space-y-3">
                  {creditHistory.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between py-4 px-6 bg-[#fffaf5] rounded-2xl border-2 border-[#e6dbd1]/40 hover:border-[#FA5F55]/20 group transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black ring-1 ring-[#e6dbd1] bg-white shadow-sm",
                          transaction.transaction_type === 'USAGE' ? "text-red-600" :
                          transaction.transaction_type === 'PURCHASE' ? "text-green-600" :
                          transaction.transaction_type === 'DAILY_RESET' ? "text-blue-600" :
                          transaction.transaction_type === 'BONUS' ? "text-purple-600" :
                          "text-gray-600"
                        )}>
                          {transaction.credits_amount > 0 ? '+' : ''}
                          {transaction.credits_amount}
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#1f1e24] uppercase tracking-wider">
                            {transaction.service_type 
                              ? transaction.service_type.replace(/_/g, ' ').toLowerCase()
                              : transaction.transaction_type.replace(/_/g, ' ').toLowerCase()
                            }
                          </p>
                          <p className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-widest mt-0.5">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { 
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
                          "text-lg font-black tracking-tighter",
                          transaction.credits_amount > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {transaction.credits_amount > 0 ? '+' : ''}{transaction.credits_amount}
                        </p>
                        <p className="text-[10px] font-black text-[#1f1e24]/30 uppercase tracking-[0.15em]">
                          {transaction.balance_after} Bal
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 opacity-50">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#e6dbd1]" />
                  <p className="font-bold text-[#1f1e24]">No transaction records found</p>
                </div>
              )}
            </motion.div>

            {/* Simulated Add Card Modal */}
            <AnimatePresence>
                {isAddingCard && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isProcessing && setIsAddingCard(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button 
                                    onClick={() => setIsAddingCard(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    disabled={isProcessing}
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="mb-10 text-center">
                                <h3 className="text-3xl font-[900] text-[#1f1e24] tracking-tight mb-2">Add Payment Method</h3>
                                <p className="text-slate-400 font-medium text-sm">Enter your card details to secure your account</p>
                            </div>

                            {/* Raw Card Preview */}
                            <div className="mb-10 perspective-1000">
                                <motion.div 
                                    className="w-full h-52 bg-gradient-to-br from-[#1f1e24] to-[#3a3942] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
                                    initial={{ rotateY: -10 }}
                                    animate={{ rotateY: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full opacity-30 flex flex-col gap-1.5 p-2">
                                                <div className="w-full h-1 bg-black/20" />
                                                <div className="w-full h-1 bg-black/20" />
                                                <div className="w-full h-1 bg-black/20" />
                                            </div>
                                        </div>
                                        <div className="text-xl font-black italic tracking-tighter opacity-80 uppercase">
                                            {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'TIZKIT'}
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-2xl font-mono font-bold tracking-[0.2em] mb-4">
                                            {cardNumber ? cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Card Holder</p>
                                                <p className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
                                                    {cardName || 'YOUR NAME'}
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Expires</p>
                                                <p className="text-xs font-bold tracking-widest">
                                                    {expiry || 'MM/YY'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <form onSubmit={handleAddCard} className="space-y-6">
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.15em] ml-1">Card Holder Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={cardName}
                                            onChange={e => setCardName(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-white border-2 border-[#e6dbd1]/50 rounded-xl focus:border-[#FA5F55] outline-none transition-all font-bold text-sm" 
                                            placeholder="Jane Doe"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.15em] ml-1">Card Number</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={16}
                                                value={cardNumber}
                                                onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-3.5 bg-white border-2 border-[#e6dbd1]/50 rounded-xl focus:border-[#FA5F55] outline-none transition-all font-bold text-sm tracking-widest" 
                                                placeholder="0000 0000 0000 0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.15em] ml-1">Expiry Date</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="MM/YY"
                                                value={expiry}
                                                onChange={e => setExpiry(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-white border-2 border-[#e6dbd1]/50 rounded-xl focus:border-[#FA5F55] outline-none transition-all font-bold text-sm" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.15em] ml-1">CVC Code</label>
                                            <input 
                                                type="password" 
                                                required
                                                maxLength={3}
                                                placeholder="•••"
                                                value={cvc}
                                                onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-3.5 bg-white border-2 border-[#e6dbd1]/50 rounded-xl focus:border-[#FA5F55] outline-none transition-all font-bold text-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-[#FA5F55] hover:bg-[#1f1e24] text-white rounded-xl py-7 h-auto font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#FA5F55]/10 active:scale-[0.98]"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Securely...
                                            </div>
                                        ) : "Verify & Add Card"}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <ShieldCheck className="w-3 h-3 text-green-500" />
                                        Encrypted
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        3D Secure Support
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

