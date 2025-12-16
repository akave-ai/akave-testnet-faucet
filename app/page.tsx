"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkInfoExpanded, setIsNetworkInfoExpanded] = useState(false);
  const networkSectionRef = useRef<HTMLDivElement>(null);

  const getRpcUrl = () => {
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_AKAVE_RPC_URL;
    if (!rpcUrl) {
      throw new Error(
        "NEXT_PUBLIC_RPC_URL or NEXT_PUBLIC_AKAVE_RPC_URL environment variable is required"
      );
    }
    return rpcUrl;
  };

  const networkInfo = {
    chainId: "21207",
    chainIdHex: "0x52d7",
    chainName: "Akave Community Testnet",
    currency: {
      name: "AKVT",
      symbol: "AKVT",
      decimals: "18",
    },
    rpcUrl: getRpcUrl(),
    explorerUrl: "https://explorer.akave.ai",
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const toggleNetworkInfo = () => {
    const newExpandedState = !isNetworkInfoExpanded;
    setIsNetworkInfoExpanded(newExpandedState);

    // If expanding, scroll to the section after a brief delay for animation
    if (newExpandedState && networkSectionRef.current) {
      setTimeout(() => {
        networkSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100); // Small delay to allow the expand animation to start
    }
  };

  const addToMetamask = async () => {
    try {
      // @ts-ignore
      if (!window?.ethereum) throw new Error("Please install MetaMask");

      // First, ensure MetaMask is connected
      try {
        // @ts-ignore
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (connectError: any) {
        if (connectError.code === 4001) {
          toast.error("Please connect your MetaMask wallet first");
          return;
        }
        console.log("Connect error:", connectError);
        toast.error("Failed to connect to MetaMask");
        return;
      }

      try {
        // Now try to switch to the network
        // @ts-ignore
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x52d7" }],
        });
        toast.success("Switched to Akave network!");
      } catch (switchError: any) {
        console.log("Switch error:", switchError);

        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            // @ts-ignore
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x52d7",
                  chainName: "Akave Community Testnet",
                  nativeCurrency: {
                    name: "AKVT",
                    symbol: "AKVT",
                    decimals: 18,
                  },
                  rpcUrls: [networkInfo.rpcUrl],
                  blockExplorerUrls: ["https://explorer.akave.ai"],
                },
              ],
            });
            toast.success("Akave network added to MetaMask!");
          } catch (addError: any) {
            console.log("Add error:", addError);
            if (addError.code === 4001) {
              toast.error("User rejected the request to add network");
            } else {
              toast.error(
                `Failed to add Akave network: ${
                  addError.message || "Unknown error"
                }`
              );
            }
            return;
          }
        } else if (switchError.code === 4001) {
          // User rejected the request
          toast.error("User rejected the request to switch network");
          return;
        } else if (switchError.code === 4100) {
          // Not authorized - this shouldn't happen now since we connect first, but just in case
          toast.error(
            "MetaMask not authorized. Please connect your wallet first."
          );
          return;
        } else if (switchError.code === -32002) {
          // Request already pending
          toast.error(
            "MetaMask request already pending. Please check MetaMask."
          );
          return;
        } else {
          // Log the actual error for debugging
          console.log(
            "Unexpected switch error code:",
            switchError.code,
            switchError
          );
          toast.error(
            `Failed to switch network: ${
              switchError.message || "Unknown error"
            }`
          );
          return;
        }
      }
    } catch (error) {
      console.error("MetaMask integration error:", error);
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
      const response = await fetch("/api/faucet", {
        method: "POST",
        body: JSON.stringify({
          address: address,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim AKVT.");
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
              You can only claim if you have less than 10 AKVT. For bulk
              requests, please reach out to us at{" "}
              <a
                href="https://t.me/akavebuilders"
                className="underline hover:text-gray-200"
              >
                Akave Builders
              </a>{" "}
              telegram channel
            </p>
            <input
              id="address"
              type="text"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-full"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-full"
              placeholder="Enter email..."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <button
              className="flex-grow px-4 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors disabled:opacity-50"
              onClick={() => faucet(address)}
              disabled={loading}
            >
              {loading ? "Claiming..." : "Claim 10 AKVT"}
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

        {/* Network Information Section */}
        <div
          ref={networkSectionRef}
          className="w-full bg-[#010127] rounded-lg border border-gray-700"
        >
          <button
            onClick={toggleNetworkInfo}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#B0E4FF]/10 rounded-lg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#B0E4FF]"
                >
                  <path
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">
                  Manual Network Setup
                </h3>
                <p className="text-sm text-gray-400">
                  Copy network details if MetaMask integration fails
                </p>
              </div>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className={`text-gray-400 transition-transform duration-200 ${
                isNetworkInfoExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isNetworkInfoExpanded && (
            <div className="px-4 sm:px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="text-sm text-gray-300 mb-4">
                Use these details to manually add the Akave network to your
                wallet:
              </div>

              <div className="grid gap-4">
                {/* Network Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Network Name
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <code className="flex-1 text-sm text-white font-mono break-all">
                      {networkInfo.chainName}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(networkInfo.chainName, "Network Name")
                      }
                      className="p-2 text-gray-400 hover:text-[#B0E4FF] hover:bg-[#B0E4FF]/10 rounded-md transition-colors shrink-0"
                      title="Copy Network Name"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* RPC URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    New RPC URL
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <code className="flex-1 text-sm text-white font-mono break-all">
                      {networkInfo.rpcUrl}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(networkInfo.rpcUrl, "RPC URL")
                      }
                      className="p-2 text-gray-400 hover:text-[#B0E4FF] hover:bg-[#B0E4FF]/10 rounded-md transition-colors shrink-0"
                      title="Copy RPC URL"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chain ID */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Chain ID
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <code className="flex-1 text-sm text-white font-mono">
                      {networkInfo.chainId}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(networkInfo.chainId, "Chain ID")
                      }
                      className="p-2 text-gray-400 hover:text-[#B0E4FF] hover:bg-[#B0E4FF]/10 rounded-md transition-colors shrink-0"
                      title="Copy Chain ID"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Currency Symbol */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Currency Symbol
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <code className="flex-1 text-sm text-white font-mono">
                      {networkInfo.currency.symbol}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          networkInfo.currency.symbol,
                          "Currency Symbol"
                        )
                      }
                      className="p-2 text-gray-400 hover:text-[#B0E4FF] hover:bg-[#B0E4FF]/10 rounded-md transition-colors shrink-0"
                      title="Copy Currency Symbol"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Block Explorer URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Block Explorer URL (Optional)
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                    <code className="flex-1 text-sm text-white font-mono break-all">
                      {networkInfo.explorerUrl}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          networkInfo.explorerUrl,
                          "Block Explorer URL"
                        )
                      }
                      className="p-2 text-gray-400 hover:text-[#B0E4FF] hover:bg-[#B0E4FF]/10 rounded-md transition-colors shrink-0"
                      title="Copy Block Explorer URL"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-blue-400 shrink-0 mt-0.5"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">
                      How to manually add network:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-300">
                      <li>Open your wallet settings</li>
                      <li>Find "Add Network" or "Custom RPC"</li>
                      <li>Copy and paste the details above</li>
                      <li>Save the network configuration</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
