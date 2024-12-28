"use client";
import MetaMaskButton from "@/components/MetaMaskButton";
import Image from "next/image";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaExclamationCircle } from "react-icons/fa";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);

  // Validate Ethereum Address
  const validateAddress = (input: string): boolean => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(input);
    setIsValidAddress(isValid);
    return isValid;
  };

  // Validate Email Address
  const validateEmail = (email: string): boolean => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setIsValidEmail(isValid);
    return isValid;
  };

  const faucet = async (address: string) => {
    setLoading(true);
    try {
      if (!validateAddress(address))
        throw new Error(
          'Invalid Ethereum address! Please enter a valid address starting with "0x".',
        );

      if (email) {
        if (!validateEmail(email))
          throw new Error(
            "Invalid Email address! Please enter a valid Email address.",
          );
      }

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
              className={`${isValidAddress || address === "" ? "focus:ring-blue-500" : "focus:ring-red-500"} px-4 py-2 border-gray-300 border rounded-md focus:outline-none focus:ring-2 text-black w-full`}
              placeholder="Enter address..."
              onChange={(e) => {
                const input = e.target.value;
                setAddress(input);
                validateAddress(input);
              }}
              required
            />
            {!isValidAddress && address && (
              <div className="flex justify-center text-red-500 mt-2">
                <FaExclamationCircle className="text-2xl mr-2" />
                Invalid Ethereum address! Please enter a valid address starting
                with "0x".
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
              className={`${isValidEmail || email === "" ? "focus:ring-blue-500" : "focus:ring-red-500"} px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black w-full`}
              placeholder="Enter email..."
              onChange={(e) => {
                const input = e.target.value;
                setEmail(input);
                validateEmail(input);
              }}
            />
            {!isValidEmail && email && (
              <div className="flex justify-center text-red-500 mt-2">
                <FaExclamationCircle className="text-2xl mr-2" />
                Invalid Email address! Please enter a valid email address.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <button
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors disabled:opacity-50"
              onClick={() => faucet(address)}
              disabled={loading || !isValidAddress}
            >
              {loading ? "Claiming..." : "Claim 10 AKVF"}
            </button>
            <MetaMaskButton />
          </div>
        </div>
      </main>
    </div>
  );
}
