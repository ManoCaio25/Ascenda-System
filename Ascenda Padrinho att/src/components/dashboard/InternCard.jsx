import React from "react";
import { Card, CardContent } from "@padrinho/components/ui/card";
import { Badge } from "@padrinho/components/ui/badge";
import { Button } from "@padrinho/components/ui/button";
import { Trophy, TrendingUp, MessageCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Avatar from "../ui/Avatar";
import { getDaysLeft, getDaysLeftBadgeColor } from "../utils/dates";

export default function InternCard({ intern, onClick, onChatClick, index }) {
  const avgScore = intern.performance_history?.length > 0
    ? intern.performance_history.reduce((sum, p) => sum + p.score, 0) / intern.performance_history.length
    : 0;

  const levelColors = {
    "Novice": "bg-gray-500/20 text-secondary border-border",
    "Apprentice": "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "Journeyman": "bg-purple-500/20 text-brand border-border",
    "Expert": "bg-orange-500/20 text-brand2 border-orange-500/30",
    "Master": "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30"
  };

  const sparklineData = React.useMemo(() => {
    if (!intern.performance_history || intern.performance_history.length === 0) return [];
    return intern.performance_history.slice(-6).map(p => ({ value: p.score }));
  }, [intern.performance_history]);

  const daysLeft = intern.end_date ? getDaysLeft(intern.end_date) : null;
  const daysLeftColors = daysLeft !== null ? getDaysLeftBadgeColor(daysLeft) : null;

  const handleChatClick = (e) => {
    e.stopPropagation();
    onChatClick(intern);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="border-border bg-surface hover:shadow-e2 transition-all duration-350 cursor-pointer group shadow-e1"
        onClick={() => onClick(intern)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand2 p-0.5">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  <Avatar 
                    src={intern.avatar_url} 
                    alt={intern.full_name}
                    size={60}
                  />
                </div>
              </div>
              {intern.points > 500 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-brand2 to-pink-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="font-semibold text-primary text-lg group-hover:text-brand transition-colors truncate">
                  {intern.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={`${levelColors[intern.level]} border`}>
                    {intern.level}
                  </Badge>
                  {daysLeft !== null && daysLeftColors && (
                    <Badge className={`${daysLeftColors.bg} ${daysLeftColors.text} border ${daysLeftColors.border}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {daysLeft}d left
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted">Points:</span>
                  <span className="font-bold text-brand2">
                    {intern.points}
                  </span>
                </div>
                {avgScore > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-medium">
                      {avgScore.toFixed(0)}% avg
                    </span>
                  </div>
                )}
              </div>

              {sparklineData.length > 0 && (
                <div className="h-8 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--brand)" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {intern.skills && intern.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {intern.skills.slice(0, 3).map((skill, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs bg-surface2 text-secondary border-border"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={handleChatClick}
                variant="outline"
                size="sm"
                className="w-full mt-2 border-border hover:bg-surface2 text-secondary hover:text-primary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}