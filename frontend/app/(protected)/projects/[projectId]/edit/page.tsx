import React from 'react';
import { EditorPage } from './components/EditorPage';

interface PageProps {
	params: { projectId: string };
}

export default function ProjectEditPage({ params }: PageProps) {
	return <EditorPage projectId={params.projectId} onNavigateToHome={() => window.location.href = '/(protected)/dashboard'} />;
}
