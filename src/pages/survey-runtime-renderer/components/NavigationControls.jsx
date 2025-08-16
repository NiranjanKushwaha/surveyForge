import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NavigationControls = ({
  canGoBack,
  canGoNext,
  onPrevious,
  onNext,
  isLastQuestion,
  isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={!canGoBack || isLoading}
        className={`w-full sm:w-auto ${!canGoBack ? 'invisible' : ''}`}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        Previous
      </Button>

      {/* Next/Submit Button */}
      <Button
        variant="default"
        size="lg"
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        loading={isLoading}
        className="w-full sm:w-auto"
      >
        {isLastQuestion ? (
          <>
            Submit Survey
            <Icon name="Send" size={20} className="ml-2" />
          </>
        ) : (
          <>
            Next
            <Icon name="ChevronRight" size={20} className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default NavigationControls;