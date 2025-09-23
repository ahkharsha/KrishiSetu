// src/app/admin/page.tsx
'use client'

import { useAccount, useReadContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import Card from '@/components/Card'
import { Users, FileText, Award, Lock } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const t = useTranslations()
  
  const { data: isAdmin, isLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'isAdmin',
    args: [address],
  }) as { data: boolean, isLoading: boolean }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('connectWallet')}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Lock className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('accessDenied')}</h3>
          <p className="text-secondary-600">{t('adminAccessRequired')}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">{t('adminDashboard')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title={t('totalFarmers')}>
            <div className="flex items-center justify-between p-6">
              <Users className="w-12 h-12 text-primary-600" />
              <span className="text-3xl font-bold">0</span>
            </div>
          </Card>
          <Card title={t('daoProposals')}>
            <div className="flex items-center justify-between p-6">
              <FileText className="w-12 h-12 text-primary-600" />
              <span className="text-3xl font-bold">0</span>
            </div>
          </Card>
          <Card title={t('totalRewards')}>
            <div className="flex items-center justify-between p-6">
              <Award className="w-12 h-12 text-primary-600" />
              <span className="text-3xl font-bold">0 ETH</span>
            </div>
          </Card>
        </div>

        <Card title={t('adminActions')} className="p-6">
          <div className="space-y-4">
            <button className="btn btn-outline w-full">
              {t('manageFarmers')}
            </button>
            <button className="btn btn-outline w-full">
              {t('manageProposals')}
            </button>
            <button className="btn btn-outline w-full">
              {t('adjustParameters')}
            </button>
          </div>
        </Card>
      </div>
    </main>
  )
}