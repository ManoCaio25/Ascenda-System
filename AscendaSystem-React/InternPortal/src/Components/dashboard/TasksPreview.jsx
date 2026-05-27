import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@estagiario/utils";
import { CheckCircle, Clock, AlertCircle, ChevronRight, Target } from "lucide-react";
import { Button } from "@estagiario/Components/ui/button";
import { Skeleton } from "@estagiario/Components/ui/skeleton";
import { format } from "date-fns";
import { useI18n } from "@estagiario/Components/utils/i18n";

export default function TasksPreview({ tasks, isLoading }) {
  const { t } = useI18n();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluida': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Em Andamento': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Pendente': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Concluida': return 'bg-green-500/20 text-green-300';
      case 'Em Andamento': return 'bg-blue-500/20 text-blue-300'; 
      case 'Pendente': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const mockTasks = useMemo(() => ([
    {
      id: "1",
      titulo_demanda: t('tasksFallbackReactComponents'),
      status_demanda: "Em Andamento",
      data_limite: "2024-01-15",
      pontos_gamificacao_associados: 150,
      priority: "high"
    },
    {
      id: "2",
      titulo_demanda: t('tasksFallbackWeeklyReport'),
      status_demanda: "Pendente",
      data_limite: "2024-01-12",
      pontos_gamificacao_associados: 50,
      priority: "medium"
    },
    {
      id: "3",
      titulo_demanda: t('tasksFallbackDocumentation'),
      status_demanda: "Pendente",
      data_limite: "2024-01-18",
      pontos_gamificacao_associados: 75,
      priority: "low"
    }
  ]), [t]);

  const displayTasks = tasks.length > 0 ? tasks.slice(0, 4) : mockTasks;

  const translateStatus = (status) => {
    switch (status) {
      case 'Concluida':
        return t('done');
      case 'Em Andamento':
        return t('inProgress');
      case 'Pendente':
        return t('todo');
      case 'Aguardando Revisao':
        return t('inReview');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="cosmic-card rounded-xl p-6 cosmic-glow">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cosmic-card rounded-xl p-6 cosmic-glow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">{t('activeTasks')}</h2>
        </div>
        <Link to={createPageUrl("Tasks")}>
          <Button variant="outline" size="sm" className="border-purple-600 text-purple-300 hover:bg-purple-600/20">
            {t('viewAll')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {displayTasks.map((task, index) => (
          <motion.div
            key={task.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(task.status_demanda)}
              <div>
                <h3 className="font-medium text-white text-sm">
                  {task.titulo_demanda}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status_demanda)}`}>
                    {translateStatus(task.status_demanda)}
                  </span>
                  {task.data_limite && (
                    <span className="text-xs text-slate-400">
                      {t('due', { date: format(new Date(task.data_limite), "MMM d") })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-orange-400">
                +{task.pontos_gamificacao_associados} {t('pointsSuffix')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}