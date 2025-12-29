// app/(protected)/layout.tsx
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="w-full min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthGuard>
  );
}
