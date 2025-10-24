"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserData } from "@/hooks/use-user-data";
import { LoaderCircle, Workflow, GaugeCircle, Globe } from "lucide-react";

export function UserMetricsCards() {
  const { user: userData, isLoading } = useUserData();
  const workflows = userData?.usage?.workflowCount ?? userData?.stats?.totalWorkflows ?? 0;
  const executions = userData?.usage?.executionsThisMonth ?? 0;
  const apiCalls = userData?.usage?.apiCallsThisMonth ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0,1,2].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Workflows</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-3xl font-bold">{workflows}</div>
          <Workflow className="h-6 w-6 text-primary" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Executions (month)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-3xl font-bold">{executions}</div>
          <GaugeCircle className="h-6 w-6 text-primary" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">API Calls (month)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-3xl font-bold">{apiCalls}</div>
          <Globe className="h-6 w-6 text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

