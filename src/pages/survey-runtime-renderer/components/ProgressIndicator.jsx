import React from 'react';

const ProgressIndicator = ({ progress = 0, currentStep = 1, totalSteps = 1 }) => {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step Counter */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-text-secondary">
            {Math.round(progress)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;