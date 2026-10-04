"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserCheck, UserX } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { usersService } from "@/lib/services";

export default function CustomersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await usersService.adminGetAll();
            const data = res?.data?.data?.users || res?.data?.users || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const toggleStatus = async (user) => {
        setUpdatingId(user._id);
        try {
            await usersService.adminUpdate(user._id, {
                isActive: !user.isActive,
            });
            await loadUsers();
        } catch (error) {
            alert(error?.message || "Failed to update user status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleRole = async (user) => {
        setUpdatingId(user._id);
        try {
            await usersService.adminUpdate(user._id, {
                role: user.role === "ADMIN" ? "USER" : "ADMIN",
            });
            await loadUsers();
        } catch (error) {
            alert(error?.message || "Failed to update user role.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const val = search.toLowerCase();
        return (
            (user.name || "").toLowerCase().includes(val) ||
            (user.email || "").toLowerCase().includes(val)
        );
    });

    const columns = [
        {
            key: "customer",
            label: "Customer",
            render: (user) => (
                <div>
                    <p className="font-semibold text-zinc-900">{user.name}</p>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
            ),
        },
        {
            key: "role",
            label: "Role",
            render: (user) => (
                <StatusBadge status={user.role === "ADMIN" ? "ACTIVE" : "PENDING"} label={user.role} />
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (user) => (
                <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} label={user.isActive ? "Active" : "Inactive"} />
            ),
        },
        {
            key: "joined",
            label: "Joined At",
            render: (user) => new Date(user.createdAt).toLocaleDateString(),
        },
        {
            key: "actions",
            label: "Actions",
            render: (user) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleStatus(user)}
                        disabled={updatingId === user._id}
                        className={`rounded-lg p-2 ${
                            user.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        title={user.isActive ? "Deactivate" : "Activate"}
                    >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                        onClick={() => toggleRole(user)}
                        disabled={updatingId === user._id}
                        className="rounded-lg bg-orange-100 p-2 text-orange-700 hover:bg-orange-200 text-xs font-bold"
                        title="Toggle Admin/User"
                    >
                        {user.role === "ADMIN" ? "Make User" : "Make Admin"}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Customers"
                description="Manage users and admins."
                action={
                    <button
                        type="button"
                        onClick={loadUsers}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                }
            />

            <div className="mb-6 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full max-w-sm rounded-xl border border-zinc-200 px-4 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredUsers}
                loading={loading}
                emptyTitle="No customers found"
            />
        </div>
    );
}
