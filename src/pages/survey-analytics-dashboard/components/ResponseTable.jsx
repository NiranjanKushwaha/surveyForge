import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ResponseTable = ({ data, surveyId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Mock individual response data
  const mockResponses = [
    {
      id: 1,
      respondentId: "RESP-001",
      submittedAt: "2024-12-20T10:30:00Z",
      completionTime: 142,
      status: "completed",
      responses: {
        1: "excellent",
        2: ["fast_response", "user_friendly"],
        3: "Great service overall, very satisfied!",
        4: 9,
        5: "john.doe@email.com"
      }
    },
    {
      id: 2,
      respondentId: "RESP-002",
      submittedAt: "2024-12-20T09:15:00Z",
      completionTime: 98,
      status: "completed",
      responses: {
        1: "good",
        2: ["24_7_support", "documentation"],
        3: "Could be better but generally positive experience.",
        4: 7,
        5: null
      }
    },
    {
      id: 3,
      respondentId: "RESP-003",
      submittedAt: "2024-12-20T08:45:00Z",
      completionTime: 205,
      status: "completed",
      responses: {
        1: "fair",
        2: ["updates"],
        3: "Some issues with the interface, needs improvement.",
        4: 5,
        5: "feedback@company.com"
      }
    }
  ];

  const [responses, setResponses] = useState(mockResponses);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatResponseValue = (value, questionId) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-text-secondary italic">No response</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value?.map((item, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              {item?.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === 'string' && value?.length > 50) {
      return (
        <div className="max-w-xs">
          <span title={value}>{value?.substring(0, 50)}...</span>
        </div>
      );
    }

    if (typeof value === 'number' && questionId === 4) {
      return <span className="font-medium">{value}/10</span>;
    }

    return <span>{String(value)?.replace(/_/g, ' ')}</span>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/10 text-success', icon: 'CheckCircle' },
      partial: { color: 'bg-warning/10 text-warning', icon: 'Clock' },
      abandoned: { color: 'bg-error/10 text-error', icon: 'XCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.completed;

    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const handleExportResponses = () => {
    console.log('Exporting individual responses');
    // In a real app, this would trigger CSV/Excel export
  };

  const totalResponses = responses?.length || 0;
  const totalPages = Math.ceil(totalResponses / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResponses);

  return (
    <div className="bg-card border border-border rounded-lg survey-shadow">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Individual Responses</h3>
            <p className="text-sm text-text-secondary">
              Showing {startIndex + 1}-{endIndex} of {totalResponses} responses
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full sm:w-64"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportResponses}
              iconName="Download"
              size="sm"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('respondentId')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Respondent</span>
                  <Icon name={getSortIcon('respondentId')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('submittedAt')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Submitted</span>
                  <Icon name={getSortIcon('submittedAt')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('completionTime')}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Time</span>
                  <Icon name={getSortIcon('completionTime')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-left p-4 font-medium text-foreground">Q1: Service Rating</th>
              <th className="text-left p-4 font-medium text-foreground">Q4: Recommendation</th>
              <th className="text-right p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {responses?.slice(startIndex, endIndex)?.map((response) => (
              <tr key={response?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-foreground">{response?.respondentId}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-text-secondary">
                    {new Date(response?.submittedAt)?.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {new Date(response?.submittedAt)?.toLocaleTimeString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {Math.floor(response?.completionTime / 60)}:{String(response?.completionTime % 60)?.padStart(2, '0')}
                  </div>
                </td>
                <td className="p-4">
                  {getStatusBadge(response?.status)}
                </td>
                <td className="p-4">
                  {formatResponseValue(response?.responses?.[1], 1)}
                </td>
                <td className="p-4">
                  {formatResponseValue(response?.responses?.[4], 4)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      title="View Details"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      title="Export Response"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Rows per page:</span>
            <Select
              value={pageSize}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
              options={[
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '100', label: '100' }
              ]}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
            />
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseTable;