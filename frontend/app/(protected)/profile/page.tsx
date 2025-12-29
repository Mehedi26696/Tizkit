// Profile page

'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-[#FA5F55] text-white">
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {user.full_name || user.username}
                </CardTitle>
                <CardDescription className="text-base">@{user.username}</CardDescription>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            
            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.full_name || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}