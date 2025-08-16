import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuestionRenderer = ({ question, value, onChange, error }) => {
  if (!question) return null;

  const renderSingleChoice = () => (
    <div className="space-y-3">
      {question?.options?.map((option) => (
        <label
          key={option?.id}
          className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
        >
          <input
            type="radio"
            name={`question-${question?.id}`}
            value={option?.value}
            checked={value === option?.value}
            onChange={(e) => onChange(e?.target?.value)}
            className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
          />
          <span className="text-foreground font-medium">{option?.text}</span>
        </label>
      ))}
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question?.options?.map((option) => (
        <label
          key={option?.id}
          className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            value={option?.value}
            checked={Array.isArray(value) && value?.includes(option?.value)}
            onChange={(e) => {
              const currentValues = Array.isArray(value) ? value : [];
              if (e?.target?.checked) {
                onChange([...currentValues, option?.value]);
              } else {
                onChange(currentValues?.filter(v => v !== option?.value));
              }
            }}
            className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded"
          />
          <span className="text-foreground font-medium">{option?.text}</span>
        </label>
      ))}
    </div>
  );

  const renderTextInput = () => (
    <div>
      <textarea
        className="w-full p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
        placeholder={question?.placeholder || "Type your answer here..."}
        value={value || ''}
        onChange={(e) => onChange(e?.target?.value)}
        maxLength={question?.maxLength}
      />
      {question?.maxLength && (
        <div className="text-right text-sm text-text-secondary mt-2">
          {(value || '')?.length} / {question?.maxLength}
        </div>
      )}
    </div>
  );

  const renderRating = () => {
    const scale = question?.scale || 10;
    const ratings = Array.from({ length: scale }, (_, i) => i + 1);

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>{question?.minLabel || "Not likely"}</span>
          <span>{question?.maxLabel || "Very likely"}</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {ratings?.map((rating) => (
            <Button
              key={rating}
              variant={value === rating ? "default" : "outline"}
              size="lg"
              className="w-12 h-12 text-lg font-semibold"
              onClick={() => onChange(rating)}
            >
              {rating}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderEmailInput = () => (
    <Input
      type="email"
      placeholder={question?.placeholder || "Enter your email address"}
      value={value || ''}
      onChange={(e) => onChange(e?.target?.value)}
      className="w-full"
    />
  );

  const renderMatrixSingle = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="p-4 text-left font-medium text-text-secondary"></th>
            {question?.columns?.map((column) => (
              <th key={column.id} className="p-4 text-center font-medium text-text-secondary">
                {column.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question?.rows?.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="p-4 font-medium">{row.text}</td>
              {question?.columns?.map((column) => (
                <td key={column.id} className="p-4 text-center">
                  <input
                    type="radio"
                    name={`matrix-${question.id}-${row.id}`}
                    checked={value?.[row.id] === column.value}
                    onChange={() => {
                      const newValue = { ...(value || {}) };
                      newValue[row.id] = column.value;
                      onChange(newValue);
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMatrixMultiple = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="p-4 text-left font-medium text-text-secondary"></th>
            {question?.columns?.map((column) => (
              <th key={column.id} className="p-4 text-center font-medium text-text-secondary">
                {column.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question?.rows?.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="p-4 font-medium">{row.text}</td>
              {question?.columns?.map((column) => (
                <td key={column.id} className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value?.[row.id]) && value[row.id]?.includes(column.value)}
                    onChange={(e) => {
                      const newValue = { ...(value || {}) };
                      const currentValues = Array.isArray(newValue[row.id]) ? newValue[row.id] : [];
                      if (e.target.checked) {
                        newValue[row.id] = [...currentValues, column.value];
                      } else {
                        newValue[row.id] = currentValues.filter(v => v !== column.value);
                      }
                      onChange(newValue);
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderQuestion = () => {
    switch (question?.type) {
      case 'single-choice':
        return renderSingleChoice();
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'text':
        return renderTextInput();
      case 'rating':
        return renderRating();
      case 'email':
        return renderEmailInput();
      case 'matrix-single':
        return renderMatrixSingle();
      case 'matrix-multiple':
        return renderMatrixMultiple();
      default:
        return <div className="text-text-secondary">Question type not supported</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">
          {question?.title}
          {question?.required && <span className="text-error ml-1">*</span>}
        </h2>
        {question?.description && (
          <p className="text-text-secondary">{question?.description}</p>
        )}
      </div>

      {/* Question Input */}
      <div>
        {renderQuestion()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-error">
          <Icon name="AlertCircle" size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;