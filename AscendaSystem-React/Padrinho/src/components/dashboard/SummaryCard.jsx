import React from "react";
import { Card, CardContent } from "@padrinho/components/ui/card";
import { motion } from "framer-motion";

export default function SummaryCard({ title, value, icon: Icon, gradient, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border bg-surface hover:shadow-e2 transition-all duration-350 shadow-e1">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-primary">{value}</h3>
                {trend && (
                  <span className="text-sm text-success font-medium">
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${gradient} bg-opacity-20`}>
              <Icon className="w-6 h-6 text-brand" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}