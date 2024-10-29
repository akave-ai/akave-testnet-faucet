"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");

  const addToMetamask = async () => {
    try {
      // @ts-ignore
      if (!window?.ethereum) throw new Error("Please install MetaMask");
      // @ts-ignore
      await window?.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13473", // 78963 in decimal
            chainName: "Akave Fuji",
            nativeCurrency: {
              name: "AKVF",
              symbol: "AKVF",
              decimals: 18,
            },
            rpcUrls: [
              "https://node1-asia.ava.akave.ai/ext/bc/tLqcnkJkZ1DgyLyWmborZK9d7NmMj6YCzCFmf9d9oQEd2fHon/rpc",
            ],
            blockExplorerUrls: ["https://explorer.akave.network"],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const faucet = async (address: string) => {
    const response = await fetch("/api/faucet", {
      method: "POST",
      body: JSON.stringify({ address: address }),
    });
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start ">
        <h1 className="text-4xl font-bold">Akave Faucet</h1>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter address..."
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex flex-row gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => faucet(address)}
            >
              Claim 10 AKVF
            </button>
            <button
              onClick={addToMetamask}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Akave to metamask
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
