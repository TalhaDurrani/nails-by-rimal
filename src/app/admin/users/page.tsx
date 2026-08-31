import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Mail,
  Shield,
  UserCheck,
} from "lucide-react";

import { format } from "date-fns";
import { AdminUsersClient } from "./AdminUsersClient";
import { getCurrentUser } from "@/services/auth/authServerService";
import {
  adminUserServerService,
  UserFilters,
} from "@/services/admin/adminUserServerService";
import { AdminUserActions } from "./AdminUserActions";

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper to safely extract a single string value from query param
const getParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  // Await the async props
  const resolvedSearchParams = await searchParams;

  // Server-side auth check
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/getAccessToAdminScreen");
  }

  // Parse search params safely on server
  const filters: UserFilters = {
    searchTerm: getParam(resolvedSearchParams.search),
    role: getParam(resolvedSearchParams.role) as "admin" | "user" | undefined,
    dateFrom: getParam(resolvedSearchParams.dateFrom),
  };

  const currentPage = parseInt(getParam(resolvedSearchParams.page) || "1", 10);


  // Fetch data on server side (already sanitized)
  const { users: sanitizedUsers, total } =
    await adminUserServerService.getAllUsers(filters, currentPage, pageLimit);

  const totalPages = Math.ceil(total / pageLimit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{total}</span> total users
          </span>
        </div>
      </div>

      {/* Server-rendered search/filter form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <AdminUsersClient
          currentFilters={filters}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>

      {/* Server-rendered users list with sanitized data */}
      <div className="space-y-4">
        {sanitizedUsers.length > 0 ? (
          sanitizedUsers.map((user) => (
            <div key={user.profile_id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D89AA0]/20 to-[#B48A4E]/20">
                    <User className="h-6 w-6 text-[#BE7681]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">
                      {user.username}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-gray-500 sm:gap-2">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {user.order_count_range}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {user.spending_tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={user.role === "admin" ? "bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white border-none" : "bg-gray-100 text-gray-700 border-gray-200"}>
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </Badge>
                    {user.is_active && (
                      <Badge
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <AdminUserActions
                    userId={user.profile_id}
                    role={user.role as "admin" | "user"}
                    isCurrentUser={currentUser.profile_id === user.profile_id}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-sm text-gray-500">
              No users match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pageLimit + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min(currentPage * pageLimit, total)}</span> of <span className="font-semibold text-gray-900">{total}</span> users
            </span>
            {/* Pagination controls handled by client component */}
          </div>
        </div>
      )}
    </div>
  );
}

const pageLimit = 20;
