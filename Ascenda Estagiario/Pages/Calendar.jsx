import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '@estagiario/Entities/all';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    CalendarEvent.list().then(setEvents);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart);

  const eventsForDay = (day) => events.filter(event => isSameDay(new Date(event.data_hora_inicio), day));

  return (
    <div className="p-8 max-w-7xl mx-auto text-text-primary">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
              className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
              className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button className="cosmic-gradient text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-700 dark:bg-slate-700 light:bg-slate-300 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-sm py-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-text-primary">
            {day}
          </div>
        ))}
        {Array.from({ length: startingDayIndex }).map((_, i) => 
          <div key={`empty-${i}`} className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50"></div>
        )}
        {daysInMonth.map((day, i) => (
          <div key={day.toString()} className="h-40 bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 p-2 flex flex-col overflow-hidden">
            <span className={`font-semibold text-sm ${
              isSameDay(day, new Date()) 
                ? 'text-purple-400' 
                : 'text-text-secondary'
            }`}>
              {format(day, 'd')}
            </span>
            <div className="mt-1 space-y-1 overflow-y-auto">
              {eventsForDay(day).map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-purple-600/50 text-xs p-1 rounded-md truncate cursor-pointer text-white"
                >
                  {event.titulo_evento}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}