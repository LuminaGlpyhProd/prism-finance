"use client";

import { Download } from "lucide-react";
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { Button } from "@/components/ui/Button";

export function UpdateBanner() {
  const { updateUrl, version } = useAutoUpdate();

  if (!updateUrl || !version) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-50 glass-strong rounded-2xl p-4 shadow-glow border border-cyan-500/30">
      <p className="text-sm font-medium text-cyan-200">Update available</p>
      <p className="text-xs text-white/50 mt-1 mb-3">
        Version {version} is ready. Install to get the latest sync and fixes.
      </p>
      <Button
        size="sm"
        className="w-full"
        onClick={() => window.open(updateUrl, "_blank")}
      >
        <Download size={14} className="mr-2 inline" />
        Download update
      </Button>
    </div>
  );
}
