import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CompletionScreen = ({ survey }) => {
  const handleRedirect = () => {
    // In a real app, this could redirect to a custom URL
    window.close();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Check" size={40} color="white" />
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Thank You!
        </h1>
        
        <div className="text-lg text-text-secondary mb-8 space-y-2">
          <p>
            {survey?.thankyouMessage || "Thank you for taking the time to complete our survey!"}
          </p>
          <p>
            Your feedback is valuable and will help us improve our services.
          </p>
        </div>

        {/* Survey Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-4 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="FileText" size={16} />
              <span>{survey?.title}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} />
              <span>Completed at {new Date()?.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="default"
            size="lg"
            onClick={handleRedirect}
            className="w-full sm:w-auto"
          >
            <Icon name="Home" size={20} className="mr-2" />
            Return to Website
          </Button>
          
          <div className="text-sm text-text-secondary">
            You can safely close this window
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-sm text-text-secondary">
          <p>Powered by SurveyForge</p>
        </footer>
      </div>
    </div>
  );
};

export default CompletionScreen;