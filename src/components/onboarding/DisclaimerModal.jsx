import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DisclaimerModal({ open, onAccept, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-display font-bold text-lg text-foreground leading-tight">
                Important Disclaimer
              </h2>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">NeuroAligned OS is a productivity and self-management tool</strong> — it is <em>not</em> a medical product, clinical service, or therapy platform.
              </p>
              <p>
                The content, suggestions, and AI-generated insights in this app are for <strong className="text-foreground">informational and organizational purposes only</strong>. They are not a substitute for professional medical advice, diagnosis, or treatment from a licensed healthcare provider, therapist, or mental health professional.
              </p>
              <p>
                If you have concerns about your mental health, neurodevelopmental conditions, or burnout, please consult a qualified professional.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
              By continuing, you acknowledge that this app was <strong>not created by a licensed medical or mental health professional</strong>.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                onClick={onAccept}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold"
              >
                I Understand — Continue
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-full"
              >
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}