import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Surveys',
      value: stats?.totalSurveys,
      change: '+12%',
      changeType: 'positive',
      icon: 'FileText',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Surveys',
      value: stats?.activeSurveys,
      change: '+8%',
      changeType: 'positive',
      icon: 'Play',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Total Responses',
      value: stats?.totalResponses?.toLocaleString(),
      change: '+24%',
      changeType: 'positive',
      icon: 'Users',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Avg. Completion Rate',
      value: `${stats?.avgCompletionRate}%`,
      change: '+3%',
      changeType: 'positive',
      icon: 'BarChart3',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
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
                  name={stat?.changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                  size={14} 
                  className={stat?.changeType === 'positive' ? 'text-success' : 'text-error'} 
                />
                <span className={`text-sm ml-1 ${
                  stat?.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  {stat?.change}
                </span>
                <span className="text-sm text-text-secondary ml-1">vs last month</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat?.color}`}>
              <Icon name={stat?.icon} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;