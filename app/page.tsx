"use client";
import Image from "next/image";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast.success("Akave added to MetaMask!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add Akave to MetaMask.");
    }
  };

  const faucet = async (address: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        body: JSON.stringify({
          address: address,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim AKVF.");
      }

      toast.success("Claim successful!");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred.");
      } else {
        toast.error("An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[90vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] overflow-y-hidden">
      <Toaster />
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start ">
        <Image src="/logo.svg" alt="Akave" width={500} height={100} />
        <div className="flex flex-col gap-4 bg-[#010127] p-8 rounded-lg w-[500px]">
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-white">
              Wallet Address *
            </label>
            <p className="text-sm text-gray-400 mb-2">
              You can only claim if you have less than 10 AKVF. For bulk
              requests, please reach out to us at{" "}
              <a
                href="mailto:contact@akave.network"
                className="underline hover:text-gray-200"
              >
                contact@akave.ai
              </a>
            </p>
            <input
              id="address"
              type="text"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter address..."
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white">
              Email (optional)
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Leave your email ID to receive updates about network developments
              and announcements
            </p>
            <input
              id="email"
              type="email"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter email..."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-4 w-full mt-4">
            <button
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors"
              onClick={() => faucet(address)}
              disabled={loading}
            >
              {loading ? "Claiming..." : "Claim 10 AKVF"}
            </button>
            <button
              onClick={addToMetamask}
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors"
            >
              <span className="flex flex-row gap-2 justify-center items-center">
                <Image src="/fox.svg" alt="MetaMask" width={20} height={20} />
                Add Akave to metamask
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
