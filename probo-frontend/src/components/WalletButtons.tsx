import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import React from "react";

export default function WalletButton({
  publicKey,
  setToken,
}: {
  publicKey: string | null | undefined;
  setToken: any;
}) {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: "black",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    backgroundImage: "linear-gradient(to bottom, #3a3a3a, #000000)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 5px 10px rgba(0, 0, 0, 0.3)",
    textShadow: "0 -1px 1px rgba(0, 0, 0, 0.3)",
  };
  return (
    <>
      {publicKey ? (
        <WalletDisconnectButton
          onClick={() => {
            window.localStorage.removeItem("token");
            setToken("");
          }}
        />
      ) : (
        <div id="walletConnectorMe">
          <WalletMultiButton
            style={buttonStyle}
            endIcon={<Wallet className="h-6 w-6 text-slate-100" />}
          />
        </div>
      )}
    </>
  );
}
