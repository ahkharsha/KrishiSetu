// src/app/verify/[address]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useReadContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import Card from '@/components/Card'
import StatsCard from '@/components/StatsCard'
import { User, Leaf, BookOpen, Award, Loader2 } from 'lucide-react'

export default function VerifyFarmerPage() {
  const { address } = useParams()
  const t = useTranslations()
  
  const { data: farmer, isLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address as `0x${string}`],
  }) as { data: any, isLoading: boolean }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('farmerNotFound')}</p>
      </div>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">{t('farmerVerification')}</h1>
        
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('farmerAddress')}: {address}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard
                title={t('reputationPoints')}
                value={farmer[1].toString()}
                icon={<Award className="w-5 h-5" />}
              />
              <StatsCard
                title={t('sustainabilityScore')}
                value={farmer[2].toString()}
                icon={<Leaf className="w-5 h-5" />}
              />
              <StatsCard
                title={t('knowledgePoints')}
                value={farmer[3].toString()}
                icon={<BookOpen className="w-5 h-5" />}
              />
              <StatsCard
                title={t('harvestPoints')}
                value={farmer[4].toString()}
                icon={<Leaf className="w-5 h-5" />}
              />
            </div>
          </div>
        </Card>
        
        <p className="text-secondary-600 text-sm text-center">
          {t('verificationNote')}
        </p>
      </div>
    </main>
  )
}