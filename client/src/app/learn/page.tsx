// src/app/learn/page.tsx
'use client'

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import Card from '@/components/Card'
import QuizCard from '@/components/QuizCard'
import { BookOpen, Trophy, CheckCircle, XCircle, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'

type Lesson = {
  id: bigint
  title: string
  content: string
  question1: string
  option1A: string
  option1B: string
  option1C: string
  question2: string
  option2A: string
  option2B: string
  option2C: string
  question3: string
  option3A: string
  option3B: string
  option3C: string
  knowledgePointsReward: bigint
}

type CompletedLessonsCookie = Record<string, boolean>

export default function LearnPage() {
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const t = useTranslations()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [quizResults, setQuizResults] = useState<boolean[]>([])
  const [loading, setLoading] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<bigint[]>([])
  const [cookieCompleted, setCookieCompleted] = useState<CompletedLessonsCookie>({})

  const { data: lessons } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getAllLessons',
  }) as { data: Lesson[] | undefined }

  const { data: farmer } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address!],
  }) as { data: any }

  // Load cookie data on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieData = Cookies.get('completedLessons')
      if (cookieData) {
        try {
          const parsedData = JSON.parse(cookieData) as CompletedLessonsCookie
          setCookieCompleted(parsedData)
        } catch (e) {
          console.error('Error parsing cookie data', e)
          Cookies.remove('completedLessons')
        }
      }
    }
  }, [])

  // Function to check if a lesson is completed (either on-chain or in cookies)
  const isLessonCompleted = (lessonId: bigint): boolean => {
    const idStr = lessonId.toString()
    return completedLessonIds.includes(lessonId) || cookieCompleted[idStr] === true
  }

  // Fetch all completed lessons for the user from blockchain
  useEffect(() => {
    if (!address || !lessons) return

    const fetchCompletedLessons = async () => {
      const completed = await Promise.all(
        lessons.map(async (lesson) => {
          const result = await refetchCompletedLessons(lesson.id)
          return result ? lesson.id : null
        })
      )
      setCompletedLessonIds(completed.filter(Boolean) as bigint[])
    }

    fetchCompletedLessons()
  }, [address, lessons])

  // Helper function to refetch completion status for a specific lesson
  const refetchCompletedLessons = async (lessonId: bigint): Promise<boolean> => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'completedLessons',
        args: [address!, lessonId],
      })
      return Boolean(result.data)
    } catch (error) {
      console.error('Error fetching completion status:', error)
      return false
    }
  }

  const completeLesson = async () => {
    if (!activeLesson) return

    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'completeLesson',
        args: [activeLesson.id],
      })
      toast.success(`${t('lessonCompleted')} +${activeLesson.knowledgePointsReward.toString()} ${t('knowledgePoints')}`)
      
      // Update completed lessons in state
      setCompletedLessonIds([...completedLessonIds, activeLesson.id])
      
      // Update cookie
      const idStr = activeLesson.id.toString()
      const updatedCookies: CompletedLessonsCookie = { ...cookieCompleted, [idStr]: true }
      setCookieCompleted(updatedCookies)
      Cookies.set('completedLessons', JSON.stringify(updatedCookies), { expires: 365 })
      
      setActiveLesson(null)
      setQuizResults([])
    } catch (error: any) {
      if (error.message.includes('LessonAlreadyCompleted')) {
        toast.error(t('lessonAlreadyCompleted'))
      } else {
        toast.error(`${t('completeLessonError')}: ${error.shortMessage || error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = (questionIndex: number, correct: boolean) => {
    const newResults = [...quizResults]
    newResults[questionIndex] = correct
    setQuizResults(newResults)
    
    if (newResults.length === 3 && newResults.every(r => r)) {
      toast.success(t('allAnswersCorrect'))
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('connectWallet')}</p>
      </div>
    )
  }

  if (!farmer?.[6]) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('registerFarmerFirst')}</p>
      </div>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('educationCenter')}</h1>
            <p className="text-secondary-600 mt-2">
              {t('learnSustainableFarming')}
            </p>
          </div>
        </div>

        {activeLesson ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card title={activeLesson.title}>
                <div className="prose max-w-none">
                  <p>{activeLesson.content}</p>
                </div>
              </Card>

              <div className="mt-6 space-y-6">
                <QuizCard
                  question={activeLesson.question1}
                  options={[
                    activeLesson.option1A,
                    activeLesson.option1B,
                    activeLesson.option1C
                  ]}
                  correctAnswer={0}
                  onComplete={(correct) => handleQuizComplete(0, correct)}
                />
                <QuizCard
                  question={activeLesson.question2}
                  options={[
                    activeLesson.option2A,
                    activeLesson.option2B,
                    activeLesson.option2C
                  ]}
                  correctAnswer={0}
                  onComplete={(correct) => handleQuizComplete(1, correct)}
                />
                <QuizCard
                  question={activeLesson.question3}
                  options={[
                    activeLesson.option3A,
                    activeLesson.option3B,
                    activeLesson.option3C
                  ]}
                  correctAnswer={0}
                  onComplete={(correct) => handleQuizComplete(2, correct)}
                />
              </div>
            </div>

            <div>
              <Card title={t('lessonProgress')}>
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('reward')}</h4>
                    <p className="text-primary-600 font-medium">
                      {activeLesson.knowledgePointsReward.toString()} {t('knowledgePoints')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('quizResults')}</h4>
                    {quizResults.map((result, index) => (
                      <div key={index} className="flex items-center">
                        {result ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <span>{t('question')} {index + 1}</span>
                      </div>
                    ))}
                  </div>

                  {isLessonCompleted(activeLesson.id) ? (
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      {t('lessonAlreadyCompleted')}
                    </div>
                  ) : (
                    <button
                      onClick={completeLesson}
                      disabled={quizResults.length < 3 || !quizResults.every(r => r) || loading}
                      className={`btn w-full mt-4 ${
                        quizResults.length === 3 && quizResults.every(r => r) 
                          ? 'btn-primary' 
                          : 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('completing')}
                        </span>
                      ) : (
                        t('completeLesson')
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveLesson(null)
                      setQuizResults([])
                    }}
                    className="btn btn-outline w-full"
                  >
                    {t('backToLessons')}
                  </button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons?.map((lesson) => (
              <div key={lesson.id.toString()} className="h-full">
                <Card 
                  className={`h-full hover:shadow-lg transition-shadow cursor-pointer ${
                    isLessonCompleted(lesson.id) ? 'border-green-300 bg-green-50' : ''
                  }`}
                  onClick={() => {
                    setActiveLesson(lesson)
                  }}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg mr-4 ${
                        isLessonCompleted(lesson.id) ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
                      }`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      {isLessonCompleted(lesson.id) && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Check className="w-3 h-3 mr-1" />
                          {t('completed')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-secondary-600 mb-4 line-clamp-2 flex-grow">
                      {lesson.content.substring(0, 100)}...
                    </p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm text-secondary-500">
                        {lesson.knowledgePointsReward.toString()} {t('points')}
                      </span>
                      <button 
                        className={`btn text-sm ${
                          isLessonCompleted(lesson.id) 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'btn-primary'
                        }`}
                      >
                        {isLessonCompleted(lesson.id) ? t('reviewLesson') : t('startLesson')}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}