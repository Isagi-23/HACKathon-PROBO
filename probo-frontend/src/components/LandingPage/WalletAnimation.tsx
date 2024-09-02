"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Lottie from "lottie-react";
import animation from "@public/wallet/walletLoading1.json";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/utils";

const WalletAnimation = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState("");
  const playAnimation = async () => {
    setShowAnimation(true);
    //add delay for animation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowAnimation(false);
  };
  const handleClick = async () => {
    const wallet = document.getElementById("walletConnectorMe");
    await playAnimation();
    const button = wallet?.querySelector("button");
    button && button.click();
  };
  const handleRedirect = async () => {
    await playAnimation();
    router.push("/polls");
  };
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token") ?? "");
    }
  }, [localStorage.getItem("token")]);

  const handleAdminLogin = () => {
    if (!isAdmin && token) {
    } else router.push("/admin");
  };
  const isAdmin = decodeToken(token);
  return (
    <>
      <div className="space-x-4 relative">
        <Button
          onClick={!isAdmin && token ? handleRedirect : handleClick}
          disabled={isAdmin as boolean}
        >
          Get Started
        </Button>
        <Button variant="outline" onClick={handleAdminLogin}>
          {!isAdmin && token ? "Learn More" : "ADMIN LOGIN"}
        </Button>
      </div>
      <div className="absolute bottom-48">
        {showAnimation && <Lottie animationData={animation} loop={true} />}
      </div>
    </>
  );
};

export default WalletAnimation;
