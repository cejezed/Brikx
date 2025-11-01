'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Gift, Sparkles, CheckCircle } from 'lucide-react';

// Types
interface FeedbackFormData {
  currentStep: number;
  responses: Record<string, any>;
  startTime: number;
}

const RATING_LABELS: Record<string, string> = {
  speed: 'Snelheid',
  clarity: 'Duidelijkheid',
  quality: 'Kwaliteit',
  value: 'Waarde'
};

const RATING_EMOJIS = ['😞', '😐', '🙂', '😊', '🤩'];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onComplete?: () => void;
}

export function FeedbackModal({ isOpen, onClose, projectId, onComplete }: FeedbackModalProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    currentStep: 1,
    responses: {},
    startTime: Date.now()
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSteps = 4;
  const progress = (formData.currentStep / totalSteps) * 100;

  // Track modal open event
  useEffect(() => {
    if (isOpen) {
      trackEvent('modal_opened');
      setFormData(prev => ({ ...prev, startTime: Date.now() }));
    }
  }, [isOpen]);

  const trackEvent = async (eventType: string, questionNumber?: number) => {
    try {
      await fetch('/api/feedback/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          eventType,
          questionNumber,
          metadata: { timestamp: Date.now() }
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const handleNext = () => {
    trackEvent('question_answered', formData.currentStep);
    
    if (formData.currentStep < totalSteps) {
      setFormData(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (formData.currentStep > 1) {
      setFormData(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const timeToComplete = Math.floor((Date.now() - formData.startTime) / 1000);
    
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...formData.responses,
          timeToComplete,
          status: 'completed'
        })
      });

      if (response.ok) {
        trackEvent('form_completed');
        setShowSuccess(true);
        
        // Unlock premium after 2 seconds
        setTimeout(() => {
          if (onComplete) onComplete();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [field]: value
      }
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              trackEvent('form_abandoned', formData.currentStep);
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-100">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Help ons Brikx beter maken
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Vraag {formData.currentStep} van {totalSteps} • 2 minuten
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Premium unlock banner */}
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Exclusieve Beta Tester Beloning
                    </p>
                    <p className="text-xs text-amber-700">
                      Ontvang het complete Premium PvE (€149 waarde) gratis!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {showSuccess ? (
                <SuccessView />
              ) : (
                <>
                  {formData.currentStep === 1 && (
                    <NPSQuestion 
                      value={formData.responses.npsScore}
                      reason={formData.responses.npsReason}
                      onChange={(score: number, reason: string) => {
                        updateResponse('npsScore', score);
                        updateResponse('npsReason', reason);
                      }}
                    />
                  )}

                  {formData.currentStep === 2 && (
                    <RatingsQuestion
                      ratings={formData.responses.ratings || {}}
                      onChange={(ratings) => updateResponse('ratings', ratings)}
                    />
                  )}

                  {formData.currentStep === 3 && (
                    <OpenFeedbackQuestion
                      feedback={formData.responses.feedback || {}}
                      onChange={(feedback) => updateResponse('feedback', feedback)}
                    />
                  )}

                  {formData.currentStep === 4 && (
                    <PermissionsQuestion
                      allowTestimonial={formData.responses.allowTestimonial}
                      testimonialName={formData.responses.testimonialName}
                      wantsUpdates={formData.responses.wantsUpdates}
                      contactEmail={formData.responses.contactEmail}
                      onChange={(field, value) => updateResponse(field, value)}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!showSuccess && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex justify-between">
                  {formData.currentStep > 1 ? (
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Vorige
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {formData.currentStep === totalSteps ? (
                      isSubmitting ? 'Versturen...' : 'Verstuur & Claim Premium'
                    ) : (
                      <>
                        Volgende
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Step 1: NPS Question
function NPSQuestion({ value, reason, onChange }: { value?: number; reason?: string; onChange: (score: number, reason: string) => void }) {
  const [selectedScore, setSelectedScore] = useState<number | null>(value || null);
  const [selectedReason, setSelectedReason] = useState<string>(reason || '');

  const handleScoreChange = (score: number) => {
    setSelectedScore(score);
    onChange(score, selectedReason);
  };

  const handleReasonChange = (newReason: string) => {
    setSelectedReason(newReason);
    onChange(selectedScore || 0, newReason);
  };

  const getFollowUpQuestion = () => {
    if (!selectedScore) return null;
    if (selectedScore <= 6) return "Wat was het grootste obstakel?";
    if (selectedScore >= 8) return "Wat maakte het verschil?";
    return "Wat kunnen we verbeteren?";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Hoe waarschijnlijk zou je Brikx aanbevelen aan iemand die gaat verbouwen?
        </h3>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Zeer onwaarschijnlijk</span>
          <span className="text-xs text-gray-500">Zeer waarschijnlijk</span>
        </div>
        
        <div className="grid grid-cols-11 gap-2">
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleScoreChange(i)}
              className={`
                aspect-square rounded-lg font-medium transition-all
                ${selectedScore === i 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-110' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {selectedScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            {getFollowUpQuestion()}
          </label>
          <textarea
            value={selectedReason}
            onChange={(e) => handleReasonChange(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={3}
            placeholder="Deel je gedachten..."
          />
        </motion.div>
      )}
    </div>
  );
}

// Step 2: Feature Ratings
function RatingsQuestion({ ratings, onChange }: { ratings: Record<string, number>; onChange: (ratings: Record<string, number>) => void }) {
  const [localRatings, setLocalRatings] = useState<Record<string, number>>(ratings || {});

  const handleRatingChange = (feature: string, rating: number) => {
    const updated = { ...localRatings, [feature]: rating };
    setLocalRatings(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Beoordeel deze onderdelen:
      </h3>

      <div className="space-y-4">
        {Object.entries(RATING_LABELS).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <div className="flex gap-3">
              {RATING_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleRatingChange(key, index + 1)}
                  className={`
                    flex-1 py-3 text-2xl rounded-lg transition-all
                    ${localRatings[key] === index + 1
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 ring-2 ring-cyan-500 scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 3: Open Feedback
function OpenFeedbackQuestion({ feedback, onChange }: { feedback: Record<string, string>; onChange: (feedback: Record<string, string>) => void }) {
  const [localFeedback, setLocalFeedback] = useState<Record<string, string>>(feedback || {});

  const handleChange = (field: string, value: string) => {
    const updated = { ...localFeedback, [field]: value };
    setLocalFeedback(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Help ons Brikx beter maken:
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Sparkles className="inline w-4 h-4 mr-1 text-yellow-500" />
            Het <strong>beste</strong> moment/feature was...
          </label>
          <textarea
            value={localFeedback.best || ''}
            onChange={(e) => handleChange('best', e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            placeholder="Wat vond je top?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💭 Ik had graag <strong>ook</strong> willen zien...
          </label>
          <textarea
            value={localFeedback.missing || ''}
            onChange={(e) => handleChange('missing', e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            placeholder="Welke functie miste je?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🤔 Dit vond ik <strong>verwarrend of frustrerend</strong>...
          </label>
          <textarea
            value={localFeedback.frustrating || ''}
            onChange={(e) => handleChange('frustrating', e.target.value)}
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            placeholder="Waar liep je tegenaan?"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Permissions & Contact
function PermissionsQuestion({ 
  allowTestimonial, 
  testimonialName, 
  wantsUpdates, 
  contactEmail,
  onChange 
}: { 
  allowTestimonial?: boolean;
  testimonialName?: string;
  wantsUpdates?: boolean;
  contactEmail?: string;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        Laatste vraag - mag ik je om twee gunsten vragen?
      </h3>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowTestimonial || false}
              onChange={(e) => onChange('allowTestimonial', e.target.checked)}
              className="mt-1 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <div className="flex-1">
              <div className="font-medium">
                "Ja, jullie mogen mijn feedback als testimonial gebruiken"
              </div>
              {allowTestimonial && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <input
                    type="text"
                    value={testimonialName || ''}
                    onChange={(e) => onChange('testimonialName', e.target.value)}
                    placeholder="Je naam (bijv. Jan de Vries)"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </motion.div>
              )}
            </div>
          </label>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wantsUpdates || false}
              onChange={(e) => onChange('wantsUpdates', e.target.checked)}
              className="mt-1 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <div className="flex-1">
              <div className="font-medium">
                "Ja, ik wil de lancering niet missen - stuur me een bericht!"
              </div>
              {wantsUpdates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <input
                    type="email"
                    value={contactEmail || ''}
                    onChange={(e) => onChange('contactEmail', e.target.value)}
                    placeholder="je@email.nl"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </motion.div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Success View
function SuccessView() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
      </motion.div>
      
      <h3 className="text-2xl font-bold mb-2">Bedankt voor je feedback!</h3>
      <p className="text-gray-600 mb-4">
        Je Premium PvE wordt nu ontgrendeld...
      </p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 inline-block"
      >
        <Gift className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-amber-900">
          Premium PvE Ontgrendeld!
        </p>
      </motion.div>
    </motion.div>
  );
}