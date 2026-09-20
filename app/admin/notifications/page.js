"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { notificationService } from "@/lib/services";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);

        try {
            const response = await notificationService.adminGetAll();

            setNotifications(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const columns = [
        {
            key: "type",
            label: "Type",
            render: (item) => (
                <span className="font-semibold">
                    {item.type || "ORDER STATUS"}
                </span>
            ),
        },
        {
            key: "orderNumber",
            label: "Order",
            render: (item) =>
                item.order?.orderNumber ||
                item.orderNumber ||
                item.orderId ||
                "-",
        },
        {
            key: "email",
            label: "Email",
            render: (item) =>
                item.email || item.user?.email || "-",
        },
        {
            key: "orderStatus",
            label: "Status",
            render: (item) => (
                <StatusBadge status={item.orderStatus} />
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (item) =>
                item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-IN")
                    : "-",
        },
    ];

    return (
        <div>
            <PageHeader
                title="Notifications"
                description="Monitor system and order status notifications."
            />

            <DataTable
                columns={columns}
                data={notifications}
                loading={loading}
                emptyTitle="No notifications found"
            />
        </div>
    );
}