import { useState, useEffect } from 'react';
import { GraduationCap, TrendingUp, Award, LogIn, LogOut } from 'lucide-react';
import { supabase, Module, Lesson, UserProgress } from './lib/supabase';
import { ModuleCard } from './components/ModuleCard';
import { ModuleLessons } from './components/ModuleLessons';
import { LessonView } from './components/LessonView';
import { AuthModal } from './components/AuthModal';
import type { User } from '@supabase/supabase-js';

type View = 'modules' | 'lessons' | 'lesson';

function App() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [currentView, setCurrentView] = useState<View>('modules');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadModules();
    loadAllLessons();
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserProgress();
    }
  }, [userId]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setUserId(session.user.id);
    } else {
      const tempId = localStorage.getItem('tempUserId') || crypto.randomUUID();
      localStorage.setItem('tempUserId', tempId);
      setUserId(tempId);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
      } else {
        setUser(null);
        const tempId = localStorage.getItem('tempUserId') || crypto.randomUUID();
        localStorage.setItem('tempUserId', tempId);
        setUserId(tempId);
      }
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserProgress(new Map());
  }

  async function loadModules() {
    const { data } = await supabase
      .from('modules')
      .select('*')
      .order('order_index');

    if (data) {
      setModules(data);
    }
  }

  async function loadAllLessons() {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index');

    if (data) {
      setAllLessons(data);
    }
  }

  async function loadUserProgress() {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (data) {
      const progressMap = new Map<string, UserProgress>();
      data.forEach(progress => {
        progressMap.set(progress.lesson_id, progress);
      });
      setUserProgress(progressMap);
    }
  }

  async function loadLessonsForModule(moduleId: string) {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');

    if (data) {
      setLessons(data);
    }
  }

  function handleSelectModule(module: Module) {
    setSelectedModule(module);
    loadLessonsForModule(module.id);
    setCurrentView('lessons');
  }

  async function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setCurrentView('lesson');

    if (!userProgress.has(lesson.id)) {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lesson.id,
          completed: false
        }, {
          onConflict: 'user_id,lesson_id'
        });
      await loadUserProgress();
    }
  }

  function handleBackToModules() {
    setCurrentView('modules');
    setSelectedModule(null);
    setLessons([]);
  }

  function handleBackToLessons() {
    setCurrentView('lessons');
    setSelectedLesson(null);
  }

  async function handleCompleteLesson() {
    if (!selectedLesson) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: selectedLesson.id,
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id'
      });

    if (!error) {
      await loadUserProgress();
    }
  }

  function getLessonCountForModule(moduleId: string): number {
    return allLessons.filter(l => l.module_id === moduleId).length;
  }

  function getCompletedCountForModule(moduleId: string): number {
    const moduleLessons = allLessons.filter(l => l.module_id === moduleId);
    return moduleLessons.filter(l => userProgress.has(l.id) && userProgress.get(l.id)?.completed).length;
  }

  const totalLessons = allLessons.length;
  const completedLessons = Array.from(userProgress.values()).filter(p => p.completed).length;
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const completedLessonIds = new Set(
    Array.from(userProgress.entries())
      .filter(([_, progress]) => progress.completed)
      .map(([lessonId]) => lessonId)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/50 backdrop-blur-lg border-b border-purple-500/20 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Dominando IA
                </h1>
                <p className="text-sm text-purple-300">
                  Aprenda a usar IA sem enrolação
                </p>
              </div>
            </div>

            {currentView === 'modules' && (
              <div className="flex items-center gap-4">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors border border-purple-500/20"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30"
                  >
                    <LogIn size={18} />
                    <span className="hidden sm:inline">Entrar / Criar Conta</span>
                    <span className="sm:hidden">Entrar</span>
                  </button>
                )}
                <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Progresso Geral</p>
                    <p className="text-sm font-semibold text-white">
                      {Math.round(overallProgress)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-purple-400" />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Aulas Completas</p>
                    <p className="text-sm font-semibold text-white">
                      {completedLessons} de {totalLessons}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'modules' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">
                Domine IA do Zero ao Avançado
              </h2>
              <p className="text-lg text-gray-300">
                Curso completo e direto ao ponto. Sem filtros, sem enrolação. Aprenda a usar IA na prática.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  lessonsCount={3}
                  completedCount={getCompletedCountForModule(module.id)}
                  onSelect={() => handleSelectModule(module)}
                />
              ))}
            </div>

            {modules.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Carregando módulos...</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'lessons' && selectedModule && (
          <ModuleLessons
            module={selectedModule}
            lessons={lessons}
            completedLessonIds={completedLessonIds}
            userProgress={userProgress}
            onBack={handleBackToModules}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentView === 'lesson' && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            onBack={handleBackToLessons}
            onComplete={handleCompleteLesson}
            isCompleted={completedLessonIds.has(selectedLesson.id)}
          />
        )}
      </main>

      <footer className="bg-black/50 backdrop-blur-lg border-t border-purple-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              Aprenda IA de verdade. Sem hype, sem enrolação.
            </p>
            <p className="text-sm text-gray-500">
              O futuro pertence a quem domina IA
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          loadUserProgress();
        }}
      />
    </div>
  );
}

export default App;
