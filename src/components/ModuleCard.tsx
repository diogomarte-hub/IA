import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Module } from '../lib/supabase';

interface ModuleCardProps {
  module: Module;
  lessonsCount: number;
  completedCount: number;
  onSelect: () => void;
}

export function ModuleCard({ module, lessonsCount, completedCount, onSelect }: ModuleCardProps) {
  const progress = lessonsCount > 0 ? (completedCount / lessonsCount) * 100 : 0;
  const isCompleted = completedCount === lessonsCount && lessonsCount > 0;

  return (
    <button
      onClick={onSelect}
      className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-200 p-6 text-left border border-purple-500/20 hover:border-purple-500/50 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
          <BookOpen size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {module.title}
            </h3>
            {isCompleted && (
              <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {module.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {completedCount} de {lessonsCount} aulas completas
              </span>
              <span className="font-medium text-purple-400">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
