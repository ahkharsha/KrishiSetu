// src/components/CropCard.tsx
'use client'

import { useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '../utils/contract'
import { useTranslations } from '../utils/i18n'
import Image from 'next/image'
import ProgressBar from './ProgressBar'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Award, SatelliteDish, X } from 'lucide-react'
import { useCookies } from 'react-cookie'

type CropData = [
  id: bigint,
  farmerAddress: string,
  cropType: bigint,
  farmId: string,
  sownTimestamp: bigint,
  harvestedTimestamp: bigint,
  stage: bigint,
  initialSeeds: bigint,
  harvestedOutput: bigint
]

type SensorDataResponse = {
  data?: [number, number, number]
}

export default function CropCard({
  cropId,
  onUpdateStage,
  onStore
}: {
  cropId: number
  onUpdateStage: (cropId: number, newStage: number, lossPercentage?: number) => void
  onStore: (cropId: number) => void
}) {
  const t = useTranslations()
  const { writeContract } = useWriteContract()
  const [loading, setLoading] = useState(false)
  const [lossPercentage, setLossPercentage] = useState('')
  const [showLossInput, setShowLossInput] = useState(false)
  const [showSensorModal, setShowSensorModal] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [sensorData, setSensorData] = useState<{
    moisture: number | null
    temperature: number | null
    humidity: number | null
  } | null>(null)
  const [sensorLoading, setSensorLoading] = useState(false)
  const [sensorError, setSensorError] = useState('')
  const [cookies, setCookie] = useCookies([`crop_${cropId}_device`])

  const { data: crop, refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'crops',
    args: [BigInt(cropId)],
  }) as { data: CropData | undefined, refetch: () => void }

  const { refetch: fetchSensorData } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getSensorReadings',
    args: [deviceId],
  }) as {
    data: [number, number, number] | undefined,
    refetch: () => Promise<SensorDataResponse>
  }

  // Load saved device ID on component mount
  useEffect(() => {
    const savedDeviceId = cookies[`crop_${cropId}_device`]
    if (savedDeviceId) {
      setDeviceId(savedDeviceId)
      fetchSensorDataForDevice(savedDeviceId)
    }
  }, [cropId])

  const fetchSensorDataForDevice = async (device: string) => {
    setSensorLoading(true)
    setSensorError('')
    try {
      const response = await fetchSensorData()
      const data = response.data

      if (data && data[0] !== 0 && data[1] !== 0 && data[2] !== 0) {
        setSensorData({
          moisture: data[0],
          temperature: data[1],
          humidity: data[2]
        })
        setCookie(`crop_${cropId}_device`, device, { path: '/', maxAge: 30 * 24 * 60 * 60 }) // Store for 30 days
      } else {
        setSensorData(null)
        setSensorError('No sensor found with this device ID')
        setCookie(`crop_${cropId}_device`, '', { path: '/', maxAge: -1 }) // Remove cookie
      }
    } catch (error) {
      setSensorError('Failed to fetch sensor data')
      setSensorData(null)
    } finally {
      setSensorLoading(false)
    }
  }

  if (!crop) return (
    <div className="card border border-secondary-200 p-6 flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  )

  const cropTypes = [
    'maize', 'rice', 'wheat', 'cassava', 'beans',
    'sorghum', 'millet', 'yam', 'potatoes', 'coffee', 'cotton'
  ]

  const cropStage = (stage: bigint) => {
    switch (Number(stage)) {
      case 0: return { text: t('sown'), color: 'bg-blue-500', progress: 30 }
      case 1: return { text: t('growing'), color: 'bg-green-500', progress: 60 }
      case 2: return { text: t('harvested'), color: 'bg-yellow-500', progress: 100 }
      default: return { text: t('unknown'), color: 'bg-gray-500', progress: 0 }
    }
  }

  const stageInfo = cropStage(crop[6])

  const handleUpdateStage = async (newStage: number) => {
    if (newStage === 2) {
      setShowLossInput(true)
      return
    }

    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateCropStage',
        args: [BigInt(cropId), newStage, 0],
      })
      toast.success(`Crop updated to ${stageInfo.text} successfully!`)
      if (newStage === 1) {
        const points = Number(crop[7]) * 4
        toast.custom((t) => (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg flex items-center">
            <Award className="w-5 h-5 mr-2" />
            <span>You earned {points} sustainability points!</span>
          </div>
        ), { duration: 5000 })
      }
      refetch()
    } catch (error) {
      toast.error('Failed to update crop stage')
    } finally {
      setLoading(false)
    }
  }

  const handleHarvest = async () => {
    if (!lossPercentage) return

    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateCropStage',
        args: [BigInt(cropId), 2, Number(lossPercentage)],
      })
      const harvestPoints = (Number(crop[7]) * (100 - Number(lossPercentage)) / 100) * 2
      toast.custom((t) => (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg flex items-center">
          <Award className="w-5 h-5 mr-2" />
          <span>You earned {harvestPoints} harvest points!</span>
        </div>
      ), { duration: 5000 })
      refetch()
      setShowLossInput(false)
    } catch (error) {
      toast.error('Failed to harvest crop')
    } finally {
      setLoading(false)
    }
  }

  const handleStore = async () => {
    setLoading(true)
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'storeCrop',
        args: [BigInt(cropId)],
      })
      toast.success('Crop stored in silo successfully!')
      onStore(cropId)
      refetch()
    } catch (error) {
      toast.error('Failed to store crop')
    } finally {
      setLoading(false)
    }
  }

  const handleGetSensorData = async () => {
    if (!deviceId) {
      setSensorError('Please enter a device ID')
      return
    }

    await fetchSensorDataForDevice(deviceId)
  }

  return (
    <div className="card border border-secondary-200 hover:border-primary-300 transition-colors">
      <div className="p-4 flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={`/crops/${cropTypes[Number(crop[2])]}.png`}
            alt={t(cropTypes[Number(crop[2])])}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg capitalize">{t(cropTypes[Number(crop[2])])}</h3>
              <p className="text-secondary-600 text-sm">ID: {cropId}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageInfo.color} text-white`}>
                {stageInfo.text}
              </span>
              <button
                onClick={() => setShowSensorModal(true)}
                className="bg-primary-100 hover:bg-primary-200 text-primary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 transition-colors"
                title="Connect IoT Sensors"
              >
                <SatelliteDish className="w-4 h-4" />
                <span>IoT</span>
              </button>
            </div>
          </div>

          <ProgressBar progress={stageInfo.progress} className="my-3" />

          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div>
              <p className="text-secondary-500">{t('seedsPlanted')}</p>
              <p className="font-medium">{crop[7].toString()}</p>
            </div>
            {Number(crop[6]) >= 2 && (
              <div>
                <p className="text-secondary-500">{t('harvested')}</p>
                <p className="font-medium">{crop[8].toString()}</p>
              </div>
            )}
          </div>

          {sensorLoading ? (
            <div className="mt-2 border-t border-secondary-100 pt-2 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            </div>
          ) : sensorData ? (
            <div className="mt-2 border-t border-secondary-100 pt-2">
              <h4 className="text-sm font-medium text-secondary-500 mb-1">Sensor Data</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 p-1.5 rounded">
                  <p className="text-blue-600">Moisture</p>
                  <p className="font-bold">{sensorData.moisture}</p>
                </div>
                <div className="bg-orange-50 p-1.5 rounded">
                  <p className="text-orange-600">Temp</p>
                  <p className="font-bold">{sensorData.temperature}°C</p>
                </div>
                <div className="bg-green-50 p-1.5 rounded">
                  <p className="text-green-600">Humidity</p>
                  <p className="font-bold">{sensorData.humidity}%</p>
                </div>
              </div>
            </div>
          ) : sensorError && (
            <div className="mt-2 border-t border-secondary-100 pt-2 text-red-500 text-sm">
              {sensorError}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-secondary-200 p-4">
        {showLossInput ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('lossPercentage')}</label>
              <input
                type="number"
                value={lossPercentage}
                onChange={(e) => setLossPercentage(e.target.value)}
                className="input-field"
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLossInput(false)}
                className="btn btn-outline flex-1"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleHarvest}
                disabled={!lossPercentage || loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : t('confirmHarvest')}
              </button>
            </div>
          </div>
        ) : Number(crop[6]) === 0 ? (
          <button
            onClick={() => handleUpdateStage(1)}
            disabled={loading}
            className="btn btn-outline w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : t('markAsGrowing')}
          </button>
        ) : Number(crop[6]) === 1 ? (
          <button
            onClick={() => setShowLossInput(true)}
            disabled={loading}
            className="btn btn-outline w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : t('markAsHarvested')}
          </button>
        ) : Number(crop[6]) === 2 ? (
          <button
            onClick={handleStore}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : t('storeInSilo')}
          </button>
        ) : null}
      </div>

      {/* Sensor Connection Modal */}
      {showSensorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <SatelliteDish className="w-5 h-5" />
                IoT Sensors Connection
              </h3>
              <button
                onClick={() => {
                  setShowSensorModal(false)
                  setSensorError('')
                }}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Device ID
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter sensor device ID"
                />
              </div>

              {sensorError && (
                <div className="text-red-500 text-sm">{sensorError}</div>
              )}

              <button
                onClick={handleGetSensorData}
                disabled={sensorLoading}
                className="btn btn-primary w-full"
              >
                {sensorLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Connect Device'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}