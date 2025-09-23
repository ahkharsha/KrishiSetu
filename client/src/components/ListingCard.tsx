// src/components/ListingCard.tsx
'use client'

import { useTranslations } from '../utils/i18n'
import Image from 'next/image'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useWriteContract, useAccount } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatUnits } from 'viem'

type Listing = {
  listingId: bigint
  cropId: bigint
  seller: string
  priceInWei: bigint
  quantityToSell: bigint
  listingTimestamp: bigint
  isActive: boolean
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations()
  const { writeContract } = useWriteContract()
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)

  const cropTypes = [
    'maize', 'rice', 'wheat', 'cassava', 'beans',
    'sorghum', 'millet', 'yam', 'potatoes', 'coffee', 'cotton'
  ]

  const formatPrice = (priceWei: bigint) => {
    try {
      const priceApe = formatUnits(priceWei, 18)
      const numericPrice = Number(priceApe)
      
      if (numericPrice >= 1) return numericPrice.toFixed(2)
      if (numericPrice >= 0.01) return numericPrice.toFixed(4)
      if (numericPrice > 0) return numericPrice.toFixed(8)
      return '0'
    } catch (error) {
      console.error("Error formatting price:", error)
      return '0'
    }
  }

  const handlePurchase = () => {
    if (!address) return

    setLoading(true)
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'purchaseCrop',
      args: [listing.listingId],
      value: listing.priceInWei
    }, {
      onSuccess: () => {
        toast.success(t('purchaseSuccessful'))
      },
      onError: (error) => {
        toast.error(t('purchaseFailed') + ': ' + error.message)
      },
      onSettled: () => {
        setLoading(false)
      }
    })
  }

  return (
    <div className="card group">
      <div className="p-4 flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={`/crops/${cropTypes[Number(listing.cropId)]}.png`}
            alt={t(cropTypes[Number(listing.cropId)])}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg capitalize">
            {t(cropTypes[Number(listing.cropId)])}
          </h3>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-secondary-500 text-sm">{t('quantity')}</p>
              <p className="font-medium">{listing.quantityToSell.toString()}</p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">{t('price')}</p>
              <p className="font-medium">
                {formatPrice(listing.priceInWei)} APE
              </p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">{t('seller')}</p>
              <p className="font-medium text-sm truncate">
                {listing.seller.substring(0, 6)}...{listing.seller.substring(38)}
              </p>
            </div>
            <div>
              <p className="text-secondary-500 text-sm">{t('listed')}</p>
              <p className="font-medium text-sm">
                {new Date(Number(listing.listingTimestamp) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-200 p-4">
        <button
          onClick={handlePurchase}
          disabled={loading || listing.seller === address}
          className={`btn w-full ${listing.seller === address
            ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
            : 'btn-primary group-hover:bg-primary-700 transition-colors'
            }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {listing.seller === address ? t('yourListing') : t('purchase')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}