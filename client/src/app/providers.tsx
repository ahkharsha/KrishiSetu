// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '../utils/contract'
import { ConnectKitProvider } from 'connectkit'
import { curtis } from 'wagmi/chains'
import { useAccount, useSwitchChain } from 'wagmi'
import { useModal } from 'connectkit'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CookiesProvider } from 'react-cookie'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5, // 5 seconds
    },
  },
})

function ChainValidator({ children }: { children: React.ReactNode }) {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { setOpen } = useModal()
  
  useEffect(() => {
    if (chain && chain.id !== curtis.id) {
      toast.error('Please switch to Curtis Testnet (Chain ID 33111)')
      const shouldSwitch = confirm('Please switch to Curtis Testnet (Chain ID 33111)')
      if (shouldSwitch) {
        switchChain({ chainId: curtis.id })
      }
      setOpen(true)
    }
  }, [chain, switchChain, setOpen])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          options={{
            initialChainId: curtis.id,
          }}
        >
          <CookiesProvider>
            <ChainValidator>
              {children}
            </ChainValidator>
          </CookiesProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}