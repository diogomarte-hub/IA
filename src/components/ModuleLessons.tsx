import { ArrowLeft, CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react';
import { Module, Lesson, UserProgress } from '../lib/supabase';

interface ModuleLessonsProps {
  module: Module;
  lessons: Lesson[];
  completedLessonIds: Set<string>;
  userProgress: Map<string, UserProgress>;
  onBack: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export function ModuleLessons({
  module,
  lessons,
  completedLessonIds,
  userProgress,
  onBack,
  onSelectLesson
}: ModuleLessonsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para módulos
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-8 text-white">
          <h1 className="text-3xl font-bold mb-3">{module.title}</h1>
          <p className="text-emerald-50 text-lg">{module.description}</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Aulas do Módulo
            </h2>
            <span className="text-sm text-gray-500">
              {completedLessonIds.size} de {lessons.length} completas
            </span>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const progress = userProgress.get(lesson.id);
              const isCompleted = progress?.completed || false;
              const isInProgress = progress && !progress.completed;

              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-5 text-left border border-gray-200 hover:border-emerald-300 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-semibold border border-gray-200 group-hover:border-emerald-300">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-sm text-emerald-600">Completa</span>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-sm text-blue-600">Em progresso</span>
                          </>
                        ) : (
                          <>
                            <Circle size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Não iniciada</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <PlayCircle size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
