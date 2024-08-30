"use client";
import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

const Wallet = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  const buttonStyle = {
    color: "white",
    background: "linear-gradient(to right, #6b46c1, #6b46c1, #4c2c8b)",
    boxShadow: "0 4px 6px rgba(128, 90, 213, 0.5)",
    fontWeight: 500,
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    padding: "0.625rem 1.25rem",
    textAlign: "center",
    marginRight: "0.5rem",
    marginBottom: "0.5rem",
    transition: "background 0.2s, box-shadow 0.2s",
  };

  const buttonHoverStyle = {
    background: "linear-gradient(to bottom right, #6b46c1, #4c2c8b)",
    boxShadow: "0 8px 12px rgba(128, 90, 213, 0.7)",
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
export default Wallet;
