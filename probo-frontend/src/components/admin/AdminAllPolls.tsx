import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Button } from "../ui/button";
import useQuery from "@/lib/helperHooks.ts/useQuery";
import { getPolls } from "@/services/admin";
import { Outcome, Poll } from "./CreatePoll";
import { Loader2 } from "lucide-react";

interface PollWithVotes extends Poll {
  totalVotes: number;
  potValue: number;
}
const AdminAllPolls = () => {
  const { data, isLoading } = useQuery(getPolls, {
    onSuccess(data) {
      console.log(data?.data);
      setPolls(data?.data);
    },
  });
  const [polls, setPolls] = useState<PollWithVotes[] | []>([]);

  const handleDeclareOutcome = (id: number, outcome: Outcome) => {
    setPolls(
      polls.map((poll) => (poll.id === id ? { ...poll, outcome } : poll))
    );
    console.log(
      `Initiating balance calculation for poll ${id} with outcome: ${outcome}`
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Polls</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <p>Loading...</p>
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </>
        ) : (
          polls.map((poll) => (
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
                  <p className="text-xl">
                    Total Bets Placed :{" "}
                    <span className="font-bold">{poll.totalVotes}</span>{" "}
                  </p>
                  <p className="text-xl">
                    Pot Value:{" "}
                    <span className="font-bold ">
                      {poll.potValue / 1000_000_000} SOL
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        {polls.length === 0 && (
          <p className="text-center">No polls available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAllPolls;
