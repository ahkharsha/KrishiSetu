'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
// --- FIX: Using relative path to guarantee resolution ---
import { db } from '../../../utils/firebase' 
import { Loader2, Calendar, MapPin, Camera, ChevronRight, ExternalLink, Clock, Droplet, Thermometer, Wind } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type DeviceData = {
  latest_image_url: string;
  ipfs_cid: string;
  init_time: string;
  password: string;
}

export default function FarmTimelinePage() {
  const params = useParams();
  const deviceId = params.deviceId as string; 
  const farmId = "farm1"; 

  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "farms", farmId, "devices", deviceId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setDeviceData(snap.data() as DeviceData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (deviceId) fetchData();
  }, [deviceId]);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!deviceData) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <h1 className="text-2xl font-bold">Device Not Found</h1>
      <p className="text-gray-400">Could not load timeline for {deviceId}</p>
      <Link href="/farm" className="text-green-400 hover:underline">Return to Dashboard</Link>
    </div>
  );

  // Clean init date
  const initDate = deviceData.init_time.split('at')[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-green-500/30">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/farm" className="text-gray-400 hover:text-white transition-colors font-medium">Dashboard</Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="font-bold text-green-400 tracking-wide">{deviceId}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            <MapPin className="w-3 h-3" /> 13.08°N, 80.27°E
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Farm History
          </h1>
          <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2">
            <Clock className="w-4 h-4 text-green-500" /> 
            Realtime monitoring active since <span className="text-white font-medium">{initDate}</span>
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Spine */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500/50 via-gray-800 to-gray-900 sm:-translate-x-1/2 rounded-full"></div>

          {/* --- ITEM 1: DEPLOYMENT --- */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 group">
            
            {/* Left Side (Content) */}
            <div className="w-full sm:w-[45%] pl-12 sm:pl-0 order-1 sm:order-1">
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300 shadow-xl hover:shadow-green-900/10 group-hover:-translate-y-1">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">Day 1</h3>
                    <span className="text-xs font-mono text-green-400">{initDate}</span>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <Camera className="w-5 h-5 text-green-500" />
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  IoT Node <b>{deviceId}</b> deployed and calibrated.
                  <br/>
                  <span className="flex items-center gap-2 mt-2 text-xs font-mono text-gray-500 bg-black/30 p-2 rounded">
                    <Droplet className="w-3 h-3 text-blue-400"/> Moist: 420 
                    <Thermometer className="w-3 h-3 text-orange-400"/> 26.5°C
                  </span>
                </p>
                
                {/* Image Card */}
                <a 
                  href={deviceData.latest_image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group/img relative rounded-xl overflow-hidden border border-gray-700"
                >
                  <div className="relative h-48 w-full">
                    <Image 
                      src={deviceData.latest_image_url} 
                      alt="Proof" 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover/img:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="text-[10px] font-mono text-white/70 truncate max-w-[150px]">{deviceData.ipfs_cid}</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1 bg-white/10 backdrop-blur px-2 py-1 rounded">
                        View <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-4 sm:left-1/2 -translate-x-[5px] sm:-translate-x-1/2 top-0 sm:top-1/2 sm:-translate-y-1/2 z-10 order-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] ring-4 ring-gray-950 relative">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            {/* Right Side (Empty for alternating) */}
            <div className="hidden sm:block w-[45%] order-3"></div>
          </div>

          {/* --- ITEM 2: FUTURE --- */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
            
            {/* Left Side (Empty) */}
            <div className="hidden sm:block w-[45%] order-1"></div>

            {/* Center Dot */}
            <div className="absolute left-4 sm:left-1/2 -translate-x-[5px] sm:-translate-x-1/2 top-0 sm:top-1/2 sm:-translate-y-1/2 z-10 order-2">
              <div className="w-3 h-3 bg-gray-700 rounded-full ring-4 ring-gray-950"></div>
            </div>

            {/* Right Side (Content) */}
            <div className="w-full sm:w-[45%] pl-12 sm:pl-0 order-3">
              <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl p-6 flex items-center gap-4 group">
                <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 text-sm">Next Automated Reading</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Scheduled in ~12 hours</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}