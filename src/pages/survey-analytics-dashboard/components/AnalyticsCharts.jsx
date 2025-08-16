import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';

const AnalyticsCharts = ({ data, type }) => {
  const colors = ['#2563eb', '#0ea5e9', '#059669', '#d97706', '#dc2626', '#7c3aed', '#ec4899'];

  const renderOverviewCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Response Timeline */}
      <div className="bg-card border border-border rounded-lg p-6 survey-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Response Timeline</h3>
          <Icon name="TrendingUp" size={20} className="text-text-secondary" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data?.responses?.timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value)?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value)?.toLocaleDateString()}
              formatter={(value) => [value, 'Responses']}
            />
            <Area 
              type="monotone" 
              dataKey="responses" 
              stroke="#2563eb" 
              fill="#2563eb" 
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-card border border-border rounded-lg p-6 survey-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Sentiment Analysis</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Overall Score:</span>
            <span className="text-lg font-semibold text-primary">{data?.sentiment?.score}/10</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Positive', value: data?.sentiment?.breakdown?.positive, fill: '#059669' },
                { name: 'Neutral', value: data?.sentiment?.breakdown?.neutral, fill: '#d97706' },
                { name: 'Negative', value: data?.sentiment?.breakdown?.negative, fill: '#dc2626' }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            />
            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderQuestionCharts = () => (
    <div className="space-y-6">
      {data?.responses?.byQuestion?.map((question, index) => (
        <div key={question?.id} className="bg-card border border-border rounded-lg p-6 survey-shadow">
          <h3 className="text-lg font-semibold text-foreground mb-4">{question?.title}</h3>
          
          {question?.type === 'rating' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{question?.averageRating}</div>
                  <div className="text-sm text-text-secondary">Average Rating</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={question?.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Responses']} />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {(question?.type === 'single-choice' || question?.type === 'multiple-choice') && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={question?.responses} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="option" width={150} />
                <Tooltip formatter={(value) => [value, 'Responses']} />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      ))}
    </div>
  );

  const renderDemographicsCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution */}
      <div className="bg-card border border-border rounded-lg p-6 survey-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">Age Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data?.demographics?.age}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="count"
              label={({ range, percentage }) => `${range}: ${percentage}%`}
            >
              {data?.demographics?.age?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors?.[index % colors?.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Responses']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Location Distribution */}
      <div className="bg-card border border-border rounded-lg p-6 survey-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">Geographic Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.demographics?.location}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Responses']} />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCharts = () => {
    switch (type) {
      case 'overview':
        return renderOverviewCharts();
      case 'questions':
        return renderQuestionCharts();
      case 'demographics':
        return renderDemographicsCharts();
      default:
        return renderOverviewCharts();
    }
  };

  return (
    <div>
      {renderCharts()}
    </div>
  );
};

export default AnalyticsCharts;