"use client";

import React, { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartColumnStacked,
  Clock,
  CoinsIcon,
  HandCoins,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import { vote } from "@/services/polls";
import { useToast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { TooltipContent } from "./ui/tooltip";

interface PollCardProps {
  expiresIn: string;
  icon: string;
  title: string;
  subtitle: string;
  options: any[];
  onReadMore: () => void;
  pollId: number;
  voteAllowed: boolean;
  trader: number;
  pot: number;
  refetch: any;
}

export const PollCard: React.FC<PollCardProps> = ({
  expiresIn,
  icon,
  title,
  subtitle,
  onReadMore,
  options,
  pollId,
  voteAllowed,
  trader,
  pot,
  refetch,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tnxSignature, setTnxSignature] = useState<string>("");
  const { mutate: submitBet, isLoading } = useMutate(vote, {
    onSuccess: (data: any) => {
      toast({
        title: data?.data?.message,
        variant: "default",
        className: "bg-emerald-500",
        duration: 3000,
      });
      setSelectedOption(null);
      setAmount("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: error.response.data.message,
        variant: "default",
        className: "bg-red-500",
        duration: 3000,
      });
      setSelectedOption(null);
      setAmount("");
    },
  });

  const makePayment = useCallback(
    async (amount: number) => {
      console.log(amount)
      if (!publicKey || !sendTransaction || !connection) return;
      const lamports = await connection.getMinimumBalanceForRentExemption(0);
      const lamp = amount < lamports ? lamports : amount;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_ADMIN_WALLET!),
          lamports: amount,
        })
      );
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      transaction.feePayer = publicKey!;
      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
      const result = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      setTnxSignature(signature);
      return signature;
    },
    [connection, publicKey, sendTransaction]
  );

  const handleVoteSubmit = async () => {
    if (localStorage.getItem("token") === null) {
      toast({
        title: "Not logged in",
        variant: "default",
        className: "bg-red-500",
        duration: 3000,
      });
    }
    if (!voteAllowed) {
      toast({
        title: "Already voted",
        variant: "default",
        className: "bg-indigo-500",
        duration: 3000,
      });
      return;
    }
    if (selectedOption === null || amount === "") return;
    const payload = {
      optionId: selectedOption,
      pollId,
      amount: (parseFloat(amount)) * 1000_000_000,
    };

    const tnxSignature = await makePayment(payload.amount);
    console.log(tnxSignature, "returned");
    tnxSignature && (await submitBet({ ...payload, signature: tnxSignature }));
  };
  console.log(expiresIn.split(" ")?.[0]);
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between text-sm text-muted-foreground">
        <div className="flex flex-row items-center space-x-2">
          <Clock size={16} color="black" />
          <span>Expires in {expiresIn}</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center space-x-2 mt-0">
            <ChartColumnStacked color="#b1bb25" size={18} />
            <span>{trader} trader</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="flex-shrink-0">
              <img
                src={icon}
                alt="Poll Icon"
                className="rounded-full w-16 h-16"
              />
            </div>
          )}
          <div className="flex flex-col text-wrap overflow-hidden">
            <h3 className="font-semibold"> {title}</h3>
            <p className="text-sm text-muted-foreground text-wrap">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info size={16} className="cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p>This is general info regarding indicator YES AND NO </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="link"
            className="p-0 h-auto text-sm text-gray-400"
            onClick={onReadMore}
          >
            Read more
          </Button>
          <div className="flex flex-row items-center space-x-2 mt-0 ml-auto">
            <CoinsIcon color="#b1bb25" size={18} />
            <span>POT: {pot / 1000_000_000} Sol </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          {options.map((option) => (
            <ProbabilityBar
              key={option.id}
              label={option.title}
              probability={option.prob}
              id={option.id}
              color={option.title === "Yes" ? "green" : "red"}
              isSelected={selectedOption === option.id}
              onClick={() => setSelectedOption(option.id)}
            />
          ))}
        </div>
        {selectedOption !== null && (
          <div className="flex items-center space-x-2 w-full">
            <div className="relative flex-grow">
              <Input
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-800">
                Sol
              </span>
            </div>
            <Button
              onClick={() => handleVoteSubmit()}
              disabled={amount === "" || expiresIn.split(" ")?.[0] === "0"}
            >
              {isLoading && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Bet
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

interface ProbabilityBarProps {
  label: string;
  probability: string;
  color: "green" | "red";
  id: number;
  isSelected: boolean;
  onClick: () => void;
}

const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  label,
  probability,
  color,
  id,
  isSelected,
  onClick,
}) => {
  const percentage = Math.round(Number(probability) * 100);
  const bgColor = color === "green" ? "bg-emerald-500" : "bg-red-500";
  const textColor = color === "green" ? "text-green-700" : "text-red-700";
  const borderColor = isSelected
    ? color === "green"
      ? "border-emerald-500"
      : "border-red-500"
    : "border-transparent";

  return (
    <div
      className={`relative w-full h-10 bg-gray-200 rounded-md overflow-hidden cursor-pointer border-2 ${borderColor}`}
      onClick={onClick}
    >
      <div
        className={`absolute top-0 left-0 h-full ${bgColor} transition-all duration-1000 ease-in-out`}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-3">
        <span className={`font-semibold ${textColor} z-10`}>{label}</span>
        <span className={`font-semibold ${textColor} z-10`}>{percentage}%</span>
      </div>
    </div>
  );
};
