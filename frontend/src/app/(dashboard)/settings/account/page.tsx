"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { usersApi } from "@/services/api/users";
import { ROUTES } from "@/lib/constants";

/**
 * Account Settings Page (/(dashboard)/settings/account)
 * Provides account danger zone (soft-delete account, logout all sessions).
 */
export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your CodeSync account? Your workspaces and files will be archived."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await usersApi.deleteMe();
      toast.success("Account deleted successfully");
      await logout();
      router.push(ROUTES.HOME);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  return (
    <div className="space-y-8 rounded-xl border border-[hsl(var(--destructive))/0.3] bg-[hsl(var(--card))] p-6 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-[hsl(var(--destructive))] flex items-center gap-2">
          <ShieldAlert className="size-5" />
          <span>Danger Zone</span>
        </h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Irreversible and destructive actions for your CodeSync user account.
        </p>
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Sign Out of Session
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Revoke your current refresh token and clear authentication cookies.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs font-semibold"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Delete Account
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Soft-delete your account and remove membership from collaborative rooms.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="gap-1.5 text-xs font-semibold"
          >
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Account"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
