'use client'

// --- IMPORTS ---
import { getDoc, doc } from 'firebase/firestore'
import { ref, get } from 'firebase/database'
import { db, rtdb } from '@/utils/firebase' // Correct relative path
import { useRouter } from 'next/navigation'
import { type NotificationType } from '@/components/Notification'

import { useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '../utils/contract'
import { useTranslations } from '../utils/i18n'
import ProgressBar from './ProgressBar'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, SatelliteDish, X, ShieldCheck, ShieldAlert, Thermometer, Droplet, Clock, Eye, Lock, Cpu, QrCode, Leaf, History, Maximize } from 'lucide-react'
import { useCookies } from 'react-cookie'
import { QRCodeSVG } from 'qrcode.react'

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
  const router = useRouter()
  const { writeContract } = useWriteContract()
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [lossPercentage, setLossPercentage] = useState('')
  const [showLossInput, setShowLossInput] = useState(false)
  const [showSensorModal, setShowSensorModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
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

  // --- 2. LOGIC FUNCTIONS ---

  const connectDevice = async (deviceInput: string, passInput: string, isAutoFetch = false) => {
    setSensorLoading(true); setSensorError('');
    if (deviceInput !== "device_001") { onNotify("DEVICE DOESNT EXIST", 'error'); setSensorLoading(false); return; }
    try {
      const docRef = doc(db, "farms", "farm1", "devices", deviceInput);
      const snap = await getDoc(docRef);
      if (!snap.exists()) { onNotify("DEVICE DOESNT EXIST", 'error'); setSensorLoading(false); return; }
      const data = snap.data() as FirestoreDeviceData;
      if (!isAutoFetch && passInput !== data.password) { onNotify("Wrong Password", 'error'); setSensorError("Wrong password"); setSensorLoading(false); return; }
      const rtdbRef = ref(rtdb, `sensor_data/${deviceInput}`);
      const sensorSnap = await get(rtdbRef);
      if (sensorSnap.exists()) {
        setSensorData(sensorSnap.val() as FirebaseSensorData);
        setCookie(`crop_${cropId}_device`, deviceInput, { path: '/', maxAge: 30 * 24 * 60 * 60 });
        const cleanTime = data.init_time.replace(" at ", " ").split(" UTC")[0];
        setPredictionStartTime(new Date(cleanTime).getTime());
        if (!isAutoFetch) { onNotify("Device Connected Successfully", 'success'); setShowSensorModal(false); setPassword(''); }
      }
    } catch (e: any) { onNotify("Connection Error: " + e.message, 'error'); } finally { setSensorLoading(false); }
  };

  const handleViewTimeline = () => {
    const activeDevice = deviceId || cookies[`crop_${cropId}_device`];
    if (activeDevice) {
      router.push(`/farm/${activeDevice}`);
    } else {
      onNotify("Error. Connect a device first", 'error');
    }
  };

  // --- 3. EFFECTS ---

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => {
    const savedId = cookies[`crop_${cropId}_device`];
    if (savedId && savedId === "device_001") { setDeviceId(savedId); connectDevice(savedId, "project1", true); }
  }, [cropId]);
  useEffect(() => {
    if (!isClient || !predictionStartTime) return;
    const targetTime = predictionStartTime + (24 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const diff = targetTime - Date.now();
      if (diff <= 0) { setPredictionTimer("Ready"); clearInterval(interval); }
      else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setPredictionTimer(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isClient, predictionStartTime]);

  const anomalyStatus = useMemo(() => {
    if (!sensorData) return { text: "IoT Offline", color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-700" };
    if (sensorData.moisture > 700) return { text: "Anomaly: Soil too Wet", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" };
    if (sensorData.moisture < 300) return { text: "Anomaly: Soil too Dry", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" };
    return { text: "Healthy", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  }, [sensorData]);

  // --- 4. RENDER ---

  if (!crop) return (
    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  const displayTitle = `Farm Land ${cropId}`; 
  const stageInfo = (() => {
    switch (Number(crop[6])) {
      case 0: return { text: "Yet to sow", color: 'bg-blue-500', progress: 30 }; 
      case 1: return { text: t('growing'), color: 'bg-green-500', progress: 60 };
      case 2: return { text: t('harvested'), color: 'bg-yellow-500', progress: 100 };
      default: return { text: t('unknown'), color: 'bg-gray-500', progress: 0 };
    }
  })();

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
      onNotify(`A minimum of 24 hours of soil monitoring is required for reliable prediction. Please wait for ${predictionTimer}.`, 'error');
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full relative">
      
      <div className={`h-1.5 w-full ${stageInfo.color.replace('bg-', 'bg-gradient-to-r from-transparent to-')}`}></div>

      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{displayTitle}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide shadow-sm ${stageInfo.color}`}>
                {stageInfo.text}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3" /> ID: {cropId.toString().padStart(4, '0')}
            </p>
          </div>
          
          <button 
            onClick={() => setShowSensorModal(true)}
            className={`relative pl-3 pr-4 py-1.5 rounded-full transition-all border flex items-center gap-2 ${
              sensorData 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 hover:bg-emerald-100' 
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${sensorData ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs font-bold uppercase tracking-wider">{sensorData ? "Online" : "Connect"}</span>
          </button>
        </div>
        
        <ProgressBar progress={stageInfo.progress} className="h-1.5 bg-gray-100 dark:bg-gray-700" />
      </div>

      {/* MAIN DASHBOARD AREA */}
      <div className="px-6 py-2 flex-1 flex flex-col gap-3">
        {sensorLoading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[120px]">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : sensorData ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex gap-2">
            
            {/* LEFT: Sensor Stats (65% Width) */}
            <div className="flex-[2] space-y-2">
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${anomalyStatus.bg} ${anomalyStatus.color}`}>
                <span className="flex items-center gap-2 truncate"><ShieldCheck className="w-4 h-4 shrink-0" /> {anomalyStatus.text}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded text-center shadow-sm">
                  <Droplet className="w-3 h-3 text-blue-500 mx-auto mb-0.5" />
                  <div className="text-[11px] font-black text-gray-800 dark:text-gray-100">{sensorData.moisture}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded text-center shadow-sm">
                  <Thermometer className="w-3 h-3 text-orange-500 mx-auto mb-0.5" />
                  <div className="text-[11px] font-black text-gray-800 dark:text-gray-100">{sensorData.temperature}°</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded text-center shadow-sm">
                  <span className="text-[9px] font-black text-gray-400 block mb-0.5">CO2</span>
                  <div className="text-[11px] font-black text-gray-800 dark:text-gray-100">{sensorData.soil_co2}</div>
                </div>
              </div>
            </div>

            {/* RIGHT: QR Code (35% Width) */}
            <button 
              onClick={() => setShowQRModal(true)}
              className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group/qr"
              title="Click to Expand"
            >
              <div className="bg-white p-1 rounded border border-gray-100">
                <QRCodeSVG value={`https://krishisetu-dao.vercel.app/farm/${deviceId}`} size={70} />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase group-hover/qr:text-blue-500 flex items-center gap-1">
                <Maximize className="w-3 h-3" /> Scan
              </span>
            </button>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[120px] gap-2">
            <SatelliteDish className="w-8 h-8 text-gray-300" />
            <p className="text-xs font-bold text-gray-400 uppercase">No Sensor Linked</p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          
          {/* 1. Timeline Button */}
          <button 
            onClick={handleViewTimeline}
            className="relative group w-full px-4 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wide shadow-lg transition-all flex flex-col items-center justify-center gap-1 overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12"></div>
            <History className="w-5 h-5" />
            <span>Timeline</span>
          </button>

          {/* 2. Predict Button */}
          <button
            onClick={handlePredict}
            disabled={!sensorData} // Enabled to show time remaining
            className={`relative group w-full px-4 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wide shadow-lg transition-all flex flex-col items-center justify-center gap-1 overflow-hidden ${
              !sensorData ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none' :
              (isClient && predictionTimer && predictionTimer !== "Ready") ? 'bg-gradient-to-br from-amber-500 to-orange-500 hover:shadow-orange-500/30 hover:-translate-y-0.5' :
              'bg-gradient-to-br from-purple-600 to-indigo-600 hover:shadow-purple-500/30 hover:-translate-y-0.5'
            }`}
          >
            {sensorData && <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12"></div>}
            
            {isClient && predictionTimer && predictionTimer !== "Ready" ? (
              <>
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="font-mono text-[10px]">{predictionTimer}</span>
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                Predict
              </>
            )}
          </button>
        </div>

        <div className="pt-2">
          {showLossInput ? (
            <div className="space-y-2 animate-in slide-in-from-bottom-2 fade-in">
              <input type="number" placeholder="Loss % (0-100)" className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={lossPercentage} onChange={e => setLossPercentage(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => setShowLossInput(false)} className="flex-1 py-2 text-xs font-bold text-gray-500 border rounded-lg hover:bg-gray-100">CANCEL</button>
                <button onClick={handleHarvest} className="flex-1 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">CONFIRM</button>
              </div>
            </div>
          ) : (
            Number(crop[6]) === 1 ? (
              <button onClick={() => setShowLossInput(true)} className="w-full py-2.5 text-xs font-bold border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 uppercase tracking-wide transition-colors">Harvest Crop</button>
            ) : Number(crop[6]) === 2 ? (
              <button onClick={handleStore} className="w-full py-2.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md shadow-green-600/20 uppercase tracking-wide transition-colors">Store in Silo</button>
            ) : null
          )}
        </div>
      </div>

      {/* IoT Modal */}
      {showSensorModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><SatelliteDish className="w-5 h-5 text-blue-500" /> Link Device</h3>
              <button onClick={() => setShowSensorModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device ID</label><div className="relative"><Cpu className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="text" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-900" placeholder="e.g. device_001" value={deviceId} onChange={e => setDeviceId(e.target.value)} /></div></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access Key</label><div className="relative"><Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="password" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-900" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div></div>
              <button onClick={() => connectDevice(deviceId, password)} disabled={sensorLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">{sensorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect & Verify"}</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl border-4 border-white/10 animate-in zoom-in-95">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h3 className="text-xl font-black mb-1 text-gray-800 tracking-tight">FARM TRACKER</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mb-6">Scan for Live Timeline</p>
            <div className="flex justify-center mb-6">
              <QRCodeSVG value={`https://krishisetu-dao.vercel.app/farm/${deviceId}`} size={200} level="H" className="border-8 border-gray-100 rounded-xl" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 font-mono text-sm font-bold">
              <Cpu className="w-4 h-4" /> {deviceId}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}