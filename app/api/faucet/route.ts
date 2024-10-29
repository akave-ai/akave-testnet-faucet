import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { NextResponse } from 'next/server'

const akaveChain = {
  id: 78963,
  name: 'Akave Fuji',
  network: 'akave',
  nativeCurrency: {
    name: 'AKVF',
    symbol: 'AKVF',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://node1-eu.ava.akave.ai/ext/bc/tLqcnkJkZ1DgyLyWmborZK9d7NmMj6YCzCFmf9d9oQEd2fHon/rpc']
    },
    public: {
      http: ['https://node1-eu.ava.akave.ai/ext/bc/tLqcnkJkZ1DgyLyWmborZK9d7NmMj6YCzCFmf9d9oQEd2fHon/rpc']
    }
  }
}

const publicClient = createPublicClient({
  chain: akaveChain,
  transport: http()
})

export async function POST(request: Request) {
  try {
    const { address } = await request.json()
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Check user's balance
    const balance = await publicClient.getBalance({ address })
    
    if (balance >= parseEther('10')) {
      return NextResponse.json(
        { error: 'Address already has more than 10 AKVF' },
        { status: 400 }
      )
    }

    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      chain: akaveChain,
      transport: http()
    })

    // Send transaction
    const hash = await walletClient.sendTransaction({
      to: address,
      value: parseEther('10')
    })

    return NextResponse.json({ hash })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
