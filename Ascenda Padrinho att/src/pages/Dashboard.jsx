import React, { useState, useEffect } from "react";
import { Intern } from "@padrinho/entities/Intern";
import { Course } from "@padrinho/entities/Course";
import { Task } from "@padrinho/entities/Task";
import { User } from "@padrinho/entities/User";
import { Notification } from "@padrinho/entities/Notification";
import { Users, BookOpen, ClipboardCheck, Trophy } from "lucide-react";
import SummaryCard from "../components/dashboard/SummaryCard";
import InternStatusCard from "../components/dashboard/InternStatusCard";
import { motion } from "framer-motion";
import { useTranslation } from "@padrinho/i18n";
import { eventBus, EventTypes } from "../components/utils/eventBus";

export default function Dashboard() {
  const [interns, setInterns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not loaded");
    }
    
    const [internsData, coursesData, tasksData] = await Promise.all([
      Intern.list('-points'),
      Course.list(),
      Task.list()
    ]);
    
    // Remove duplicates by keeping only unique full_name entries
    const uniqueInterns = [];
    const seenNames = new Set();
    for (const intern of internsData) {
      if (!seenNames.has(intern.full_name)) {
        seenNames.add(intern.full_name);
        uniqueInterns.push(intern);
      }
    }
    
    setInterns(uniqueInterns);
    setCourses(coursesData);
    setTasks(tasksData);
  };

  const handleStatusToggle = async (intern) => {
    const newStatus = intern.status === 'active' ? 'paused' : 'active';
    await Intern.update(intern.id, { status: newStatus });

    await Notification.create({
      type: newStatus === 'paused' ? 'intern_paused' : 'intern_resumed',
      title: newStatus === 'paused'
        ? t("dashboard.notifications.internPaused")
        : t("dashboard.notifications.internResumed"),
      body: t("dashboard.notifications.learningSystemStatus", {
        status: newStatus === 'paused'
          ? t("dashboard.notifications.status.paused")
          : t("dashboard.notifications.status.resumed"),
        name: intern.full_name
      }),
      target_id: intern.id,
      target_kind: 'intern',
      actor_name: user?.full_name || t("common.manager")
    });

    eventBus.emit(newStatus === 'paused' ? EventTypes.INTERN_PAUSED : EventTypes.INTERN_RESUMED, {
      internId: intern.id
    });

    loadData();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalPoints = interns.reduce((sum, intern) => sum + (intern.points || 0), 0);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {t("dashboard.greeting", { name: user?.full_name || t("common.manager") })}
          </h1>
          <p className="text-muted">{t("dashboard.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title={t("dashboard.summary.totalInterns.title")}
            value={interns.length}
            icon={Users}
            gradient="bg-gradient-to-br from-brand to-blue-600"
            trend={t("dashboard.summary.totalInterns.trend")}
            delay={0.1}
          />
          <SummaryCard
            title={t("dashboard.summary.coursesAvailable.title")}
            value={courses.length}
            icon={BookOpen}
            gradient="bg-gradient-to-br from-brand2 to-pink-600"
            delay={0.2}
          />
          <SummaryCard
            title={t("dashboard.summary.pendingReviews.title")}
            value={pendingTasks}
            icon={ClipboardCheck}
            gradient="bg-gradient-to-br from-brand2 to-yellow-600"
            delay={0.3}
          />
          <SummaryCard
            title={t("dashboard.summary.teamPoints.title")}
            value={totalPoints}
            icon={Trophy}
            gradient="bg-gradient-to-br from-yellow-600 to-pink-600"
            trend={t("dashboard.summary.teamPoints.trend")}
            delay={0.4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">{t("dashboard.interns.sectionTitle")}</h2>
            <span className="text-sm text-muted">
              {t("dashboard.interns.countLabel", {
                count: interns.length,
                suffix: interns.length === 1 ? "" : "s"
              })}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.map((intern, index) => (
              <InternStatusCard
                key={intern.id}
                intern={intern}
                onStatusToggle={handleStatusToggle}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}