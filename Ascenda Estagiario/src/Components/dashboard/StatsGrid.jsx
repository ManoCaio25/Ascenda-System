import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, BookOpen, Flame } from "lucide-react";
import { Skeleton } from "@estagiario/Components/ui/skeleton";
import { useI18n } from "@estagiario/Components/utils/i18n";

export default function StatsGrid({ stats, isLoading }) {
  const { t } = useI18n();
  const statCards = [
    {
      title: t('statsPoints'),
      value: stats.totalPoints,
      icon: Zap,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/20",
      trend: t('statsTrendPoints')
    },
    {
      title: t('activeTasks'),
      value: stats.pendingTasks,
      icon: CheckCircle,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/20",
      trend: t('statsTrendTasks')
    },
    {
      title: t('coursesCompleted'),
      value: stats.completedCourses,
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/20",
      trend: t('statsTrendCourses')
    },
    {
      title: t('learningStreak'),
      value: t('days', { count: stats.currentStreak }),
      icon: Flame,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/20",
      trend: t('statsTrendStreak')
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="cosmic-card rounded-xl p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="cosmic-card rounded-xl p-6 hover:scale-105 transition-transform duration-200 cosmic-glow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className="w-6 h-6 text-text-primary" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-sm text-text-secondary">{stat.title}</div>
            </div>
          </div>
          <div className="text-xs text-text-secondary/80">{stat.trend}</div>
        </motion.div>
      ))}
    </div>
  );
}
