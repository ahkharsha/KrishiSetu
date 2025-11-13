'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { Loader2, Calendar, MapPin, Camera, Clock, ChevronRight } from 'lucide-react'
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
  // In a real app we'd use params.farmId, but for the demo we hardcode the path you set up
  const farmId = "farm1"; 
  const deviceId = "device_001";

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
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!deviceData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">No Data Found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-2">
          <Link href="/farm" className="text-gray-400 hover:text-white transition-colors">Farm</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-primary-400">Timeline</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Farm Land 1 History
          </h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 13.0827° N, 80.2707° E</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Monitoring started 24h ago</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-gray-800 ml-3 space-y-12 pb-12">
          
          {/* Item 1: Deployment */}
          <div className="relative pl-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 ring-4 ring-gray-900"></div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Device Deployed</h3>
                <span className="text-sm font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">{deviceData.init_time.split('at')[0]}</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                IoT Sensor Node <b>{deviceId}</b> was successfully calibrated and inserted into the soil. 
                Initial connectivity check passed. Realtime monitoring active.
              </p>
              
              <div className="rounded-lg overflow-hidden bg-black border border-gray-700">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Visual Proof (IPFS)</span>
                </div>
                <div className="relative h-64 w-full">
                  <Image 
                    src={deviceData.latest_image_url} 
                    alt="Farm Proof"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-gray-900 px-4 py-2 text-xs font-mono text-gray-500 truncate">
                  CID: {deviceData.ipfs_cid}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Future */}
          <div className="relative pl-8 opacity-50">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-700 ring-4 ring-gray-900"></div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 border-dashed">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Data Processing...</h3>
              <p className="text-gray-500">Next automated visual proof scheduled in 12 hours.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}