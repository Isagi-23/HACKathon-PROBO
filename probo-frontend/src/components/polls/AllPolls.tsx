"use client";
import React, { useState } from "react";
import { PollCard } from "@/components/PollCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useQuery from "@/lib/helperHooks.ts/useQuery";
import { fetchAllPolls } from "@/services/polls";

export default function AllPolls() {
  const [allPolls, setAllPolls] = useState([]);
  const { data } = useQuery(fetchAllPolls, {
    onSuccess: (data: any) => {
      const mappedPolls = data?.data?.map((poll: any) => ({
        id: poll.id,
        expiresIn: calculateExpiresIn(poll.expiry),
        icon: poll?.image ?? "",
        title: poll.title,
        subtitle: poll.subtitle,
        trader: poll.totalVotes,
        yesValue: calculateYesValue(poll.options),
        noValue: calculateNoValue(poll.options),
        options: poll.options,
      }));
      setAllPolls(mappedPolls);
    },
  });
  console.log(allPolls);
  const calculateExpiresIn = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.max(
      0,
      Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    );
    let result = "";

    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0 && days > 0) {
      result += `${hours} hour${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0 && (hours > 0 || days > 0)) {
      result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    return result.trim() || "0 minutes"; // Ensure that '0 minutes' is returned if result is empty
  };
  const calculateYesValue = (options: any[]) => {
    const yesOption = options.find((option) => option.title === "Yes");
    return yesOption ? yesOption.prob : 0.5; // Customize calculation as needed
  };

  const calculateNoValue = (options: any[]) => {
    const noOption = options.find((option) => option.title === "No");
    return noOption ? noOption.prob : 0.5; // Customize calculation as needed
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">All events</h1>
      <Tabs defaultValue="trending">
        <TabsList className="mb-2">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="expiring">Expiring soon</TabsTrigger>
        </TabsList>
        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPolls.map((poll: any, index) => (
              <PollCard
                key={poll.id}
                pollId={poll.id}
                expiresIn={poll.expiresIn}
                icon={poll.icon}
                title={poll.title}
                subtitle={poll.subtitle}
                yesValue={poll.yesValue}
                noValue={poll.noValue}
                options={poll.options}
                onReadMore={() =>
                  console.log(`Read more clicked for poll ${index}`)
                }
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="expiring">
          {/* Add content for expiring soon tab */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
