"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePoll from "./CreatePoll";
import AdminAllPolls from "./AdminAllPolls";
import DeclareOutcome from "./DeclareOutcome";
import AdminLogin from "./AdminLogin";

const adminTabs = [
  {
    value: "createPoll",
    label: "Create Poll",
    component: <CreatePoll />,
  },
  {
    value: "allPolls",
    label: "All Polls",
    component: <AdminAllPolls />,
  },
  {
    value: "declareOutcome",
    label: "Declare Outcome",
    component: <DeclareOutcome />,
  },
];

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const token = isClient && localStorage.getItem("token");

  return (
    <div className="container mx-auto p-4">
      {token ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <Tabs defaultValue="allPolls">
            <TabsList className="grid w-full grid-cols-3">
              {adminTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {adminTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <AdminLogin />
      )}
    </div>
  );
}
