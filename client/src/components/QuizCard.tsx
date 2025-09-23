// src/components/QuizCard.tsx (1)
'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useTranslations } from '../utils/i18n'

export default function QuizCard({
  question,
  options,
  correctAnswer,
  onComplete
}: {
  question: string
  options: string[]
  correctAnswer: number
  onComplete: (correct: boolean) => void
}) {
  const t = useTranslations()
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelected(index)
    const correct = index === correctAnswer
    setIsCorrect(correct)
    setAnswered(true)
    onComplete(correct)
  }

  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-secondary-200">
      <h3 className="font-semibold text-lg mb-4">{question}</h3>
      
      <div className="space-y-3">
        {shuffledOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(options.indexOf(option))}
            disabled={answered}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              answered
                ? options.indexOf(option) === correctAnswer
                  ? 'bg-green-100 border-green-500'
                  : selected === options.indexOf(option)
                    ? 'bg-red-100 border-red-500'
                    : 'border-secondary-300'
                : selected === options.indexOf(option)
                  ? 'bg-primary-100 border-primary-500'
                  : 'border-secondary-300 hover:border-primary-500'
            }`}
          >
            <div className="flex items-center">
              {answered && (
                <span className="mr-2">
                  {options.indexOf(option) === correctAnswer ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : selected === options.indexOf(option) ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </span>
              )}
              {option}
            </div>
          </button>
        ))}
      </div>

      {answered && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? t('correctAnswer') : t('incorrectAnswer')}
        </div>
      )}
    </div>
  )
}