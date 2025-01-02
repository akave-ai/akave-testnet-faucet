import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

const MetaMaskButton: React.FC = () => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (
      typeof window !== "undefined" &&
      (window as any).ethereum &&
      (window as any).ethereum.isMetaMask
    ) {
      setIsMetaMaskInstalled(true);
    } else {
      setIsMetaMaskInstalled(false);
    }
  }, []);

  const addToMetamask = async () => {
    try {
      // @ts-ignore
      if (!window?.ethereum) throw new Error("Please install MetaMask");

      try {
        // First try to switch to the network if it exists
        // @ts-ignore
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13473" }],
        });
        toast.success("Switched to Akave network!");
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            // @ts-ignore
            await window.ethereum.request({
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

  return (
    <button
      onClick={
        isMetaMaskInstalled
          ? addToMetamask
          : () => window.open("https://metamask.io/download/", "_blank")
      }
      className="flex-grow px-1 py-2 bg-[#B0E4FF] text-black font-medium rounded-md transition-colors"
    >
      <span className="flex flex-row gap-2 justify-center items-center">
        <Image src="/fox.svg" alt="MetaMask" width={20} height={20} />
        <span className="whitespace-nowrap">
          {isMetaMaskInstalled === null
            ? "Checking MetaMask..."
            : isMetaMaskInstalled
              ? "Add Akave to MetaMask"
              : "Install MetaMask to Add Akave"}
        </span>
      </span>
    </button>
  );
};

export default MetaMaskButton;
