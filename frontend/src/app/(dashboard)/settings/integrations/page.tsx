"use client";

import * as React from "react";
import { toast } from "sonner";
import { GitBranch, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/services/api/auth";

/**
 * Integrations Settings Page (/(dashboard)/settings/integrations)
 * Connects/disconnects external providers like GitHub OAuth.
 */
export default function IntegrationsSettingsPage() {
  const handleConnectGitHub = () => {
    toast.info("Redirecting to GitHub OAuth...");
    window.location.href = authApi.getGithubAuthUrl();
  };

  return (
    <div className="space-y-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
          Connected Integrations
        </h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Link external developer platforms to import repositories and sync pull requests.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--gray-2))/0.3] p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-sm">
            <GitBranch className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                GitHub Repository Import
              </span>
              <Badge variant="outline" className="text-[10px]">
                OAUTH 2.0
              </Badge>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Clone GitHub repos directly into multi-language CRDT workspaces.
            </p>
          </div>
        </div>

        <Button
          onClick={handleConnectGitHub}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold"
        >
          <span>Connect GitHub</span>
          <ExternalLink className="size-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] pt-2">
        <ShieldCheck className="size-4 text-[hsl(var(--success))]" />
        <span>We only request read-only repository access during import.</span>
      </div>
    </div>
  );
}
