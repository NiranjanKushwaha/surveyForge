import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats, isFiltered = false, filteredStats }) => {
  // Calculate realistic percentage changes based on current data
  const getChangePercentage = (currentValue, baseValue = 10) => {
    if (currentValue === 0) return '0%';
    const change = Math.round(((currentValue - baseValue) / baseValue) * 100);
    return change >= 0 ? `+${change}%` : `${change}%`;
  };

  const getChangeType = (currentValue, baseValue = 10) => {
    if (currentValue === 0) return 'neutral';
    const change = ((currentValue - baseValue) / baseValue) * 100;
    return change >= 0 ? 'positive' : 'negative';
  };

  const statCards = [
    {
      title: 'Total Surveys',
      value: stats?.totalSurveys || 0,
      change: getChangePercentage(stats?.totalSurveys || 0, 5),
      changeType: getChangeType(stats?.totalSurveys || 0, 5),
      icon: 'FileText',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Surveys',
      value: stats?.activeSurveys || 0,
      change: getChangePercentage(stats?.activeSurveys || 0, 3),
      changeType: getChangeType(stats?.activeSurveys || 0, 3),
      icon: 'Play',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Total Responses',
      value: (stats?.totalResponses || 0).toLocaleString(),
      change: getChangePercentage(stats?.totalResponses || 0, 100),
      changeType: getChangeType(stats?.totalResponses || 0, 100),
      icon: 'Users',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Avg. Completion Rate',
      value: `${stats?.avgCompletionRate || 0}%`,
      change: getChangePercentage(stats?.avgCompletionRate || 0, 70),
      changeType: getChangeType(stats?.avgCompletionRate || 0, 70),
      icon: 'BarChart3',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="mb-8">
      {/* Filter indicator */}
      {isFiltered && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="Filter" size={16} className="text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Showing statistics for filtered results ({filteredStats?.totalSurveys || 0} surveys)
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 survey-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                {stat?.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stat?.value}
              </p>
              <div className="flex items-center mt-2">
                <Icon 
                  name={
                    stat?.changeType === 'positive' ? 'TrendingUp' : 
                    stat?.changeType === 'negative' ? 'TrendingDown' : 
                    'Minus'
                  } 
                  size={14} 
                  className={
                    stat?.changeType === 'positive' ? 'text-success' : 
                    stat?.changeType === 'negative' ? 'text-error' : 
                    'text-text-secondary'
                  } 
                />
                <span className={`text-sm ml-1 ${
                  stat?.changeType === 'positive' ? 'text-success' : 
                  stat?.changeType === 'negative' ? 'text-error' : 
                  'text-text-secondary'
                }`}>
                  {stat?.change}
                </span>
                <span className="text-sm text-text-secondary ml-1">vs baseline</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat?.color}`}>
              <Icon name={stat?.icon} size={24} />
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default StatsOverview;