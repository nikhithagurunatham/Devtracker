'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountSettingsModal } from '@/components/account/AccountSettingsModal';

export default function AccountPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <AccountSettingsModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          router.push('/');
        }}
        onProfileUpdated={() => {
          router.push('/');
        }}
      />
    </div>
  );
}
