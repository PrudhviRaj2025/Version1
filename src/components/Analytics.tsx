'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const performanceData = [
    { date: '2024-01-01', revenue: 45000, users: 1200, orders: 340, conversion: 2.8 },
    { date: '2024-01-08', revenue: 52000, users: 1350, orders: 380, conversion: 2.9 },
    { date: '2024-01-15', revenue: 48000, users: 1280, orders: 360, conversion: 2.7 },
    { date: '2024-01-22', revenue: 61000, users: 1420, orders: 420, conversion: 3.1 },
    { date: '2024-01-29', revenue: 58000, users: 1380, orders: 400, conversion: 3.0 },
    { date: '2024-02-05', revenue: 65000, users: 1500, orders: 450, conversion: 3.2 },
    { date: '2024-02-12', revenue: 72000, users: 1620, orders: 480, conversion: 3.4 },
    { date: '2024-02-19', revenue: 68000, users: 1580, orders: 460, conversion: 3.3 }
  ];

  const cohortData = [
    { month: 'Jan', week1: 100, week2: 85, week3: 72, week4: 65 },
    { month: 'Feb', week1: 100, week2: 88, week3: 75, week4: 68 },
    { month: 'Mar', week1: 100, week2: 82, week3: 70, week4: 62 },
    { month: 'Apr', week1: 100, week2: 90, week3: 78, week4: 71 }
  ];

  const segmentData = [
    { segment: 'New Users', value: 3200, growth: 12.5 },
    { segment: 'Returning Users', value: 8900, growth: 8.3 },
    { segment: 'Power Users', value: 1800, growth: 25.7 },
    { segment: 'Dormant Users', value: 2100, growth: -5.2 }
  ];

  const correlationData = [
    { x: 2.1, y: 42000, size: 120 },
    { x: 2.5, y: 48000, size: 150 },
    { x: 2.8, y: 52000, size: 180 },
    { x: 3.1, y: 58000, size: 200 },
    { x: 3.4, y: 65000, size: 220 },
    { x: 3.7, y: 72000, size: 250 }
  ];

  const metrics = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: '#3B82F6' },
    { id: 'users', label: 'Users', icon: Users, color: '#10B981' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: '#F59E0B' },
    { id: 'conversion', label: 'Conversion', icon: TrendingUp, color: '#EF4444' }
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Advanced Analytics</h1>
            <p className="text-slate-600 mt-1">Deep insights and performance analysis</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;
            
            return (
              <motion.button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                <p className="font-medium text-sm">{metric.label}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Performance Trend</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Last {timeRange}</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748B"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748B" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value.toLocaleString(), metrics.find(m => m.id === selectedMetric)?.label]}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={metrics.find(m => m.id === selectedMetric)?.color}
                fillOpacity={1}
                fill="url(#metricGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Cohort Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Retention Cohort</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Line type="monotone" dataKey="week1" stroke="#3B82F6" strokeWidth={2} name="Week 1" />
                <Line type="monotone" dataKey="week2" stroke="#10B981" strokeWidth={2} name="Week 2" />
                <Line type="monotone" dataKey="week3" stroke="#F59E0B" strokeWidth={2} name="Week 3" />
                <Line type="monotone" dataKey="week4" stroke="#EF4444" strokeWidth={2} name="Week 4" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* User Segmentation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Segmentation</h3>
            <div className="space-y-4">
              {segmentData.map((segment, index) => (
                <div key={segment.segment} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{segment.segment}</p>
                    <p className="text-2xl font-bold text-slate-700">{segment.value.toLocaleString()}</p>
                  </div>
                  <div className={`text-right ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="text-sm font-medium">
                      {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                    </p>
                    <TrendingUp className={`w-4 h-4 ${segment.growth < 0 ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Conversion vs Revenue Correlation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversion vs Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="x" 
                  stroke="#64748B" 
                  name="Conversion Rate"
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  dataKey="y" 
                  stroke="#64748B" 
                  name="Revenue"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'y') return [`$${value.toLocaleString()}`, 'Revenue'];
                    if (name === 'x') return [`${value}%`, 'Conversion Rate'];
                    return [value, name];
                  }}
                />
                <Scatter dataKey="y" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Strong Revenue Growth</h4>
                <p className="text-blue-700 text-sm">Revenue increased 23% month-over-month, driven by improved conversion rates and user acquisition.</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">High User Retention</h4>
                <p className="text-green-700 text-sm">Week 4 retention improved to 71%, indicating strong product-market fit and user satisfaction.</p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">Optimization Opportunity</h4>
                <p className="text-amber-700 text-sm">Power users segment shows 25.7% growth but represents only 12% of total users. Consider targeted campaigns.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;