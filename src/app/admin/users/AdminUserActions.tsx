"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteUserAction, updateUserRoleAction } from "./actions";

interface AdminUserActionsProps {
  userId: string;
  role: "admin" | "user";
  isCurrentUser: boolean;
}

export function AdminUserActions({
  userId,
  role,
  isCurrentUser,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeRole = (nextRole: string | null) => {
    if (!nextRole || nextRole === role) return;
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, nextRole as "admin" | "user");
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  const deleteUser = () => {
    if (!window.confirm("Delete this user account? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={changeRole} disabled={isPending || isCurrentUser}>
        <SelectTrigger className="w-28" aria-label="Change user role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={deleteUser}
        disabled={isPending || isCurrentUser}
        aria-label="Delete user"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
