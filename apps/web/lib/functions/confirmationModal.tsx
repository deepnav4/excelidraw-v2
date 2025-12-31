"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onCancel}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontFamily: 'Outfit, sans-serif',
            animation: 'modalSlideUp 0.3s ease-out',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Content */}
          <div className="p-6">
            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
              </div>
              <div className="flex-1 pt-1">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    color: '#111827',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {title}
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: '#6b7280',
                    fontWeight: 400
                  }}
                >
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div 
            className="flex gap-3 p-4"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem'
            }}
          >
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                color: 'white',
                backgroundColor: '#ef4444',
                border: 'none',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showConfirmation = (): Promise<boolean> => {
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  return {
    isOpen,
    showConfirmation,
    handleConfirm,
    handleCancel
  };
};
