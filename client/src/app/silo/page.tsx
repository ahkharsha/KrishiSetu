// src/app/silo/page.tsx
'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import CropCard from '@/components/CropCard'
import Card from '@/components/Card'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { type NotificationType } from '@/components/Notification'

export default function SiloPage() {
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const t = useTranslations()
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: farmer, isLoading: farmerLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address!],
  }) as { data: any, isLoading: boolean }

  const { data: storedCrops, isLoading: cropsLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getFarmerStoredCrops',
    args: [address],
  }) as { data: bigint[] | undefined, isLoading: boolean }

  const handleNotify = (message: string, type: NotificationType) => {
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'error') {
      toast.error(message)
    } else {
      toast(message)
    }
  }

  const listCropForSale = () => {
    if (!selectedCrop || !price || !quantity) return
    
    const priceNumber = Number(price)
    if (priceNumber < 0.0001) {
      toast.error(t('priceTooLow'))
      return
    }

    setLoading(true)
    const priceInWei = BigInt(Math.floor(priceNumber * 1e18))
    
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'listCropForSale',
      args: [selectedCrop, priceInWei, BigInt(quantity)],
    }, {
      onSuccess: () => {
        toast.success(t('cropListedSuccess'))
        setPrice('')
        setQuantity('')
        setSelectedCrop(null)
      },
      onError: (error) => {
        toast.error(`${t('listCropError')}: ${error.message}`)
      },
      onSettled: () => {
        setLoading(false)
      }
    })
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('connectWallet')}</p>
      </div>
    )
  }

  if (farmerLoading || cropsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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
        <h1 className="text-3xl font-bold mb-2">{t('mySilo')}</h1>
        <p className="text-secondary-600 mb-8">
          {t('manageStoredCrops')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">{t('storedCrops')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storedCrops?.map((cropId) => (
                <CropCard 
                  key={cropId.toString()} 
                  cropId={Number(cropId)}
                  onUpdateStage={() => {}}
                  onStore={() => {}}
                  onNotify={handleNotify}
                />
              ))}
            </div>
          </div>

          <div>
            <Card title={t('listForSale')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('selectCrop')}</label>
                  <select
                    value={selectedCrop || ''}
                    onChange={(e) => setSelectedCrop(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value="">{t('selectCrop')}</option>
                    {storedCrops?.map((cropId) => (
                      <option key={cropId.toString()} value={Number(cropId)}>
                        {t('crop')} #{cropId.toString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('quantity')}</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-field"
                    placeholder={t('amountToSell')}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('totalPrice')} (APE)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field"
                    placeholder={t('totalPriceForQuantity')}
                    step="0.0001"
                    min="0.0001"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">
                    {price && `${price} APE = ${Number(price)*1e18} wei`}
                  </p> */}
                </div>

                <button
                  onClick={listCropForSale}
                  disabled={!selectedCrop || !price || !quantity || loading}
                  className="btn btn-primary w-full mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('processing')}
                    </span>
                  ) : t('listForSale')}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}