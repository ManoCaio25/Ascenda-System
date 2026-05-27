import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Button } from "@padrinho/components/ui/button";
import { 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from "recharts";
import { Download, TrendingUp, Target, Award, Clock } from "lucide-react";
import { format } from "date-fns";

function PerfTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-e2">
      <p className="text-sm font-semibold text-primary mb-2">
        {format(data.date, 'MMMM yyyy')}
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Score:</span>
          <span className="font-medium text-primary">{data.score}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Completion:</span>
          <span className="font-medium text-brand">{data.completion}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Points:</span>
          <span className="font-medium text-brand2">{data.points}</span>
        </div>
        {data.hours && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted">Hours:</span>
            <span className="font-medium text-success">{data.hours}h</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerformancePanel({ intern }) {
  const chartData = useMemo(() => {
    if (!intern.performance_history || intern.performance_history.length === 0) {
      return [];
    }

    return intern.performance_history
      .map(point => {
        const rawDate = point.date ?? point.month;
        const dateValue = rawDate instanceof Date ? rawDate : new Date(rawDate);

        if (Number.isNaN(dateValue?.getTime?.())) {
          return null;
        }

        return {
          date: dateValue,
          score: point.score,
          completion: point.completion || point.score * 0.9,
          points: point.points || Math.floor(point.score * 5),
          hours: point.hours || Math.floor(point.score / 10)
        };
      })
      .filter(Boolean);
  }, [intern.performance_history]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { currentScore: 0, avgScore: 0, completedCourses: 0, totalHours: 0 };
    }

    const last = chartData[chartData.length - 1];
    const recent = chartData.slice(-3);
    const avgScore = recent.reduce((sum, p) => sum + p.score, 0) / recent.length;
    const totalHours = chartData.reduce((sum, p) => sum + (p.hours || 0), 0);

    return {
      currentScore: last.score,
      avgScore: Math.round(avgScore),
      completedCourses: chartData.filter(p => p.completion >= 100).length,
      totalHours
    };
  }, [chartData]);

  const exportCSV = React.useCallback(() => {
    const headers = ['Month', 'Score', 'Completion', 'Points', 'Hours'];
    const rows = chartData.map(d => [
      format(d.date, 'yyyy-MM'),
      d.score,
      d.completion,
      d.points,
      d.hours || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${intern.full_name}-performance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [chartData, intern.full_name]);

  if (chartData.length === 0) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="p-6 text-center">
          <p className="text-muted">No performance data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface shadow-e1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface2 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-brand" />
              <span className="text-xs text-muted">Current Score</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.currentScore}%</p>
          </div>

          <div className="bg-surface2 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted">3-Mo Avg</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
          </div>

          <div className="bg-surface2 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-brand2" />
              <span className="text-xs text-muted">Completed</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.completedCourses}</p>
          </div>

          <div className="bg-surface2 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted">Study Hours</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalHours}h</p>
          </div>
        </div>

        <div className="h-80" role="img" aria-label="Performance chart showing score, completion, and points over time">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                tickFormatter={(value) => format(value, 'MMM')}
              />
              
              <YAxis 
                yAxisId="left"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: 'Score %', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
              />
              
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                label={{ value: 'Points', angle: 90, position: 'insideRight', fill: 'var(--text-muted)' }}
              />
              
              <Tooltip content={<PerfTooltip />} />
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              <ReferenceLine 
                yAxisId="left" 
                y={85} 
                stroke="var(--success)" 
                strokeDasharray="4 4"
                label={{ value: 'Target 85%', fill: 'var(--success)', fontSize: 12 }}
              />
              
              <Area 
                yAxisId="left"
                type="monotone"
                dataKey="completion"
                fill="url(#completionGradient)"
                stroke="var(--brand)"
                strokeWidth={2}
                name="Completion %"
              />
              
              <Line 
                yAxisId="left"
                type="monotone"
                dataKey="score"
                stroke="var(--brand-2)"
                strokeWidth={2}
                dot={{ fill: 'var(--brand-2)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Score %"
              />
              
              <Bar 
                yAxisId="right"
                dataKey="points"
                fill="var(--brand-2)"
                opacity={0.6}
                barSize={12}
                name="Points"
              />
              
              <Brush
                dataKey="date"
                height={20}
                stroke="var(--brand)"
                fill="var(--surface-2)"
                tickFormatter={(value) => format(value, 'MMM')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}