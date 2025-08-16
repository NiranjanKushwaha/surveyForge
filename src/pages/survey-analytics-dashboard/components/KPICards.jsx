import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICards = ({ data }) => {
  const kpis = [
    {
      title: "Total Responses",
      value: data?.totalResponses?.toLocaleString() || "0",
      change: "+12%",
      changeType: "positive",
      icon: "Users",
      description: "Total survey responses received"
    },
    {
      title: "Completion Rate",
      value: `${data?.completionRate || 0}%`,
      change: "+5%",
      changeType: "positive",
      icon: "CheckCircle",
      description: "Percentage of completed responses"
    },
    {
      title: "Avg. Response Time",
      value: `${Math.floor((data?.averageTime || 0) / 60)}:${String((data?.averageTime || 0) % 60)?.padStart(2, '0')}`,
      change: "-8%",
      changeType: "positive",
      icon: "Clock",
      description: "Average time to complete survey"
    },
    {
      title: "Response Rate",
      value: `${data?.responseRate || 0}%`,
      change: "+3%",
      changeType: "positive",
      icon: "TrendingUp",
      description: "Response rate vs. total invitations"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {kpis?.map((kpi, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 survey-shadow hover:survey-shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10`}>
              <Icon name={kpi?.icon} size={24} className="text-primary" />
            </div>
            <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full ${
              kpi?.changeType === 'positive' ?'bg-success/10 text-success' :'bg-error/10 text-error'
            }`}>
              <Icon 
                name={kpi?.changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
              />
              <span className="font-medium">{kpi?.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{kpi?.value}</h3>
            <p className="text-sm font-medium text-text-secondary mb-1">{kpi?.title}</p>
            <p className="text-xs text-text-secondary">{kpi?.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;