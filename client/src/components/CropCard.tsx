'use client'

import { getDoc, doc } from 'firebase/firestore'
import { ref, get } from 'firebase/database'
import { db, rtdb } from '@/utils/firebase'
import Link from 'next/link'
import { type NotificationType } from '@/components/Notification'

import { useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '../utils/contract'
import { useTranslations } from '../utils/i18n'
import ProgressBar from './ProgressBar'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, SatelliteDish, X, ShieldCheck, ShieldAlert, Thermometer, Droplet, Clock, Eye, Lock, Cpu } from 'lucide-react'
import { useCookies } from 'react-cookie'

// --- TYPES ---
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

type FirebaseSensorData = {
  moisture: number;
  temperature: string;
  soil_co2: number;
  [key: string]: any;
}

type FirestoreDeviceData = {
  init_time: string;
  password: string;
  [key: string]: any;
}

export default function CropCard({
  cropId,
  onUpdateStage,
  onStore,
  onNotify 
}: {
  cropId: number
  onUpdateStage: (cropId: number, newStage: number, lossPercentage?: number) => void
  onStore: (cropId: number) => void
  onNotify: (message: string, type: NotificationType) => void
}) {
  
  // --- 1. HOOKS ---
  const t = useTranslations()
  const { writeContract } = useWriteContract()
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [lossPercentage, setLossPercentage] = useState('')
  const [showLossInput, setShowLossInput] = useState(false)
  const [showSensorModal, setShowSensorModal] = useState(false)
  const [isClient, setIsClient] = useState(false);

  // IoT State
  const [deviceId, setDeviceId] = useState('')
  const [password, setPassword] = useState('')
  const [sensorData, setSensorData] = useState<FirebaseSensorData | null>(null)
  const [sensorLoading, setSensorLoading] = useState(false)
  const [sensorError, setSensorError] = useState('')
  
  // Timer State
  const [predictionStartTime, setPredictionStartTime] = useState<number | null>(null);
  const [predictionTimer, setPredictionTimer] = useState<string | null>(null)
  
  const [cookies, setCookie] = useCookies([`crop_${cropId}_device`])

  // Read from Blockchain
  const { data: crop, refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'crops',
    args: [BigInt(cropId)],
  }) as { data: CropData | undefined, refetch: () => void }

  // --- 2. FAKING LOGIC FUNCTIONS ---

  const connectDevice = async (deviceInput: string, passInput: string, isAutoFetch = false) => {
    setSensorLoading(true);
    setSensorError('');

    if (deviceInput !== "device_001") {
      onNotify("DEVICE DOESNT EXIST", 'error'); 
      setSensorLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "farms", "farm1", "devices", deviceInput);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        onNotify("DEVICE DOESNT EXIST", 'error');
        setSensorLoading(false);
        return;
      }

      const data = snap.data() as FirestoreDeviceData;

      if (!isAutoFetch && passInput !== data.password) {
        onNotify("Wrong Password", 'error'); 
        setSensorError("Wrong password");
        setSensorLoading(false);
        return;
      }

      const rtdbRef = ref(rtdb, `sensor_data/${deviceInput}`);
      const sensorSnap = await get(rtdbRef);

      if (sensorSnap.exists()) {
        setSensorData(sensorSnap.val() as FirebaseSensorData);
        setCookie(`crop_${cropId}_device`, deviceInput, { path: '/', maxAge: 30 * 24 * 60 * 60 });
        
        const cleanTime = data.init_time.replace(" at ", " ").split(" UTC")[0];
        const startTime = new Date(cleanTime).getTime();
        setPredictionStartTime(startTime);

        if (!isAutoFetch) {
          onNotify("Device Connected Successfully", 'success');
          setShowSensorModal(false);
          setPassword('');
        }
      }

    } catch (e: any) {
      onNotify("Connection Error: " + e.message, 'error');
    } finally {
      setSensorLoading(false);
    }
  };

  // --- 3. EFFECTS ---

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const savedId = cookies[`crop_${cropId}_device`];
    if (savedId && savedId === "device_001") {
      setDeviceId(savedId);
      connectDevice(savedId, "project1", true); 
    }
  }, [cropId]);

  useEffect(() => {
    if (!isClient || !predictionStartTime) return;

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const targetTime = predictionStartTime + TWENTY_FOUR_HOURS;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setPredictionTimer("Ready");
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setPredictionTimer(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClient, predictionStartTime]);

  const anomalyStatus = useMemo(() => {
    if (!sensorData) return { text: "IoT Offline", color: "text-gray-400", bg: "bg-gray-100" };
    if (sensorData.moisture > 700) return { text: "Anomaly: Soil too Wet", color: "text-red-600", bg: "bg-red-50" };
    if (sensorData.moisture < 300) return { text: "Anomaly: Soil too Dry", color: "text-orange-600", bg: "bg-orange-50" };
    return { text: "No Anomalies Detected", color: "text-green-600", bg: "bg-green-50" };
  }, [sensorData]);

  // --- 4. RENDER ---

  if (!crop) return <div className="h-64 flex items-center justify-center border rounded-xl bg-gray-50"><Loader2 className="animate-spin text-gray-400" /></div>;

  // VISUAL FAKING
  const displayTitle = `Farm Land ${cropId}`; 

  const stageInfo = (() => {
    switch (Number(crop[6])) {
      case 0: return { text: "Yet to sow", color: 'bg-blue-500', progress: 30 }; // <-- MODIFIED TEXT
      case 1: return { text: t('growing'), color: 'bg-green-500', progress: 60 };
      case 2: return { text: t('harvested'), color: 'bg-yellow-500', progress: 100 };
      default: return { text: t('unknown'), color: 'bg-gray-500', progress: 0 };
    }
  })();

  const handleUpdateStage = (newStage: number) => {
    if (newStage === 2) { setShowLossInput(true); return; }
    onUpdateStage(cropId, newStage, 0);
  };
  const handleHarvest = () => {
    if (!lossPercentage) return;
    onUpdateStage(cropId, 2, Number(lossPercentage));
    setShowLossInput(false);
  };
  const handleStore = () => {
    onStore(cropId);
  };
  const handlePredict = () => {
    if (predictionTimer === "Ready") {
      onNotify("Prediction Complete: Maize is the optimal crop for next cycle.", 'success');
    } else {
      onNotify("The device needs to be deployed in the soil for a minimum of 24 hours to ensure reliable prediction", 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      
      {/* Top Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayTitle}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-mono mt-1">ID: {cropId.toString().padStart(4, '0')}</p>
          </div>
          
          {/* Status & IoT Button */}
          <div className="flex gap-2 items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-sm ${stageInfo.color}`}>
              {stageInfo.text}
            </span>
            <button 
              onClick={() => setShowSensorModal(true)}
              className={`p-2 rounded-full transition-all shadow-sm ${
                sensorData 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200 ring-2 ring-green-500/20' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
              title={sensorData ? "Device Connected" : "Connect Device"}
            >
              <SatelliteDish className={`w-4 h-4 ${sensorData ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
        
        <ProgressBar progress={stageInfo.progress} className="h-2 mb-4" />

        {/* Harvest Data (if ready) */}
        {Number(crop[6]) >= 2 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30 mb-4">
            <span className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase block mb-1">Yield Output</span>
            <span className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-100">{crop[8].toString()}</span>
            <span className="text-sm text-gray-500 ml-1">Units</span>
          </div>
        )}

        {/* Sensor Data Panel */}
        {sensorLoading ? (
          <div className="py-6 flex justify-center bg-gray-50 rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : sensorData ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 space-y-3 border border-slate-100 dark:border-slate-700">
            <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${anomalyStatus.bg} ${anomalyStatus.color}`}>
              <ShieldCheck className="w-3 h-3" />
              {anomalyStatus.text}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-center border border-slate-100 dark:border-slate-700">
                <Droplet className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{sensorData.moisture}</div>
                <div className="text-[10px] text-gray-400 uppercase">Moist</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-center border border-slate-100 dark:border-slate-700">
                <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{sensorData.temperature}°</div>
                <div className="text-[10px] text-gray-400 uppercase">Temp</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-center border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-black text-gray-400 block mb-1 h-4">CO₂</span>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{sensorData.soil_co2}</div>
                <div className="text-[10px] text-gray-400 uppercase">PPM</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-400">No IoT Device Connected</p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="mt-auto bg-white dark:bg-gray-800 p-5 border-t border-gray-100 dark:border-gray-700 space-y-3">
        
        {/* GOATED BUTTONS START */}
        
        {/* 1. Timeline Button */}
        <Link href={`/farm/farm1`} className="relative group w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12"></div>
          <Eye className="w-5 h-5" /> 
          <span className="relative">View Farm Timeline</span>
        </Link>

        {/* 2. Predict Button */}
        <button
          onClick={handlePredict}
          disabled={!sensorData || (!!predictionTimer && predictionTimer !== "Ready")}
          className={`relative group w-full px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center overflow-hidden ${
            !sensorData ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' :
            predictionTimer !== "Ready" ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/30' :
            'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-purple-500/30 hover:-translate-y-0.5'
          }`}
        >
          {/* Shine Effect */}
          {sensorData && <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12"></div>}
          
          <div className="relative flex items-center gap-3">
            {isClient && predictionTimer && predictionTimer !== "Ready" ? (
              <>
                <span className="opacity-90">Predict Best Crop</span>
                <span className="bg-black/20 px-2 py-0.5 rounded-md text-xs font-mono flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3" /> {predictionTimer}
                </span>
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                <span>Predict Best Crop</span>
              </>
            )}
          </div>
        </button>
        
        {/* GOATED BUTTONS END */}

        {/* Blockchain Actions */}
        <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
          {showLossInput ? (
            <div className="space-y-2">
              <input 
                type="number" 
                placeholder="Loss % (0-100)" 
                className="w-full px-3 py-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-600"
                value={lossPercentage}
                onChange={e => setLossPercentage(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowLossInput(false)} className="flex-1 py-2 text-xs border rounded hover:bg-gray-100">Cancel</button>
                <button onClick={handleHarvest} className="flex-1 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700">Confirm</button>
              </div>
            </div>
          ) : (
            Number(crop[6]) === 0 ? (
              <button onClick={() => handleUpdateStage(1)} className="w-full py-2 text-sm font-medium border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors">Mark as Growing</button>
            ) : Number(crop[6]) === 1 ? (
              <button onClick={() => setShowLossInput(true)} className="w-full py-2 text-sm font-medium border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">Harvest Crop</button>
            ) : Number(crop[6]) === 2 ? (
              <button onClick={handleStore} className="w-full py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">Store in Silo</button>
            ) : null
          )}
        </div>
      </div>

      {/* IoT Modal - Clean & Minimal */}
      {showSensorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <SatelliteDish className="w-5 h-5 text-blue-500" /> Link Device
              </h3>
              <button onClick={() => setShowSensorModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device ID</label>
                <div className="relative">
                  <Cpu className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-900"
                    placeholder="e.g. device_001"
                    value={deviceId}
                    onChange={e => setDeviceId(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={() => connectDevice(deviceId, password)}
                disabled={sensorLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {sensorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}