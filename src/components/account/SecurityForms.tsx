"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  LogOut,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  updatePassword,
  logoutAllDevices,
  deleteUserAccount,
} from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SecurityFormsProps {
  isOAuthUser?: boolean;
}

export function SecurityForms({ isOAuthUser = false }: SecurityFormsProps) {
  const router = useRouter();

  // Password update state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Global logout state
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    setPasswordLoading(true);
    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await updatePassword(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleLogoutAll() {
    setLogoutLoading(true);
    try {
      const res = await logoutAllDevices();
      if (res.error) {
        toast.error(res.error);
        setLogoutLoading(false);
      } else {
        toast.success("Logged out from all active devices");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Failed to logout from all devices");
      setLogoutLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation.trim() !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await deleteUserAccount("DELETE");
      if (res.error) {
        toast.error(res.error);
        setDeleteLoading(false);
      } else {
        toast.success("Your collector account has been permanently deleted");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete account");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Password Update Section */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Update Password
            </h2>
            <p className="text-xs text-muted-foreground">
              Ensure your account is using a long, secure password.
            </p>
          </div>
        </div>

        {isOAuthUser ? (
          <div className="mt-4 rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed">
            Your account is authenticated using Google. Password changes and two-factor
            authentication are managed directly through your Google Account settings.
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-medium text-foreground">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
                New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters (letters and numbers)"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-10 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="h-10 rounded-xl text-xs font-medium gap-2 shadow-sm"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </form>
        )}
      </section>

      {/* 2. Global Session Management */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Active Sessions
            </h2>
            <p className="text-xs text-muted-foreground">
              Sign out from all web browsers, phones, and tablets currently logged into your account.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
            If you suspect unauthorized access or used a public terminal, signing out of all devices
            revokes all active authentication tokens immediately.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleLogoutAll}
            disabled={logoutLoading}
            className="h-10 rounded-xl text-xs font-medium gap-2 shrink-0"
          >
            {logoutLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="size-3.5" />
                <span>Log Out All Devices</span>
              </>
            )}
          </Button>
        </div>
      </section>

      {/* 3. Danger Zone / Account Deletion */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-xs text-destructive/80">
              Permanently remove your collector account and credentials.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-xs text-muted-foreground max-w-lg">
            <p>
              Once your account is deleted, your credentials, saved delivery addresses, and personal
              profile will be permanently erased.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Note: Past financial orders remain anonymized for legal and tax compliance.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="h-10 rounded-xl text-xs font-medium gap-2 shrink-0"
          >
            <ShieldAlert className="size-3.5" />
            <span>Delete Account</span>
          </Button>
        </div>
      </section>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              <span>Permanently Delete Account?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. All your saved addresses, collector profile data, and
              account credentials will be completely erased.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="deleteConfirmInput" className="text-xs font-medium text-foreground">
                To confirm, please type <span className="font-mono font-bold text-destructive">DELETE</span> below:
              </Label>
              <Input
                id="deleteConfirmInput"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="h-10 rounded-xl font-mono text-sm uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmation("");
                }}
                disabled={deleteLoading}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmation.trim() !== "DELETE"}
                className="rounded-xl text-xs h-9 font-medium gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <span>Permanently Delete</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
