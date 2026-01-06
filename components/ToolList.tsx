import React from 'react';
import { Tool } from '../types';

interface ToolListProps {
  tools: Tool[];
}

export const ToolList: React.FC<ToolListProps> = ({ tools }) => {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-jarvis-blue mb-2">Module Active</h2>
        <p className="text-gray-400">Arhitectură modulară: {tools.length} tool-uri încărcate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            className="bg-jarvis-panel border border-white/10 rounded-xl p-5 hover:border-jarvis-blue/50 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-2xl border border-gray-700 group-hover:border-jarvis-blue/50">
                  {tool.icon || '📦'}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-jarvis-blue transition-colors">
                    {tool.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    v{tool.version}
                  </span>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${tool.isEnabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-4 min-h-[40px]">
              {tool.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-gray-500 font-mono uppercase">
                ID: {tool.id}
              </span>
              <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${tool.type === 'core' ? 'text-cyan-400 bg-cyan-900/20' : 'text-purple-400 bg-purple-900/20'}`}>
                {tool.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};