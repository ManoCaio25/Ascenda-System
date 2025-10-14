import React from "react";
import { motion } from "framer-motion";
import { Rocket, Sparkles } from "lucide-react";
import { Skeleton } from "@estagiario/Components/ui/skeleton";

export default function WelcomeWidget({ user, isLoading }) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden cosmic-card rounded-2xl p-8 mb-8 cosmic-glow">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden cosmic-card rounded-2xl p-8 mb-8 cosmic-glow"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 cosmic-gradient rounded-full opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Ready to Ascend, {user?.full_name?.split(' ')[0] || 'Intern'}? 
            <Rocket className="inline ml-2 w-8 h-8 text-orange-400" />
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300"
          >
            Continue your cosmic journey of learning and growth
          </motion.p>
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="hidden md:block"
        >
          <Sparkles className="w-16 h-16 text-purple-400 opacity-50" />
        </motion.div>
      </div>
    </motion.div>
  );
}