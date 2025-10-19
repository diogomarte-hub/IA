import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { supabase, Lesson, Quiz } from '../lib/supabase';
import { QuizCard } from './QuizCard';
import ReactMarkdown from 'react-markdown';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export function LessonView({ lesson, onBack, onComplete, isCompleted }: LessonViewProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showQuizzes, setShowQuizzes] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, [lesson.id]);

  async function loadQuizzes() {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('order_index');

    if (data) {
      setQuizzes(data);
    }
  }

  function handleMarkComplete() {
    if (quizzes.length > 0) {
      setShowQuizzes(true);
    } else {
      onComplete();
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para o módulo
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-2 text-emerald-50">
            {isCompleted ? (
              <>
                <CheckCircle2 size={18} />
                <span className="text-sm">Aula completa</span>
              </>
            ) : (
              <>
                <Circle size={18} />
                <span className="text-sm">Em progresso</span>
              </>
            )}
          </div>
        </div>

        <div className="px-8 py-6">
          {!showQuizzes ? (
            <>
              <div className="prose prose-lg max-w-none mb-8">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {lesson.content}
                </div>
              </div>

              {!isCompleted && (
                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button
                    onClick={handleMarkComplete}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2 size={20} />
                    {quizzes.length > 0 ? 'Fazer Quiz' : 'Marcar como Completa'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Teste Seus Conhecimentos
                </h2>
                <p className="text-gray-600">
                  Responda às perguntas abaixo para consolidar seu aprendizado
                </p>
              </div>

              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  questionNumber={index + 1}
                  onAnswered={onComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
