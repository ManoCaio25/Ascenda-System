import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  completed: 'var(--success)',
  in_progress: 'var(--brand)',
  pending: 'var(--warning)',
  overdue: 'var(--error)'
};

export default function TaskCompletionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <p>No task data available</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    displayName: item.name.replace('_', ' ').charAt(0).toUpperCase() + item.name.replace('_', ' ').slice(1)
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ displayName, percent }) => `${displayName}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="var(--brand)"
          dataKey="value"
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />
        <Legend 
          wrapperStyle={{ color: 'var(--text-secondary)' }}
          formatter={(value, entry) => entry.payload.displayName}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}