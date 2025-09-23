// src/app/farm/page.tsx
'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import { useState } from 'react'
import toast from 'react-hot-toast'
import CropCard from '@/components/CropCard'
import Card from '@/components/Card'
import { Sprout, Loader2, X } from 'lucide-react'

export default function FarmPage() {
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const t = useTranslations()
  const [selectedCropType, setSelectedCropType] = useState(0)
  const [seedsAmount, setSeedsAmount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [showSowModal, setShowSowModal] = useState(false)

  const { data: farmerCrops, refetch: refetchCrops } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getFarmerCrops',
    args: [address],
  }) as { data: bigint[] | undefined, refetch: () => void }

  const { data: farmer } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address!],
  }) as { data: any }

  const sowCrop = async () => {
    if (!seedsAmount || seedsAmount <= 0) {
      toast.error(t('invalidSeedAmount'))
      return
    }

    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'sowCrop',
        args: [selectedCropType, "farm123", seedsAmount],
      })
      toast.success(t('cropSownSuccess'))
      refetchCrops()
      setShowSowModal(false)
    } catch (error: any) {
      toast.error(t('sowCropError') + (error.shortMessage || error.message))
    } finally {
      setLoading(false)
    }
  }

  const updateCropStage = async (cropId: number, newStage: number, lossPercentage?: number) => {
    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateCropStage',
        args: [BigInt(cropId), newStage, lossPercentage || 0],
      })
      
      if (newStage === 1) {
        const points = seedsAmount * 4
        toast.success(`${t('cropGrowingSuccess')} +${points} ${t('sustainabilityPoints')}`)
      } else if (newStage === 2) {
        const harvested = seedsAmount * (100 - (lossPercentage || 0)) / 100
        const points = harvested * 2
        toast.success(`${t('cropHarvestedSuccess')} +${points} ${t('harvestPoints')}`)
      }
      
      refetchCrops()
    } catch (error: any) {
      toast.error(t('updateCropError') + (error.shortMessage || error.message))
    } finally {
      setLoading(false)
    }
  }

  const storeCrop = async (cropId: number) => {
    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'storeCrop',
        args: [BigInt(cropId)],
      })
      toast.success(t('cropStoredSuccess'))
      refetchCrops()
    } catch (error: any) {
      toast.error(t('storeCropError') + (error.shortMessage || error.message))
    } finally {
      setLoading(false)
    }
  }

  const cropTypes = [
    { id: 0, name: 'maize' },
    { id: 1, name: 'rice' },
    { id: 2, name: 'wheat' },
    { id: 3, name: 'cassava' },
    { id: 4, name: 'beans' },
    { id: 5, name: 'sorghum' },
    { id: 6, name: 'millet' },
    { id: 7, name: 'yam' },
    { id: 8, name: 'potatoes' },
    { id: 9, name: 'coffee' },
    { id: 10, name: 'cotton' },
  ]

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('myFarm')}</h1>
            <p className="text-secondary-600">
              {farmerCrops?.length || 0} {t('activeLands')}
            </p>
          </div>
          
          <button 
            onClick={() => setShowSowModal(true)}
            className="btn btn-primary w-full md:w-auto"
          >
            <Sprout className="w-4 h-4 mr-2" />
            {t('sowNewCrop')}
          </button>
        </div>

        {farmerCrops?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerCrops.map((cropId: bigint) => (
              <CropCard 
                key={cropId.toString()} 
                cropId={Number(cropId)} 
                onUpdateStage={updateCropStage}
                onStore={storeCrop}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Sprout className="w-12 h-12 mx-auto text-secondary-400" />
            <h3 className="text-xl font-semibold mt-4">{t('noActiveCrops')}</h3>
            <p className="text-secondary-600 mt-2">
              {t('sowYourFirstCrop')}
            </p>
          </Card>
        )}
      </div>

      {/* Sow Modal */}
      {showSowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('sowNewCrop')}</h3>
              <button 
                onClick={() => setShowSowModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('cropType')}
                </label>
                <select 
                  value={selectedCropType}
                  onChange={(e) => setSelectedCropType(Number(e.target.value))}
                  className="input-field w-full"
                >
                  {cropTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {t(type.name)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('seedsAmount')}
                </label>
                <input
                  type="number"
                  value={seedsAmount}
                  onChange={(e) => setSeedsAmount(Number(e.target.value))}
                  min="1"
                  className="input-field w-full"
                />
              </div>
              
              <button 
                onClick={sowCrop}
                disabled={loading}
                className="btn btn-primary w-full mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('sowing')}
                  </span>
                ) : (
                  <>
                    <Sprout className="w-4 h-4 mr-2" />
                    {t('sowCrop')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}