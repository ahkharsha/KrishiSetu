// src/app/market/page.tsx
'use client'

import { useEffect } from 'react'
import { useReadContract, useAccount } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import ListingCard from '@/components/ListingCard'
import Card from '@/components/Card'
import { ShoppingBag, Filter, Loader2 } from 'lucide-react'

export default function MarketPage() {
  const { address, isConnected } = useAccount()
  const t = useTranslations()

  const { data: listings, isLoading } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getActiveMarketListings',
  }) as { data: any[] | undefined, isLoading: boolean }

  useEffect(() => {
    console.log("Raw listings data:", listings)
  }, [listings])

  const { data: farmer } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'farmers',
    args: [address!],
  }) as { data: any }

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('marketplace')}</h1>
            <p className="text-secondary-600 mt-2">
              {t('buySellDirectly')}
            </p>
          </div>
          <button className="btn btn-outline flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {t('filters')}
          </button>
        </div>

        {listings?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.listingId.toString()} listing={listing} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto text-secondary-400" />
            <h3 className="text-xl font-semibold mt-4">{t('noListings')}</h3>
            <p className="text-secondary-600 mt-2">
              {t('noCropsForSale')}
            </p>
          </Card>
        )}
      </div>
    </main>
  )
}