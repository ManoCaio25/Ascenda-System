import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Users, Coffee, Moon } from "lucide-react";
import { Button } from "@estagiario/Components/ui/button";

export default function AvailabilityWidget() {
  const [selectedStatus, setSelectedStatus] = useState("tranquilo");

  const statuses = [
    { id: "tranquilo", icon: Zap, label: "Tranquilo", color: "text-green-400", bg: "bg-green-500/20" },
    { id: "ocupado", icon: Clock, label: "Ocupado", color: "text-yellow-400", bg: "bg-yellow-500/20" },
    { id: "reuniao", icon: Users, label: "Em Reunião", color: "text-red-400", bg: "bg-red-500/20" },
    { id: "pausa", icon: Coffee, label: "Pausa", color: "text-blue-400", bg: "bg-blue-500/20" },
    { id: "ausente", icon: Moon, label: "Ausente", color: "text-gray-400", bg: "bg-gray-500/20" }
  ];

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
          <h2 className="text-lg font-semibold text-white">Availability</h2>
          <p className="text-sm text-slate-400">Current: {currentStatus.label}</p>
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
            <span className="text-xs text-white">{status.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <Button 
        className="w-full bg-slate-800 hover:bg-slate-700 text-white"
        onClick={() => console.log('Availability updated:', selectedStatus)}
      >
        Update Status
      </Button>
    </motion.div>
  );
}