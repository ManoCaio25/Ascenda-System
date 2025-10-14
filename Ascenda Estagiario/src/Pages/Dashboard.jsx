import React, { useState, useEffect } from "react";
import { User } from "@estagiario/Entities/all";
import { Task } from "@estagiario/Entities/all";
import { LearningPath } from "@estagiario/Entities/all";
import { Content } from "@estagiario/Entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@estagiario/utils";
import { 
  Zap, 
  CheckCircle, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Rocket,
  Target,
  Brain,
  Heart,
  Coffee,
  AlertCircle,
  ChevronRight,
  Star,
  Trophy,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";

import WelcomeWidget from "../Components/dashboard/WelcomeWidget";
import StatsGrid from "../Components/dashboard/StatsGrid";
import TasksPreview from "../Components/dashboard/TasksPreview";
import LearningProgress from "../Components/dashboard/LearningProgress";
import WellbeingWidget from "../Components/dashboard/WellbeingWidget";
import AvailabilityWidget from "../Components/dashboard/AvailabilityWidget";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load user data
      const currentUser = await User.me().catch(() => ({
        full_name: "Alex Cosmos",
        email: "alex@ascenda.com", 
        pontos_gamificacao: 2847,
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
        area_atuacao: "Frontend Development"
      }));
      setUser(currentUser);

      // Load tasks, learning paths, and content
      const [tasksData, pathsData, contentData] = await Promise.all([
        Task.list('-created_date', 10).catch(() => []),
        LearningPath.list('-created_date', 5).catch(() => []),
        Content.list('-created_date', 10).catch(() => [])
      ]);

      setTasks(tasksData);
      setLearningPaths(pathsData);
      setContent(contentData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const stats = {
    totalPoints: user?.pontos_gamificacao || 2847,
    pendingTasks: tasks.filter(task => task.status_demanda === 'Pendente').length || 3,
    completedCourses: content.filter(c => c.status_conclusao === 'Concluido').length || 12,
    currentStreak: 7
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <WelcomeWidget user={user} isLoading={isLoading} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <StatsGrid stats={stats} isLoading={isLoading} />
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TasksPreview tasks={tasks} isLoading={isLoading} />
              <LearningProgress learningPaths={learningPaths} content={content} isLoading={isLoading} />
            </div>
            
            <div className="space-y-6">
              <WellbeingWidget />
              <AvailabilityWidget />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}