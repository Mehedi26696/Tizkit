"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Bell, Lock, Palette, Globe, CreditCard, Shield, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false,
  });

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information',
      fields: [
        { label: 'Full Name', value: 'John Doe', type: 'text' },
        { label: 'Email', value: 'john.doe@example.com', type: 'email' },
        { label: 'Username', value: '@johndoe', type: 'text' },
        { label: 'Bio', value: 'LaTeX enthusiast and researcher', type: 'textarea' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure how you receive updates',
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      description: 'Manage your account security',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize your interface',
    },
    {
      id: 'language',
      title: 'Language & Region',
      icon: Globe,
      description: 'Set your language preferences',
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      icon: CreditCard,
      description: 'Manage your plan and payment',
    },
  ];

  return (
    <div className="ml-64 min-h-screen bg-[#f9f4eb]/50 p-8">
      <main className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-[#1f1e24] mb-2">Settings</h1>
          <p className="text-[#1f1e24]/60">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            className="lg:col-span-1"
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-4 sticky top-8">
              <nav className="space-y-2">
                {settingsSections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                        index === 0
                          ? "bg-[#FA5F55]/10 text-[#FA5F55] border-2 border-[#FA5F55]/40"
                          : "hover:bg-[#f9f4eb]/50 text-[#1f1e24]/70 hover:text-[#1f1e24]"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#FA5F55]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f1e24]">Profile Settings</h2>
                  <p className="text-sm text-[#1f1e24]/60">Manage your personal information</p>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="mb-6 pb-6 border-b border-[#FA5F55]/20">
                <label className="block text-sm font-medium text-[#1f1e24] mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#FA5F55] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    JD
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white">
                      Upload New
                    </Button>
                    <Button variant="outline" className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue="@johndoe"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="LaTeX enthusiast and researcher"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white">
                  Save Changes
                </Button>
                <Button variant="outline" className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10">
                  Cancel
                </Button>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#FA5F55]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f1e24]">Notifications</h2>
                  <p className="text-sm text-[#1f1e24]/60">Configure how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#FA5F55]/10">
                  <div>
                    <p className="font-medium text-[#1f1e24]">Email Notifications</p>
                    <p className="text-sm text-[#1f1e24]/60">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#FA5F55]/10">
                  <div>
                    <p className="font-medium text-[#1f1e24]">Push Notifications</p>
                    <p className="text-sm text-[#1f1e24]/60">Get notified in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#FA5F55]/10">
                  <div>
                    <p className="font-medium text-[#1f1e24]">Product Updates</p>
                    <p className="text-sm text-[#1f1e24]/60">News about features and improvements</p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-[#1f1e24]">Marketing Emails</p>
                    <p className="text-sm text-[#1f1e24]/60">Receive promotional content</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#FA5F55]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f1e24]">Security & Privacy</h2>
                  <p className="text-sm text-[#1f1e24]/60">Manage your account security</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#1f1e24]">Password</p>
                    <Button variant="outline" size="sm" className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10">
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-[#1f1e24]/60">Last changed 3 months ago</p>
                </div>

                <div className="p-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#1f1e24]">Two-Factor Authentication</p>
                    <Button variant="outline" size="sm" className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10">
                      Enable
                    </Button>
                  </div>
                  <p className="text-sm text-[#1f1e24]/60">Add an extra layer of security</p>
                </div>

                <div className="p-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#1f1e24]">Active Sessions</p>
                    <Button variant="outline" size="sm" className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10">
                      Manage
                    </Button>
                  </div>
                  <p className="text-sm text-[#1f1e24]/60">2 active sessions</p>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              className="bg-red-50 rounded-2xl border-2 border-red-200 p-6"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Export Your Data</p>
                    <p className="text-sm text-gray-600">Download all your projects and data</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}