import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Quiz } from '../lib/supabase';

interface QuizCardProps {
  quiz: Quiz;
  questionNumber: number;
  totalQuestions: number;
  onAnswered: () => void;
}

export function QuizCard({ quiz, questionNumber, totalQuestions, onAnswered }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  function handleSelectAnswer(index: number) {
    if (showResult) return;
    setSelectedAnswer(index);
  }

  function handleSubmit() {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (!answered) {
      setAnswered(true);
      if (questionNumber === totalQuestions) {
        setTimeout(() => {
          onAnswered();
        }, 1000);
      }
    }
  }

  const isCorrect = selectedAnswer === quiz.correct_answer;

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold">
          {questionNumber}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {quiz.question}
        </h3>
      </div>

      <div className="space-y-3 mb-4">
        {quiz.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === quiz.correct_answer;

          let buttonStyle = 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50';

          if (showResult) {
            if (isCorrectAnswer) {
              buttonStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'bg-red-50 border-red-500 ring-2 ring-red-200';
            }
          } else if (isSelected) {
            buttonStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${buttonStyle} ${
                showResult ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{option}</span>
                {showResult && isCorrectAnswer && (
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle size={20} className="text-red-600 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Verificar Resposta
        </button>
      )}

      {showResult && (
        <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isCorrect ? (
                <CheckCircle2 size={24} className="text-emerald-600" />
              ) : (
                <HelpCircle size={24} className="text-blue-600" />
              )}
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-emerald-900' : 'text-blue-900'}`}>
                {isCorrect ? 'Correto!' : 'Não foi dessa vez!'}
              </h4>
              <p className={isCorrect ? 'text-emerald-800' : 'text-blue-800'}>
                {quiz.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
