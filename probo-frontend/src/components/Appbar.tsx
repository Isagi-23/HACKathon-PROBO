"use client";
import { HandCoins, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import WalletButton from "./WalletButtons";
import { Button } from "./ui/button";
import WalletModal from "./WalletModal";
import { AvatarIcon } from "@radix-ui/react-icons";
import useQuery from "@/lib/helperHooks.ts/useQuery";
import { fetchWalletData, signup } from "@/services/polls";
import { decodeToken } from "@/lib/utils";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import { toast } from "@/hooks/use-toast";

const Appbar = () => {
  const { publicKey, signMessage } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [walletData, setWalletData] = useState({
    totalInWallet: 0,
    withdrawalAmount: 0,
    totalEarnings: 0,
  });

  const { mutate: singup } = useMutate(signup, {
    onSuccess(data) {
      toast({
        title: "Sign Up Successful",
        description: "You have successfully logged in",
        className: "bg-emerald-500",
        duration: 3000,
      });
      localStorage.setItem("token", data?.data?.token);
      setToken(data?.data?.token);
      setWalletData(data?.data);
    },
  });
  console.log(walletData);
  const isAdmin = decodeToken(token);
  console.log(isAdmin);
  const { refetch } = useQuery(fetchWalletData, {
    onSuccess: (data) => {
      const fetchedData = {
        totalInWallet: data?.data.totalWallet,
        withdrawalAmount: data?.data.totalWithrawing,
        totalEarnings: data?.data.totalEarned,
      };
      setWalletData(fetchedData);
    },
    enabled: isAdmin ? false : true,
    showToast: false,
  });

  const handleLogin = async () => {
    if (!publicKey || !signMessage || !window) {
      console.log("first");
      return;
    }
    const message = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_MESSAGE ?? ""
    );
    const signature = await signMessage?.(message);
    const payload = { signature, address: publicKey?.toString() };
    await singup(payload);
  };
  useEffect(() => {
    if (publicKey) {
      handleLogin();
    }
  }, [publicKey]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token") ?? "");
    }
  }, [token]);

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="ml-2 text-2xl font-bold text-primary">OpinionX</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/#features"
        >
          Features
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/#how-it-works"
        >
          How It Works
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/#signup"
        >
          About
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/polls"
        >
          Polls
        </Link>
      </nav>

      <div className="ml-auto flex gap-2">
        {!isAdmin && token && (
          <div className="flex justify-center items-center  ">
            <Button
              onClick={() => {
                refetch();
                setIsWalletModalOpen(true);
              }}
            >
              <HandCoins className="mr-2 h-4 w-4" />
              Open Wallet
            </Button>
            <WalletModal
              refetch={refetch}
              isOpen={isWalletModalOpen}
              onClose={() => setIsWalletModalOpen(false)}
              walletInfo={walletData}
              token={token}
            />
          </div>
        )}
        <WalletButton
          publicKey={publicKey?.toString()}
          setToken={setToken}
          token={token}
        />
      </div>
    </header>
  );
};

export default Appbar;
