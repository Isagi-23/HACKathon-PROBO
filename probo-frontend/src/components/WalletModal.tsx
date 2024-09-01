import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Wallet,
  PiggyBank,
  ArrowDownToLine,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import useQuery from "@/lib/helperHooks.ts/useQuery";
import { initiatePayoutUser } from "@/services/polls";

interface WalletData {
  totalInWallet: number;
  withdrawalAmount: number;
  totalEarnings: number;
}

export default function WalletModal({
  isOpen,
  onClose,
  walletInfo,
  token,
}: {
  isOpen: boolean;
  onClose: () => void;
  walletInfo: any;
  token: string;
}) {
  console.log(walletInfo);
  const [walletData, setWalletData] = useState<WalletData>(walletInfo);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalComplete, setWithdrawalComplete] = useState(false);
  console.log(walletData);
  const {
    mutate: initiatePayout,
    isLoading,
    error,
  } = useMutate(initiatePayoutUser, {
    onSuccess: (data) => {
      console.log(data);
    },
  });
  const handleWithdraw = async () => {
    await initiatePayout({});
  };
  useEffect(() => {
    setWalletData(walletInfo);
  }, [walletInfo]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Wallet Details</DialogTitle>
          <DialogDescription>
            View your balance and withdraw funds.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {!isWithdrawing && (
              <>
                <Card className="border-blue-500">
                  <CardContent className="pt-4 flex items-center p-2">
                    <Wallet className="h-8 w-8 text-blue-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-blue-700">
                        Total in Wallet
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {walletData.totalInWallet} SOL
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-purple-500 ">
                  <CardContent className="pt-4 flex items-center p-2">
                    <PiggyBank className="h-8 w-8 text-purple-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-purple-700">
                        Total Earnings
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {walletData?.totalEarnings} SOL
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {isWithdrawing && (
              <Card className="border-green-500">
                <CardContent className="pt-4 flex items-center">
                  {withdrawalComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <ArrowDownToLine className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-green-700">
                      {withdrawalComplete
                        ? "Withdrawal Complete"
                        : "Withdrawal Amount"}
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {walletData?.totalInWallet} SOL
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || walletData.totalInWallet === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {withdrawalComplete ? "Completing..." : "Withdrawing..."}
                </>
              ) : (
                "Withdraw SOL"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
