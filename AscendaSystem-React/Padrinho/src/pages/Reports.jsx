import React, { useState, useEffect } from "react";
import { Intern } from "@padrinho/entities/Intern";
import { Task } from "@padrinho/entities/Task";
import { Course } from "@padrinho/entities/Course";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Button } from "@padrinho/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import TeamPerformanceChart from "../components/reports/TeamPerformanceChart";
import TaskCompletionChart from "../components/reports/TaskCompletionChart";

export default function Reports() {
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [internsData, tasksData, coursesData] = await Promise.all([
      Intern.list('-points'),
      Task.list(),
      Course.list()
    ]);
    setInterns(internsData);
    setTasks(tasksData);
    setCourses(coursesData);
  };

  const performanceData = interns.slice(0, 10).map(intern => ({
    name: intern.full_name?.split(' ')[0] || 'Unknown',
    points: intern.points || 0
  }));

  const taskStatusData = [
    { name: 'completed', value: tasks.filter(t => t.status === 'completed').length },
    { name: 'in_progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'pending', value: tasks.filter(t => t.status === 'pending').length },
    { name: 'overdue', value: tasks.filter(t => t.status === 'overdue').length },
  ].filter(item => item.value > 0);

  const downloadReport = () => {
    const reportData = interns.map(intern => ({
      Name: intern.full_name,
      Points: intern.points,
      Level: intern.level,
      Status: intern.status,
      'Start Date': intern.start_date
    }));

    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ascenda_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Reports & Analytics
            </h1>
            <p className="text-muted">Insights into your team's performance and progress</p>
          </div>
          <Button
            onClick={downloadReport}
            className="bg-brand hover:bg-brand/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border bg-surface shadow-e1">
            <CardHeader>
              <CardTitle className="text-primary">
                Team Performance (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TeamPerformanceChart data={performanceData} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface shadow-e1">
            <CardHeader>
              <CardTitle className="text-primary">
                Task Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TaskCompletionChart data={taskStatusData} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-surface shadow-e1">
          <CardHeader>
            <CardTitle className="text-primary">
              Key Metrics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-surface2 rounded-xl border border-border">
                <p className="text-sm text-muted mb-2">Total Interns</p>
                <p className="text-3xl font-bold text-primary">{interns.length}</p>
              </div>
              <div className="text-center p-4 bg-surface2 rounded-xl border border-border">
                <p className="text-sm text-muted mb-2">Active Tasks</p>
                <p className="text-3xl font-bold text-primary">{tasks.length}</p>
              </div>
              <div className="text-center p-4 bg-surface2 rounded-xl border border-border">
                <p className="text-sm text-muted mb-2">Available Courses</p>
                <p className="text-3xl font-bold text-primary">{courses.length}</p>
              </div>
              <div className="text-center p-4 bg-surface2 rounded-xl border border-border">
                <p className="text-sm text-muted mb-2">Avg. Points</p>
                <p className="text-3xl font-bold text-primary">
                  {interns.length > 0 ? Math.round(interns.reduce((sum, i) => sum + i.points, 0) / interns.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}