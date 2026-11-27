import React, { useEffect } from 'react';
import { Button } from './Button';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSignIn?: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  title = 'Sign In to ViDo',
  description = 'You can enter and explore your workspace directly right now without needing to configure Google authentication.',
  onSignIn,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass-modal rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 id="modal-title" className="text-base font-semibold text-[var(--ink)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--line-glass)] flex flex-wrap items-center justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              navigate('/preview');
            }}
          >
            Enter Live Preview <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              if (onSignIn) {
                onSignIn();
              } else {
                navigate('/workspace');
              }
            }}
          >
            Sign In to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
