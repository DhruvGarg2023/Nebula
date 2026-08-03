"use client";

import * as React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreateRoomDialog } from "@/components/dashboard/create-room-dialog";

/**
 * Layout wrapper for all authenticated dashboard routes:
 * - /(dashboard)/dashboard
 * - /(dashboard)/rooms
 * - /(dashboard)/settings/*
 *
 * Ensures authentication via ProtectedRoute and renders the Linear/Vercel
 * styled DashboardShell with global Command Palette (⌘K) and CreateRoomDialog.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [createRoomOpen, setCreateRoomOpen] = React.useState(false);

  return (
    <ProtectedRoute>
      <DashboardShell onCreateRoom={() => setCreateRoomOpen(true)}>
        {children}
      </DashboardShell>
      <CreateRoomDialog
        open={createRoomOpen}
        onOpenChange={setCreateRoomOpen}
      />
    </ProtectedRoute>
  );
}
