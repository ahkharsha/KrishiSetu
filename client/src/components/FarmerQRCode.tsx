// src/components/FarmerQRCode.tsx
'use client'

import { useAccount, useReadContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import QRCode from 'react-qr-code'
import { useState } from 'react'
import Card from './Card'
import { Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FarmerQRCode() {
  const { address } = useAccount()
  const t = useTranslations()
  const [copied, setCopied] = useState(false)
  
  const { data: farmer, isLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address!],
  }) as { data: any, isLoading: boolean }

  if (!address || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!farmer?.[6]) return null

  const verificationUrl = `${window.location.origin}/verify/${address}`
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl)
    setCopied(true)
    toast.success(t('linkCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title={t('farmerVerification')}>
      <div className="flex flex-col items-center space-y-4 p-4">
        <div className="p-4 bg-white rounded-lg border border-secondary-200">
          <QRCode 
            value={verificationUrl}
            size={208}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
          />
        </div>
        
        <p className="text-sm text-secondary-600 text-center">
          {t('scanQRToVerify')}
        </p>
        
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <p className="text-sm text-secondary-500 truncate flex-1">
            {verificationUrl}
          </p>
          <button 
            onClick={copyToClipboard}
            className="text-primary-600 hover:text-primary-800 p-1"
            title={t('copyLink')}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Card>
  )
}