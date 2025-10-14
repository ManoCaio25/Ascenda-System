import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Database } from 'lucide-react';
import { Input } from '@estagiario/Components/ui/input';

const mockIncidents = [
  { id: 1, titulo: "React component not re-rendering on prop change", descricao_problema: "A child component was not updating when its props changed from the parent.", solucao_aplicada: "Ensured that a unique `key` prop was passed to the component when rendering a list. Also memoized the component using `React.memo` to prevent unnecessary re-renders.", area_relacionada: "Frontend" },
  { id: 2, titulo: "Database connection timeout", descricao_problema: "The application was frequently losing connection to the PostgreSQL database under heavy load.", solucao_aplicada: "Increased the connection pool size in the database configuration. Implemented retry logic with exponential backoff for database connections.", area_relacionada: "Backend" },
  { id: 3, titulo: "CSS Flexbox alignment issue on Safari", descricao_problema: "Flex items were not aligning correctly on Safari browsers, while working fine on Chrome and Firefox.", solucao_aplicada: "Added vendor prefixes for flexbox properties (`-webkit-box-pack`, etc.) and used `display: -webkit-flex` as a fallback.", area_relacionada: "CSS" },
];

export default function KnowledgeBasePage() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredIncidents = incidents.filter(inc => 
    inc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inc.descricao_problema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="text-center mb-10">
        <Database className="w-16 h-16 mx-auto text-purple-400 mb-4" />
        <h1 className="text-4xl font-bold">Knowledge Base</h1>
        <p className="text-slate-400 mt-2">Find solutions to past challenges.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          type="text"
          placeholder="Search for solutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border-slate-700 pl-12 h-12 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        {filteredIncidents.map((incident, i) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="cosmic-card rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-800/30"
            >
              <h2 className="font-semibold">{incident.titulo}</h2>
              <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded-full">{incident.area_relacionada}</span>
            </button>
            {expandedId === incident.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-4 border-t border-slate-700">
                <div className="mt-4">
                  <h3 className="font-semibold text-purple-300">Problem</h3>
                  <p className="text-sm text-slate-300 mt-1">{incident.descricao_problema}</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-green-400">Solution</h3>
                  <p className="text-sm text-slate-300 mt-1">{incident.solucao_aplicada}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}