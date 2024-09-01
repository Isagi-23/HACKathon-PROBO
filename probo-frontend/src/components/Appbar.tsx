"use client";
import { HandCoins, Signature, TrendingUp, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import WalletButton from "./WalletButtons";
import { Button } from "./ui/button";
import WalletModal from "./WalletModal";
import { AvatarIcon } from "@radix-ui/react-icons";

const Appbar = () => {
  const { publicKey, signMessage } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [token, setToken] = useState("");

  async function signAndSend() {
    if (!publicKey || !signMessage || !window) {
      console.log("first");
      return;
    }
    if (localStorage.getItem("token")) return;
    const message = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_MESSAGE ?? ""
    );
    const signature = await signMessage?.(message);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}user/signup`,
      {
        signature,
        address: publicKey?.toString(),
      }
    );

    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token") ?? "");
    }
  }, [localStorage.getItem("token")]);
  console.log(token);

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
          href="#how-it-works"
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
        {token && (
          <div className="flex justify-center items-center  ">
            <Button onClick={() => setIsWalletModalOpen(true)}>
              <HandCoins className="mr-2 h-4 w-4" />
              Open Wallet
            </Button>
            <WalletModal
              isOpen={isWalletModalOpen}
              onClose={() => setIsWalletModalOpen(false)}
            />
          </div>
        )}
        <WalletButton publicKey={publicKey?.toString()} setToken={setToken}/>
      </div>
    </header>
  );
};

export default Appbar;
