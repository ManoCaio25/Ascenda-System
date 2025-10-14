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
import { eventBus, EventTypes } from "../components/utils/eventBus";

export default function Dashboard() {
  const [interns, setInterns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

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
      title: `Intern ${newStatus === 'paused' ? 'Paused' : 'Resumed'}`,
      body: `Learning system ${newStatus === 'paused' ? 'paused' : 'resumed'} for ${intern.full_name}`,
      target_id: intern.id,
      target_kind: 'intern',
      actor_name: user?.full_name || 'Manager'
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
            Welcome back, {user?.full_name || 'Manager'}!
          </h1>
          <p className="text-muted">Here's what's happening with your team today</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Interns"
            value={interns.length}
            icon={Users}
            gradient="bg-gradient-to-br from-brand to-blue-600"
            trend="+2 this month"
            delay={0.1}
          />
          <SummaryCard
            title="Courses Available"
            value={courses.length}
            icon={BookOpen}
            gradient="bg-gradient-to-br from-brand2 to-pink-600"
            delay={0.2}
          />
          <SummaryCard
            title="Pending Reviews"
            value={pendingTasks}
            icon={ClipboardCheck}
            gradient="bg-gradient-to-br from-brand2 to-yellow-600"
            delay={0.3}
          />
          <SummaryCard
            title="Team Points"
            value={totalPoints}
            icon={Trophy}
            gradient="bg-gradient-to-br from-yellow-600 to-pink-600"
            trend="+15%"
            delay={0.4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Intern Status & Well-being</h2>
            <span className="text-sm text-muted">{interns.length} interns</span>
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