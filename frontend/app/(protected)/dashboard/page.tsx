// Dashboard page
'use client';

import React from 'react';
import { HomePage } from './HomePage';
import { EditorPage } from './EditorPage';

export default function Home() {
  const [activeView, setActiveView] = React.useState<'home' | 'editor'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-aloevera">
      {activeView === 'home' ? (
        <HomePage onNavigateToEditor={() => setActiveView('editor')} />
      ) : (
        <EditorPage onNavigateToHome={() => setActiveView('home')} />
      )}
    </div>
  );
}