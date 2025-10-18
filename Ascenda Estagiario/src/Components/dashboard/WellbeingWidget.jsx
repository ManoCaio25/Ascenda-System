import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Smile, Meh, Frown, AlertTriangle } from "lucide-react";
import { Button } from "@estagiario/Components/ui/button";
import { useI18n } from "@estagiario/Components/utils/i18n";

export default function WellbeingWidget() {
  const [selectedFeeling, setSelectedFeeling] = useState("good");
  const { t } = useI18n();

  const feelings = useMemo(() => ([
    { id: "excellent", icon: Smile, color: "text-green-400" },
    { id: "good", icon: Smile, color: "text-blue-400" },
    { id: "neutral", icon: Meh, color: "text-yellow-400" },
    { id: "stressed", icon: Frown, color: "text-orange-400" },
    { id: "overwhelmed", icon: AlertTriangle, color: "text-red-400" }
  ]), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cosmic-card rounded-xl p-6 cosmic-glow"
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-semibold text-white">{t('wellbeingCheckin')}</h2>
      </div>

      <p className="text-sm text-slate-400 mb-4">{t('howAreYouFeeling')}</p>

      <div className="space-y-2 mb-4">
        {feelings.map((feeling) => (
          <button
            key={feeling.id}
            onClick={() => setSelectedFeeling(feeling.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              selectedFeeling === feeling.id 
                ? 'bg-purple-600/20 border border-purple-600/40' 
                : 'bg-slate-800/30 hover:bg-slate-800/50'
            }`}
          >
            <feeling.icon className={`w-5 h-5 ${feeling.color}`} />
            <span className="text-white text-sm">{t(feeling.id)}</span>
          </button>
        ))}
      </div>

      <Button
        className="w-full cosmic-gradient text-white font-medium"
        onClick={() => console.log('Wellbeing updated:', selectedFeeling)}
      >
        {t('updateStatus')}
      </Button>
    </motion.div>
  );
}