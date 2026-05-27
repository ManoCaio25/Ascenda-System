import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Intern } from "@padrinho/entities/Intern";
import { Input } from "@padrinho/components/ui/input";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import InternCard from "../components/dashboard/InternCard";
import ChatDrawer from "../components/chat/ChatDrawer";
import { PAGE_URLS } from "@padrinho/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Interns() {
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  const [chatIntern, setChatIntern] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    const data = await Intern.list('-points');

    const uniqueInterns = [];
    const seenNames = new Set();
    for (const intern of data) {
      if (!seenNames.has(intern.full_name)) {
        seenNames.add(intern.full_name);
        uniqueInterns.push(intern);
      }
    }

    setInterns(uniqueInterns);
  };

  const handleInternClick = (intern) => {
    const internId = intern?.id ? String(intern.id) : slugify(intern.full_name);
    navigate(`${PAGE_URLS.Interns}/${internId}`, {
      state: {
        id: internId,
        name: intern.full_name,
        email: intern.email,
        track: intern.track,
      },
    });
  };

  const handleChatClick = (intern) => {
    setChatIntern(intern);
    setIsChatOpen(true);
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || intern.level === filterLevel;
    const matchesStatus = filterStatus === "all" || intern.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

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
              Team Overview
            </h1>
            <p className="text-muted">Manage and track your team's progress</p>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <Input
              placeholder="Search interns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface border-border text-primary placeholder:text-muted focus:border-brand"
            />
          </div>

          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full md:w-40 bg-surface border-border text-primary">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Novice">Novice</SelectItem>
              <SelectItem value="Apprentice">Apprentice</SelectItem>
              <SelectItem value="Journeyman">Journeyman</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-40 bg-surface border-border text-primary">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterns.map((intern, index) => (
            <InternCard
              key={intern.id}
              intern={intern}
              onClick={handleInternClick}
              onChatClick={handleChatClick}
              index={index}
            />
          ))}
        </div>

        {filteredInterns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No interns found matching your filters</p>
          </div>
        )}

        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          intern={chatIntern}
        />
      </div>
    </div>
  );
}
