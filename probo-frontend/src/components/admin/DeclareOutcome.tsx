import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Button } from "../ui/button";
import useQuery from "@/lib/helperHooks.ts/useQuery";
import { getPolls, updateBalances, updatePoll } from "@/services/admin";
import { Outcome, Poll } from "./CreatePoll";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PollOption {
  id: number;
  title: string;
}

const DeclareOutcome: React.FC = () => {
  const { toast } = useToast();

  const {
    data,
    isLoading: getPollsLoading,
    refetch,
  } = useQuery(getPolls, {
    onSuccess(data) {
      console.log(data?.data);
      setPolls(data?.data);
    },
  });

  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollOption, setPollOption] = useState<number | null>(null);

  const { mutate: updatepoll, isLoading: updatePollLoading } = useMutate(
    updatePoll,
    {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: data?.data?.message,
          variant: "default",
          className: "bg-emerald-500",
          duration: 1500,
        });
        setPollOption(data?.data?.id);
        initiatedBalanceCalculation({ pollId: data?.data?.id });
        refetch();
      },
    }
  );

  const {
    mutate: initiatedBalanceCalculation,
    isLoading: balanceCalculationLoading,
  } = useMutate(updateBalances, {
    onSuccess(data) {
      toast({
        title: "Success",
        description: data?.data?.message,
        variant: "default",
        className: "bg-emerald-500",
        duration: 1500,
      });
      refetch();
    },
  });

  const handleUpdatePoll = async (id: number, optionId: number) => {
    const payload = {
      pollId: id,
      pollOptionId: optionId,
    };
    await updatepoll(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Declare Outcome</CardTitle>
      </CardHeader>
      <CardContent>
        {getPollsLoading ? (
          <Loader2 className="mx-auto" />
        ) : (
          polls
            .filter(
              (poll) =>
                poll.outcome?.type === "NOT_DECLARED" &&
                new Date(poll.expiry) < new Date()
            )
            .map((poll) => (
              <div key={poll.id} className="mb-4 p-4 border rounded">
                <div className="flex justify-between gap-2">
                  <div>
                    {poll.image && (
                      <img
                        src={poll.image}
                        alt={poll.title}
                        className="mt-2 max-w-full h-auto rounded"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <h3 className="font-bold">{poll.title}</h3>
                    <p>{poll.subtitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Expiry: {format(new Date(poll.expiry), "PPP")}
                    </p>
                  </div>
                  <div className="mt-2">
                    {
                      //@ts-ignore
                      poll.options.map((option: PollOption) => (
                        <Button
                          key={option.id}
                          variant="ghost"
                          className={`mr-2 ${
                            option.title === "Yes"
                              ? "bg-emerald-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                          onClick={() => handleUpdatePoll(poll.id, option.id)}
                        >
                          {option.title}
                          {pollOption === option.id &&
                            balanceCalculationLoading && (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            )}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))
        )}
        {polls &&
          polls.filter(
            (poll) =>
              poll.outcome?.type === "NOT_DECLARED" &&
              new Date(poll.expiry) < new Date()
          ).length === 0 && <p>No polls available for outcome declaration.</p>}
      </CardContent>
    </Card>
  );
};

export default DeclareOutcome;
