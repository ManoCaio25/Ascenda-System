import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function TeamPerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <p>No performance data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
        <XAxis 
          dataKey="name" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)' }}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)' }}
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
          labelStyle={{ color: 'var(--text-secondary)' }}
          cursor={{ fill: 'var(--surface-2)', opacity: 0.3 }}
        />
        <Legend 
          wrapperStyle={{ color: 'var(--text-secondary)' }}
        />
        <Bar 
          dataKey="points" 
          fill="var(--brand)" 
          radius={[8, 8, 0, 0]}
          name="Points"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}