import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingPreview } from './LandingPreview';
import { LandingUseCases } from './LandingUseCases';
import { LandingBenefits } from './LandingBenefits';
import { LandingFooter } from './LandingFooter';
import { NoticeModal } from '../../components/ui';
import { useAuth } from '../auth';

export const LandingPage: React.FC = () => {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsNoticeOpen(false);
    setAuthError(null);
    if (user) {
      navigate('/workspace');
      return;
    }

    try {
      await signInWithGoogle();
      navigate('/workspace');
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      const isNetworkOrOffline =
        err?.code === 'auth/network-request-failed' ||
        err?.code === 'auth/operation-not-supported-in-this-environment' ||
        err?.message?.includes('fetch') ||
        err?.message?.includes('network') ||
        err?.message?.includes('failed to fetch');

      if (isNetworkOrOffline) {
        setAuthError(
          'Firebase Auth Emulator is offline on localhost:9099. Please start the emulator with "npm run dev" or "npm run emulators" to sign in.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in was cancelled (popup was closed).');
      } else {
        setAuthError(
          err?.message || 'Authentication failed. Please verify that the Firebase Auth Emulator is active.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      <div>
        <LandingHeader onGoogleSignInClick={() => setIsNoticeOpen(true)} />

        {authError && (
          <div
            role="alert"
            className="max-w-4xl mx-auto mt-4 px-6"
          >
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-red-500 hover:text-red-700 p-0.5 rounded-md cursor-pointer shrink-0"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main>
          <LandingHero onGoogleSignInClick={() => setIsNoticeOpen(true)} />
          <LandingPreview />
          <LandingUseCases />
          <LandingBenefits />
        </main>
      </div>

      <LandingFooter />

      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        title="Welcome to ViDo"
        description="You can enter and explore your workspace directly right now without needing to sign in."
        onSignIn={handleSignIn}
      />
    </div>
  );
};
