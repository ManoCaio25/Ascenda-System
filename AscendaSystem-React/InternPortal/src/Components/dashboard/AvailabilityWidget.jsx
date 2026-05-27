import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Users, Coffee, Moon } from "lucide-react";
import { Button } from "@estagiario/Components/ui/button";
import { useI18n } from "@estagiario/Components/utils/i18n";

export default function AvailabilityWidget() {
  const { t } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState("available");

  const statuses = useMemo(() => ([
    { id: "available", icon: Zap, labelKey: "available", color: "text-green-400", bg: "bg-green-500/20" },
    { id: "busy", icon: Clock, labelKey: "busy", color: "text-yellow-400", bg: "bg-yellow-500/20" },
    { id: "inMeeting", icon: Users, labelKey: "inMeeting", color: "text-red-400", bg: "bg-red-500/20" },
    { id: "onBreak", icon: Coffee, labelKey: "onBreak", color: "text-blue-400", bg: "bg-blue-500/20" },
    { id: "away", icon: Moon, labelKey: "away", color: "text-gray-400", bg: "bg-gray-500/20" }
  ]), []);

  const currentStatus = statuses.find(s => s.id === selectedStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cosmic-card rounded-xl p-6 cosmic-glow"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${currentStatus.bg}`}>
          <currentStatus.icon className={`w-5 h-5 ${currentStatus.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{t('availability')}</h2>
          <p className="text-sm text-slate-400">{t('availabilityCurrent', { status: t(currentStatus.labelKey) })}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {statuses.slice(0, 5).map((status) => (
          <button
            key={status.id}
            onClick={() => setSelectedStatus(status.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
              selectedStatus === status.id
                ? 'bg-purple-600/20 border border-purple-600/40'
                : 'bg-slate-800/30 hover:bg-slate-800/50'
            }`}
          >
            <status.icon className={`w-4 h-4 ${status.color}`} />
            <span className="text-xs text-white text-center leading-tight">{t(status.labelKey)}</span>
          </button>
        ))}
      </div>

      <Button
        className="w-full bg-slate-800 hover:bg-slate-700 text-white"
        onClick={() => console.log('Availability updated:', selectedStatus)}
      >
        {t('updateStatus')}
      </Button>
    </motion.div>
  );
}