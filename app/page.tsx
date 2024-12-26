"use client";
import Image from "next/image";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaExclamationCircle } from 'react-icons/fa';

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  // Validate Ethereum Address
  const validateAddress = (input: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(input);
    setIsValid(isValid);
    return isValid;
  };

  const addToMetamask = async () => {
    try {
      // @ts-ignore
      if (!window?.ethereum) throw new Error("Please install MetaMask");

      try {
        // First try to switch to the network if it exists
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13473' }],
        });
        toast.success("Switched to Akave network!");
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            // @ts-ignore
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
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
                  blockExplorerUrls: ["http://explorer.akave.ai"],
                },
              ],
            });
            toast.success("Akave network added to MetaMask!");
          } catch (addError) {
            throw new Error("Failed to add Akave network.");
          }
        } else {
          throw new Error("Failed to switch to Akave network.");
        }
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add/switch to Akave network.");
      }
    }
  };

  const faucet = async (address: string) => {
    setLoading(true);
    try {
      if (!validateAddress(address)) throw new Error('Invalid Ethereum address! Please enter a valid address starting with "0x".');

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[90vh] p-4 pb-20 gap-8 sm:p-20 sm:gap-16 font-[family-name:var(--font-geist-sans)] overflow-y-hidden">
      <Toaster 
        toastOptions={{
          duration: 3000,
        }}
        containerStyle={{
          top: 20,
        }}
        position="top-right"
      />
      <main className="flex flex-col gap-4 sm:gap-8 row-start-2 items-center w-full max-w-[500px]">
        <Image 
          src="/logo.svg" 
          alt="Akave" 
          width={500} 
          height={100}
          className="w-[280px] sm:w-[500px] h-auto"
          priority
        />
        <div className="flex flex-col gap-4 bg-[#010127] p-4 sm:p-8 rounded-lg w-full">
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
              className={`${isValid || address === '' ? 'focus:ring-blue-500' : 'focus:ring-red-500'} px-4 py-2 border-gray-300 border rounded-md focus:outline-none focus:ring-2 text-black w-full`}
              placeholder="Enter address..."
              onChange={(e) => {
                const input = e.target.value;
                setAddress(input);
                validateAddress(input);
              }}
              required
            />
            {!isValid && address && (
              <div className="flex justify-center text-red-500 mt-2">
                <FaExclamationCircle className="text-2xl mr-2" />
                Invalid Ethereum address! Please enter a valid address starting with "0x".
              </div>
            )}
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-full"
              placeholder="Enter email..."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <button
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors disabled:opacity-50"
              onClick={() => faucet(address)}
              disabled={loading || !isValid}
            >
              {loading ? "Claiming..." : "Claim 10 AKVF"}
            </button>
            <button
              onClick={addToMetamask}
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors"
            >
              <span className="flex flex-row gap-2 justify-center items-center">
                <Image src="/fox.svg" alt="MetaMask" width={20} height={20} />
                <span className="whitespace-nowrap">Add Akave to metamask</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
