"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Network, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api/admin";
import type { SiteConfig } from "@/types";

export default function NetworksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNetwork, setNewNetwork] = useState("");
  const [networks, setNetworks] = useState<string[]>([]);

  const { data: configData, isLoading } = useQuery({
    queryKey: ["admin-config"],
    queryFn: adminApi.getConfig,
  });

  useEffect(() => {
    setNetworks(configData?.data?.networks || []);
  }, [configData]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: Partial<SiteConfig>) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      toast({ title: "Networks saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save networks", variant: "destructive" });
    },
  });

  const handleAddNetwork = () => {
    const trimmed = newNetwork.trim();
    if (!trimmed) return;
    if (networks.some((network) => network.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Network already exists", variant: "destructive" });
      return;
    }
    setNetworks((current) => [...current, trimmed]);
    setNewNetwork("");
  };

  const handleUpdateNetwork = (index: number, value: string) => {
    setNetworks((current) => current.map((network, networkIndex) => (
      networkIndex === index ? value : network
    )));
  };

  const handleRemoveNetwork = (index: number) => {
    setNetworks((current) => current.filter((_, networkIndex) => networkIndex !== index));
  };

  const handleSaveNetworks = () => {
    updateConfigMutation.mutate({ networks });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-sans font-bold text-black uppercase tracking-tight">Networks</h1>
        <p className="text-muted-foreground mt-1">
          Manage the ministry networks available across registration and course settings.
        </p>
      </div>

      <Card className="rounded-xl border-gray-200 bg-white shadow-sm">
        <CardHeader className="bg-muted/5 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 font-sans font-bold text-black uppercase tracking-wide">
            <Network className="h-4 w-4" />
            Network Management
          </CardTitle>
          <CardDescription>
            Add, rename, or remove networks. Changes here are used by registration and admin course forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newNetwork}
              onChange={(e) => setNewNetwork(e.target.value)}
              placeholder="Add a new network"
              className="rounded-xl border-gray-200 bg-white shadow-sm"
            />
            <Button onClick={handleAddNetwork} className="rounded-lg sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Network
            </Button>
          </div>

          <div className="space-y-3">
            {networks.length > 0 ? (
              networks.map((network, index) => (
                <div key={`${network}-${index}`} className="flex items-center gap-3">
                  <Input
                    value={network}
                    onChange={(e) => handleUpdateNetwork(index, e.target.value)}
                    className="rounded-xl border-gray-200 bg-white shadow-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveNetwork(index)}
                    className="rounded-xl border-gray-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No networks configured yet.</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveNetworks}
              disabled={updateConfigMutation.isPending}
              className="rounded-lg"
            >
              {updateConfigMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
