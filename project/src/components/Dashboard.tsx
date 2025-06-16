import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Settings, AlertCircle, Shield } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { jiraService } from '../services/jiraService';
import JiraConfigComponent from './JiraConfig';
import OAuthLogin from './OAuthLogin';
import { authService } from '../services/authService';

const Dashboard: React.FC = () => {
  const { jiraData, setJiraData, setJiraConfig } = useApp();
  const [showJiraConfig, setShowJiraConfig] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Issues', value: '0', change: '0%', trend: 'up' as const, icon: BarChart3, color: 'blue' },
    { title: 'Open Issues', value: '0', change: '0%', trend: 'up' as const, icon: AlertCircle, color: 'red' },
    { title: 'Resolved This Month', value: '0', change: '0%', trend: 'up' as const, icon: TrendingUp, color: 'green' },
    { title: 'Active Projects', value: '0', change: '0%', trend: 'up' as const, icon: Users, color: 'purple' }
  ]);
  const [chartData, setChartData] = useState({
    statusData: [] as any[],
    priorityData: [] as any[],
    velocityData: [] as any[],
    assigneeData: [] as any[]
  });

  useEffect(() => {
    if (jiraData.isConfigured && !jiraData.isLoading) {
      loadJiraData();
    }
  }, [jiraData.isConfigured]);

  const loadJiraData = async () => {
    try {
      setJiraData({ isLoading: true });
      
      const [issues, projects, statusCounts, priorityCounts, assigneeCounts] = await Promise.all([
        jiraService.getIssues(undefined, 500),
        jiraService.getProjects(),
        jiraService.getIssuesByStatus(),
        jiraService.getIssuesByPriority(),
        jiraService.getIssuesByAssignee()
      ]);

      setJiraData({ 
        issues, 
        projects, 
        isLoading: false 
      });

      // Update stats
      const openIssues = issues.filter(issue => 
        !['Done', 'Closed', 'Resolved'].includes(issue.status)
      ).length;
      
      const resolvedThisMonth = issues.filter(issue => {
        if (!issue.resolved) return false;
        const resolvedDate = new Date(issue.resolved);
        const now = new Date();
        return resolvedDate.getMonth() === now.getMonth() && 
               resolvedDate.getFullYear() === now.getFullYear();
      }).length;

      setStats([
        { title: 'Total Issues', value: issues.length.toString(), change: '+0%', trend: 'up', icon: BarChart3, color: 'blue' },
        { title: 'Open Issues', value: openIssues.toString(), change: '+0%', trend: 'up', icon: AlertCircle, color: 'red' },
        { title: 'Resolved This Month', value: resolvedThisMonth.toString(), change: '+0%', trend: 'up', icon: TrendingUp, color: 'green' },
        { title: 'Active Projects', value: projects.length.toString(), change: '+0%', trend: 'up', icon: Users, color: 'purple' }
      ]);

      // Prepare chart data
      const statusData = Object.entries(statusCounts).map(([status, count], index) => ({
        status,
        count,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
      }));

      const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count
      }));

      const assigneeData = Object.entries(assigneeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([assignee, count]) => ({
          assignee: assignee.length > 15 ? assignee.substring(0, 15) + '...' : assignee,
          count
        }));

      // Generate velocity data (simplified)
      const velocityData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthIssues = issues.filter(issue => {
          if (!issue.resolved) return false;
          const resolvedDate = new Date(issue.resolved);
          return resolvedDate.getMonth() === date.getMonth() && 
                 resolvedDate.getFullYear() === date.getFullYear();
        });
        
        velocityData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          resolved: monthIssues.length,
          storyPoints: monthIssues.reduce((sum, issue) => sum + (issue.storyPoints || 1), 0)
        });
      }

      setChartData({
        statusData,
        priorityData,
        velocityData,
        assigneeData
      });

    } catch (error) {
      console.error('Failed to load Jira data:', error);
      setJiraData({ isLoading: false });
    }
  };

  if (!jiraData.isConfigured) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connect Your Data Sources</h2>
          <p className="text-slate-600 mb-6">Connect to your business platforms to view real project data and analytics.</p>
          
          <div className="space-y-3">
            <motion.button
              onClick={() => setShowOAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>Connect with OAuth</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowJiraConfig(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Manual API Configuration
            </motion.button>
          </div>
        </div>
        
        <OAuthLogin
          isOpen={showOAuthModal}
          onClose={() => setShowOAuthModal(false)}
          onSuccess={(provider) => {
            if (provider === 'jira') {
              setJiraConfig({
                baseUrl: 'oauth-configured',
                email: 'oauth-user',
                apiToken: 'oauth-token'
              });
            }
            setShowOAuthModal(false);
          }}
        />
        
        <JiraConfigComponent
          isOpen={showJiraConfig}
          onClose={() => setShowJiraConfig(false)}
          onConfigured={setJiraConfig}
        />
      </div>
    );
  }

  if (jiraData.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Jira data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Issue Resolution Velocity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.velocityData}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="resolved" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#velocityGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Issues by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Issues by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
              >
                {chartData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Issues by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Issues by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="priority" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Assignees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Issues by Assignee</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.assigneeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" />
              <YAxis dataKey="assignee" type="category" stroke="#64748B" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      
      <JiraConfigComponent
        isOpen={showJiraConfig}
        onClose={() => setShowJiraConfig(false)}
        onConfigured={setJiraConfig}
      />
    </div>
  );
};

export default Dashboard;