"use client";

import { useEffect, useState, useRef } from "react";
import { Search, RefreshCw, Eye, CheckSquare, Square, ChevronDown } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

import { orderService } from "@/lib/services";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED"
];

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: []
};

function CustomStatusDropdown({ order, updatingId, updateStatus }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const currentStatus = order.orderStatus || "PENDING";
    const validNext = VALID_TRANSITIONS[currentStatus] || [];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (validNext.length === 0) {
        return <span className="text-xs font-semibold text-zinc-400">{currentStatus} (Final)</span>;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                disabled={updatingId === order._id}
                className="flex items-center justify-between w-32 px-3 py-2 text-xs font-bold bg-white border border-orange-200 rounded-xl hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
            >
                <span className="truncate">{currentStatus.replace("_", " ")}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute left-0 z-50 w-32 py-1 mt-1 bg-white border border-zinc-100 shadow-xl rounded-xl">
                    {validNext.map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setOpen(false);
                                updateStatus(order._id, status);
                            }}
                            className="w-full px-3 py-2 text-xs font-bold text-left text-zinc-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                            {status.replace("_", " ")}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [bulkStatus, setBulkStatus] = useState("");

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.adminGetAll();
            const data = response?.data;
            setOrders(Array.isArray(data) ? data : data?.orders || []);
            setSelectedOrders([]); // clear selection on reload
        } catch (error) {
            console.error(error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            await orderService.adminUpdateStatus(orderId, status, `Order status changed to ${status}`);
            await loadOrders();
        } catch (error) {
            alert(error?.message || "Failed to update order.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus || selectedOrders.length === 0) return;
        
        const confirmMsg = `Are you sure you want to change the status of ${selectedOrders.length} orders to ${bulkStatus}?`;
        if (!window.confirm(confirmMsg)) return;

        setUpdatingId("bulk");
        try {
            await Promise.all(selectedOrders.map(id => 
                orderService.adminUpdateStatus(id, bulkStatus, `Bulk status changed to ${bulkStatus}`)
            ));
            await loadOrders();
            setBulkStatus("");
        } catch (error) {
            alert("Failed to update some orders. Please check their current valid transitions.");
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o._id));
        }
    };

    const toggleSelectOrder = (id) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredOrders = orders.filter((order) => {
        const value = search.toLowerCase();
        return (
            String(order.orderNumber || "").toLowerCase().includes(value) ||
            String(order.user?.name || "").toLowerCase().includes(value) ||
            String(order.user?.email || "").toLowerCase().includes(value)
        );
    });

    const columns = [
        {
            key: "checkbox",
            label: (
                <button onClick={toggleSelectAll} className="p-1 hover:text-orange-500">
                    {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 
                        ? <CheckSquare className="w-4 h-4 text-orange-500" /> 
                        : <Square className="w-4 h-4" />
                    }
                </button>
            ),
            render: (order) => (
                <button onClick={() => toggleSelectOrder(order._id)} className="p-1 hover:text-orange-500">
                    {selectedOrders.includes(order._id) 
                        ? <CheckSquare className="w-4 h-4 text-orange-500" /> 
                        : <Square className="w-4 h-4 text-zinc-300" />
                    }
                </button>
            )
        },
        {
            key: "orderNumber",
            label: "Order",
            render: (order) => (
                <div>
                    <p className="font-semibold text-zinc-900">{order.orderNumber || order._id}</p>
                    <p className="text-xs text-zinc-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "customer",
            label: "Customer",
            render: (order) => (
                <div>
                    <p className="font-medium">{order.user?.name || "Customer"}</p>
                    <p className="text-xs text-zinc-500">{order.user?.email || "-"}</p>
                </div>
            ),
        },
        {
            key: "totalAmount",
            label: "Amount",
            render: (order) => (
                <span className="font-semibold">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</span>
            ),
        },
        {
            key: "paymentStatus",
            label: "Payment",
            render: (order) => <StatusBadge status={order.paymentStatus} />,
        },
        {
            key: "orderStatus",
            label: "Change Status",
            render: (order) => (
                <CustomStatusDropdown 
                    order={order} 
                    updatingId={updatingId} 
                    updateStatus={updateStatus} 
                />
            ),
        },
        {
            key: "actions",
            label: "",
            render: (order) => (
                <Link
                    href={`/admin/orders/${order._id}`}
                    className="inline-flex items-center justify-center p-2 text-zinc-400 transition bg-zinc-50 rounded-xl hover:bg-orange-50 hover:text-orange-600"
                >
                    <Eye className="w-4 h-4" />
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Orders"
                subtitle="Manage and track customer orders"
                action={
                    <button
                        onClick={loadOrders}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition bg-zinc-900 rounded-xl hover:bg-zinc-800"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                }
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10"
                    />
                </div>
                
                {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-orange-50 border border-orange-200 rounded-xl">
                        <span className="px-2 text-xs font-bold text-orange-800">{selectedOrders.length} selected</span>
                        <select 
                            value={bulkStatus} 
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="text-xs font-bold bg-white border border-orange-200 rounded-lg px-2 py-1 outline-none"
                        >
                            <option value="">Bulk Action...</option>
                            {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleBulkUpdate}
                            disabled={!bulkStatus || updatingId === "bulk"}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-lg disabled:opacity-50 hover:bg-orange-600"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>

            <DataTable
                columns={columns}
                data={filteredOrders}
                loading={loading}
                emptyTitle="No orders found"
            />
        </div>
    );
}