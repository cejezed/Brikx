'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Award,
  Mail,
  BarChart3,
  Activity,
  AlertCircle,
  ChevronRight,
  Star
} from 'lucide-react';

// Types
interface FeedbackMetrics {
  nps: number;
  totalResponses: number;
  averageRating: number;
  responseRate: number;
  testimonialCount?: number;
  newsletterCount?: number;
  avgRatings?: {
    speed?: number;
    clarity?: number;
    quality?: number;
    value?: number;
    confidence?: number;
  };
}

interface FeedbackResponse {
  id: string;
  rating: number;
  comment?: string;
  email?: string;
  testimonialName?: string;
  npsScore?: number;
  npsReason?: string;
  timeToComplete?: number;
  ratings?: {
    value?: number;
    speed?: number;
    clarity?: number;
    quality?: number;
    confidence?: number;
  };
  feedback?: {
    best?: string;
    frustrating?: string;
  };
  createdAt: string;
}

function getNPSCategory(nps: number): 'promoter' | 'passive' | 'detractor' {
  if (nps >= 9) return 'promoter';
  if (nps >= 7) return 'passive';
  return 'detractor';
}

function calculateNPS(promoters: number, detractors: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
}

interface DashboardProps {
  dateRange?: { start: Date; end: Date };
}

export function FeedbackDashboard({ dateRange }: DashboardProps) {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'responses' | 'analytics'>('overview');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics
      const metricsRes = await fetch('/api/feedback/metrics');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);
      
      // Fetch recent responses
      const responsesRes = await fetch('/api/feedback/responses?limit=20');
      const responsesData = await responsesRes.json();
      setResponses(responsesData);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Dashboard</h1>
          <p className="text-gray-600 mt-2">Beta Tester Feedback Analysis</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {(['overview', 'responses', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`
                flex-1 py-2 px-4 rounded-md font-medium capitalize transition-all
                ${selectedTab === tab 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && <OverviewTab metrics={metrics} responses={responses} />}
        {selectedTab === 'responses' && <ResponsesTab responses={responses} />}
        {selectedTab === 'analytics' && <AnalyticsTab metrics={metrics} responses={responses} />}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ metrics, responses }: { 
  metrics: FeedbackMetrics | null; 
  responses: FeedbackResponse[];
}) {
  if (!metrics) return null;

  const npsScore = metrics.nps;
  const npsColor = npsScore >= 50 ? 'text-green-600' : npsScore >= 0 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="NPS Score"
          value={npsScore}
          suffix=""
          icon={<Activity className="w-5 h-5" />}
          trend={npsScore >= 0 ? 'up' : 'down'}
          color="cyan"
        />
        
        <KPICard
          title="Total Responses"
          value={metrics.totalResponses}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        
        <KPICard
          title="Testimonials"
          value={metrics.testimonialCount ?? 0}
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        
        <KPICard
          title="Email Signups"
          value={metrics.newsletterCount ?? 0}
          icon={<Mail className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* NPS Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">NPS Distribution</h3>
        <NPSBreakdown responses={responses} />
      </div>

      {/* Feature Ratings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Ratings</h3>
        <FeatureRatings metrics={metrics} />
      </div>

      {/* Recent Feedback Highlights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Highlights</h3>
        <FeedbackHighlights responses={responses.slice(0, 3)} />
      </div>
    </div>
  );
}

// Responses Tab
function ResponsesTab({ responses }: { responses: FeedbackResponse[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NPS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {responses.map((response) => (
              <ResponseRow key={response.id} response={response} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ metrics, responses }: { 
  metrics: FeedbackMetrics | null; 
  responses: FeedbackResponse[];
}) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <ConversionFunnel metrics={metrics} />
      </div>

      {/* Time Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Time Analysis</h3>
        <TimeAnalysis responses={responses} />
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Sentiment Trends</h3>
        <SentimentAnalysis responses={responses} />
      </div>
    </div>
  );
}

// Component: KPI Card
function KPICard({ 
  title, 
  value, 
  suffix = '', 
  icon, 
  trend, 
  color = 'cyan' 
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color?: 'cyan' | 'blue' | 'amber' | 'green';
}) {
  const colorClasses = {
    cyan: 'from-cyan-50 to-blue-50 text-cyan-600',
    blue: 'from-blue-50 to-indigo-50 text-blue-600',
    amber: 'from-amber-50 to-orange-50 text-amber-600',
    green: 'from-green-50 to-emerald-50 text-green-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}{suffix}
        </p>
      </div>
    </motion.div>
  );
}

// Component: NPS Breakdown
function NPSBreakdown({ responses }: { responses: FeedbackResponse[] }) {
  const promoters = responses.filter(r => r.npsScore && r.npsScore >= 9).length;
  const passives = responses.filter(r => r.npsScore && r.npsScore >= 7 && r.npsScore < 9).length;
  const detractors = responses.filter(r => r.npsScore && r.npsScore <= 6).length;
  const total = promoters + passives + detractors;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-gray-600">Promoters</div>
        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(promoters / total) * 100}%` }}
            className="absolute inset-y-0 left-0 bg-green-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs text-white font-medium">{promoters}</span>
          </motion.div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-gray-600">Passives</div>
        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(passives / total) * 100}%` }}
            className="absolute inset-y-0 left-0 bg-yellow-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs text-white font-medium">{passives}</span>
          </motion.div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-20 text-sm text-gray-600">Detractors</div>
        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(detractors / total) * 100}%` }}
            className="absolute inset-y-0 left-0 bg-red-500 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-xs text-white font-medium">{detractors}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Component: Feature Ratings
function FeatureRatings({ metrics }: { metrics: FeedbackMetrics }) {
  const ratings = [
    { label: 'Snelheid', value: metrics.avgRatings?.speed ?? 0, icon: '⚡' },
    { label: 'Duidelijkheid', value: metrics.avgRatings?.clarity ?? 0, icon: '💡' },
    { label: 'Kwaliteit', value: metrics.avgRatings?.quality ?? 0, icon: '✨' },
    { label: 'Waarde', value: metrics.avgRatings?.value ?? 0, icon: '💰' },
    { label: 'Vertrouwen', value: metrics.avgRatings?.confidence ?? 0, icon: '🛡️' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {ratings.map((rating) => (
        <div key={rating.label} className="text-center">
          <div className="text-2xl mb-2">{rating.icon}</div>
          <div className="text-sm text-gray-600 mb-1">{rating.label}</div>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating.value) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">{rating.value.toFixed(1)}/5</div>
        </div>
      ))}
    </div>
  );
}

// Component: Response Row
function ResponseRow({ response }: { response: FeedbackResponse }) {
  const npsCategory = response.npsScore ? getNPSCategory(response.npsScore) : null;
  const npsColors = {
    promoter: 'bg-green-100 text-green-800',
    passive: 'bg-yellow-100 text-yellow-800',
    detractor: 'bg-red-100 text-red-800'
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">
        {new Date(response.createdAt).toLocaleDateString('nl-NL')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {response.testimonialName || 'Anonymous'}
      </td>
      <td className="px-6 py-4">
        {npsCategory && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${npsColors[npsCategory]}`}>
            {response.npsScore}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < (response.ratings?.value || 0)
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
        {response.feedback?.best || response.feedback?.frustrating || '-'}
      </td>
      <td className="px-6 py-4">
        <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
          View Details
        </button>
      </td>
    </tr>
  );
}

// Helper Components
function FeedbackHighlights({ responses }: { responses: FeedbackResponse[] }) {
  return (
    <div className="space-y-3">
      {responses.map((response) => (
        <div key={response.id} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-medium">
              {response.testimonialName || 'Beta Tester'}
            </span>
            <span className="text-xs text-gray-500">
              NPS: {response.npsScore}
            </span>
          </div>
          <p className="text-sm text-gray-600 italic">
            "{response.feedback?.best || response.npsReason}"
          </p>
        </div>
      ))}
    </div>
  );
}

function ConversionFunnel({ metrics }: { metrics: FeedbackMetrics }) {
  // Simplified funnel visualization
  const steps = [
    { name: 'Modal Opened', value: 100 },
    { name: 'Started', value: 85 },
    { name: 'Question 2', value: 72 },
    { name: 'Question 3', value: 65 },
    { name: 'Completed', value: 61 }
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step.name} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-600">{step.name}</div>
          <div className="flex-1 bg-gray-100 rounded h-8 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${step.value}%` }}
              transition={{ delay: index * 0.1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded flex items-center justify-end pr-2"
            >
              <span className="text-xs text-white font-medium">{step.value}%</span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimeAnalysis({ responses }: { responses: FeedbackResponse[] }) {
  const times = responses.map(r => r.timeToComplete || 0).filter(t => t > 0);
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.floor(avgTime / 60)}:{String(avgTime % 60).padStart(2, '0')}
        </p>
        <p className="text-sm text-gray-600">Average</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.floor(minTime / 60)}:{String(minTime % 60).padStart(2, '0')}
        </p>
        <p className="text-sm text-gray-600">Fastest</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.floor(maxTime / 60)}:{String(maxTime % 60).padStart(2, '0')}
        </p>
        <p className="text-sm text-gray-600">Slowest</p>
      </div>
    </div>
  );
}

function SentimentAnalysis({ responses }: { responses: FeedbackResponse[] }) {
  // Simplified sentiment based on NPS
  const sentiments = responses.map(r => ({
    date: new Date(r.createdAt).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
    score: r.npsScore || 5
  }));

  return (
    <div className="h-48 flex items-end gap-2">
      {sentiments.slice(-10).map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full rounded-t transition-all ${
              s.score >= 9 ? 'bg-green-500' : 
              s.score >= 7 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ height: `${(s.score / 10) * 100}%` }}
          />
          <span className="text-xs text-gray-500">{s.date}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}