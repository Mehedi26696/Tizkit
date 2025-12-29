"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Bell, Lock, Palette, Globe, CreditCard, Shield, Download, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { user, updateProfile, changePassword, isLoading: authLoading } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    username: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false,
  });

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('profile');

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: profileForm.full_name || undefined,
        username: profileForm.username,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordModal(false);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information',
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
      href: '/dashboard/billing',
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
                  
                  // If section has href, render as Link
                  if (section.href) {
                    return (
                      <Link key={section.id} href={section.href}>
                        <motion.div
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all text-left",
                            "hover:bg-[#f9f4eb]/50 text-[#1f1e24]/70 hover:text-[#1f1e24]"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{section.title}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#FA5F55]" />
                        </motion.div>
                      </Link>
                    );
                  }
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                        activeSection === section.id
                          ? "bg-[#FA5F55]/10 text-[#FA5F55] border-2 border-[#FA5F55]/40"
                          : "hover:bg-[#f9f4eb]/50 text-[#1f1e24]/70 hover:text-[#1f1e24] border-2 border-transparent"
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
              id="profile"
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6 scroll-mt-24"
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
                    {getInitials()}
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
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button 
                  className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10"
                  onClick={() => {
                    if (user) {
                      setProfileForm({
                        full_name: user.full_name || '',
                        username: user.username || '',
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              id="notifications"
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6 scroll-mt-24"
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
              id="security"
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6 scroll-mt-24"
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
                {/* Password Change Section */}
                {!showPasswordModal ? (
                  <div className="p-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-[#1f1e24]">Password</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change
                      </Button>
                    </div>
                    <p className="text-sm text-[#1f1e24]/60">Secure your account with a strong password</p>
                  </div>
                ) : (
                  <div className="p-4 bg-[#f9f4eb]/50 rounded-xl border border-[#FA5F55]/20 space-y-4">
                    <p className="font-medium text-[#1f1e24]">Change Password</p>
                    <div>
                      <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-[#FA5F55]/40 text-[#FA5F55] hover:bg-[#FA5F55]/10"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

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
                  <p className="text-sm text-[#1f1e24]/60">1 active session</p>
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              id="appearance"
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6 scroll-mt-24"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-[#FA5F55]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f1e24]">Appearance</h2>
                  <p className="text-sm text-[#1f1e24]/60">Customize your interface</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium capitalize",
                          theme === t
                            ? "border-[#FA5F55] bg-[#FA5F55]/10 text-[#FA5F55]"
                            : "border-[#1f1e24]/20 hover:border-[#FA5F55]/40 text-[#1f1e24]/70"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Language & Region */}
            <motion.div
              id="language"
              className="bg-white rounded-2xl border-2 border-[#FA5F55]/20 p-6 scroll-mt-24"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.38 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FA5F55]/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#FA5F55]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f1e24]">Language & Region</h2>
                  <p className="text-sm text-[#1f1e24]/60">Set your language preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none bg-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">Timezone</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all outline-none bg-white"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                    <option value="CET">CET (Central European Time)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              id="danger"
              className="bg-red-50 rounded-2xl border-2 border-red-200 p-6 scroll-mt-24"
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