'use client'
import Image from 'next/image'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const addToMetamask = async () => {
    try {
      // @ts-ignore
      if (!window?.ethereum) throw new Error('Please install MetaMask')

      try {
        // First try to switch to the network if it exists
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13474' }],
        })
        toast.success('Switched to Akave network!')
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            // @ts-ignore
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13474', // 78964 in decimal
                  chainName: 'Akave Fuji',
                  nativeCurrency: {
                    name: 'AKVT',
                    symbol: 'AKVT',
                    decimals: 18,
                  },
                  rpcUrls: [
                    'https://n1-us.akave.ai/ext/bc/2JMWNmZbYvWcJRPPy1siaDBZaDGTDAaqXoY5UBKh4YrhNFzEce/rpc',
                  ],
                  blockExplorerUrls: ['http://explorer.akave.ai'],
                },
              ],
            })
            toast.success('Akave network added to MetaMask!')
          } catch (addError) {
            throw new Error('Failed to add Akave network.')
          }
        } else {
          throw new Error('Failed to switch to Akave network.')
        }
      }
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to add/switch to Akave network.')
      }
    }
  }

  const faucet = async (address: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        body: JSON.stringify({
          address: address,
          email: email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim AKVT.')
      }

      toast.success('Claim successful!')
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred.')
      } else {
        toast.error('An error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[90vh] grid-rows-[20px_1fr_20px] items-center justify-items-center gap-8 overflow-y-hidden p-4 pb-20 font-[family-name:var(--font-geist-sans)] sm:gap-16 sm:p-20">
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
        containerStyle={{
          top: 20,
        }}
        position="top-right"
      />
      <main className="row-start-2 flex w-full max-w-[500px] flex-col items-center gap-4 sm:gap-8">
        <Image
          src="/logo.svg"
          alt="Akave"
          width={500}
          height={100}
          className="h-auto w-[280px] sm:w-[500px]"
          priority
        />
        <div className="flex w-full flex-col gap-4 rounded-lg bg-[#010127] p-4 sm:p-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-white">
              Wallet Address *
            </label>
            <p className="mb-2 text-sm text-gray-400">
              You can only claim if you have less than 10 AKVT. For bulk requests, please reach out
              to us at{' '}
              <a href="https://t.me/akavebuilders" className="underline hover:text-gray-200">
                Akave Builders
              </a>{' '}
              telegram channel
            </p>
            <input
              id="address"
              type="text"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address..."
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white">
              Email (optional)
            </label>
            <p className="mb-2 text-sm text-gray-400">
              Leave your email ID to receive updates about network developments and announcements
            </p>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email..."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4 flex w-full flex-col gap-4 sm:flex-row">
            <button
              className="flex-grow rounded-md bg-[#B0E4FF] px-4 py-2 font-medium text-black transition-colors disabled:opacity-50"
              onClick={() => faucet(address)}
              disabled={loading}
            >
              {loading ? 'Claiming...' : 'Claim 10 AKVT'}
            </button>
            <button
              onClick={addToMetamask}
              className="flex-grow rounded-md bg-[#B0E4FF] px-4 py-2 font-medium text-black transition-colors"
            >
              <span className="flex flex-row items-center justify-center gap-2">
                <Image src="/fox.svg" alt="MetaMask" width={20} height={20} />
                <span className="whitespace-nowrap">Add Akave to metamask</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
