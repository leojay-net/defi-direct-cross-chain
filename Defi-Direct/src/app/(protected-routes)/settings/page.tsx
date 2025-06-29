// src/components/settings/Settings.tsx
'use client';

import React from 'react';
import SettingsContent from '@/components/settings/SettingsContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return <SettingsContent />;
}
