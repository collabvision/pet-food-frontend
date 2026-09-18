"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { 
  TrendingUp, TrendingDown, ShoppingCart, IndianRupee, Users, 
  Package, AlertTriangle, RefreshCcw, PlusCircle, LayoutGrid, 
  ListOrdered, FileText, Send, CheckCircle, Archive
} from "lucide-react";
import { orderService } from "@/lib/services";

// Dynamically import recharts to prevent SSR build failures
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });

const mockSalesData = [
  { name: 'Sep 12', revenue: 40000, orders: 24 },
  { name: 'Sep 16', revenue: 30000, orders: 13 },
  { name: 'Sep 20', revenue: 50000, orders: 48 },
  { name: 'Sep 24', revenue: 70000, orders: 59 },
  { name: 'Sep 28', revenue: 60000, orders: 48 },
  { name: 'Oct 02', revenue: 90000, orders: 78 },
  { name: 'Oct 06', revenue: 110000, orders: 90 },
  { name: 'Oct 10', revenue: 172400, orders: 120 },
  { name: 'Oct 12', revenue: 160000, orders: 110 },
];

const mockOrderStatusData = [
  { name: 'Delivered', value: 772, color: '#10B981' },
  { name: 'Shipped', value: 224, color: '#3B82F6' },
  { name: 'Processing', value: 125, color: '#F59E0B' },
  { name: 'Cancelled', value: 75, color: '#EF4444' },
  { name: 'Returned', value: 52, color: '#8B5CF6' },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Attempt to fetch real orders if logged in as admin
    const fetchOrders = async () => {
      try {
        const res = await orderService.adminGetAll();
        if (res && res.success && res.data) {
          setOrders(res.data.slice(0, 5));
        }
      } catch (error) {
        console.warn("Could not fetch real admin orders, falling back to mock data for demo.");
        // Mock data fallback
        setOrders([
          { _id: '1', orderNumber: 'FN123456', user: { name: 'Riya Sharma', image: 'https://i.pravatar.cc/150?u=1' }, items: [{},{},{}], totalAmount: 2857, orderStatus: 'Delivered', createdAt: '2024-10-12T00:00:00Z' },
          { _id: '2', orderNumber: 'FN123455', user: { name: 'Amit Patil', image: 'https://i.pravatar.cc/150?u=2' }, items: [{},{}], totalAmount: 1299, orderStatus: 'Shipped', createdAt: '2024-10-12T00:00:00Z' },
          { _id: '3', orderNumber: 'FN123454', user: { name: 'Neha Kapoor', image: 'https://i.pravatar.cc/150?u=3' }, items: [{}], totalAmount: 699, orderStatus: 'Processing', createdAt: '2024-10-11T00:00:00Z' },
          { _id: '4', orderNumber: 'FN123453', user: { name: 'Karan Mehta', image: 'https://i.pravatar.cc/150?u=4' }, items: [{},{},{},{}], totalAmount: 3499, orderStatus: 'Delivered', createdAt: '2024-10-11T00:00:00Z' },
          { _id: '5', orderNumber: 'FN123452', user: { name: 'Sneha Joshi', image: 'https://i.pravatar.cc/150?u=5' }, items: [{},{}], totalAmount: 1899, orderStatus: 'Cancelled', createdAt: '2024-10-10T00:00:00Z' },
        ]);
      }
    };
    fetchOrders();
  }, []);

  const stats = [
    { label: "Total Orders", value: "1,248", change: "+12%", trend: "up", icon: <ShoppingCart className="w-5 h-5 text-red-500" />, bg: "bg-red-50" },
    { label: "Total Revenue", value: "₹12,48,000", change: "+18%", trend: "up", icon: <IndianRupee className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
    { label: "Total Customers", value: "842", change: "+10%", trend: "up", icon: <Users className="w-5 h-5 text-green-600" />, bg: "bg-green-50" },
    { label: "Total Products", value: "7,236", change: "+5%", trend: "up", icon: <Package className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
    { label: "Pending Prescriptions", value: "12", change: "+33%", trend: "up", subtext: "Need Review", icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50" },
    { label: "Return Requests", value: "8", change: "-20%", trend: "down", icon: <RefreshCcw className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
  ];

  const getStatusColor = (status) => {
    switch(status.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700';
      case 'PROCESSING': return 'bg-orange-100 text-orange-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#FFF4ED] rounded-3xl p-8 relative overflow-hidden flex justify-between items-center shadow-sm border border-[#FFE0D2]">
         <div className="relative z-10">
            <h1 className="text-3xl font-black text-[#1e2338] mb-1">Good Morning, Admin!</h1>
            <p className="text-gray-600 font-medium">Here's what's happening at FurNest today.</p>
         </div>
         
         <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[500px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         
         <div className="hidden md:flex items-center gap-6 relative z-10">
            <div className="flex flex-col items-center">
               <span className="text-lg font-bold text-blue-900 rotate-[-5deg]">"More Wags</span>
               <span className="text-lg font-bold text-blue-900 rotate-[-5deg]">More Smiles</span>
               <span className="text-lg font-bold text-blue-900 rotate-[-5deg]">More Impact"</span>
            </div>
            {/* Happy pets placeholder */}
            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1" alt="Pets" className="h-32 object-contain mix-blend-multiply rounded-full" />
            
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 text-right ml-4">
               <p className="font-bold text-[#1e2338]">Thursday, 12 Oct 2024</p>
               <p className="text-xs text-gray-500 font-medium">Have a productive day!</p>
            </div>
         </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                   {stat.icon}
                </div>
                <span className="text-xs font-semibold text-gray-500 leading-tight">{stat.label}</span>
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <h3 className="text-xl font-black text-[#1e2338]">{stat.value}</h3>
                   {stat.subtext && <p className="text-[10px] text-orange-500 font-bold mt-1">{stat.subtext}</p>}
                </div>
                <div className="flex flex-col items-end">
                   <div className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? (stat.label.includes('Return') ? 'text-red-500' : 'text-green-500') : (stat.label.includes('Return') ? 'text-green-500' : 'text-red-500')}`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {stat.change}
                   </div>
                   <span className="text-[10px] text-gray-400 font-medium mt-0.5">vs last month</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts & Tables) */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Charts Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Overview */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="font-bold text-[#1e2338]">Sales Overview</h3>
                       <p className="text-xs text-gray-500">Revenue and order trends over time</p>
                    </div>
                    <select className="bg-gray-50 border border-gray-200 text-xs font-medium rounded-lg px-2 py-1 outline-none">
                       <option>Last 30 Days</option>
                       <option>Last 7 Days</option>
                    </select>
                 </div>
                 
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockSalesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => `₹${value/1000}k`} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                           itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0F5132" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Revenue (₹)" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Orders" />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Order Status */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-[#1e2338] mb-6">Order Status</h3>
                 <div className="flex items-center justify-center h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockOrderStatusData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {mockOrderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-2xl font-black text-[#1e2338]">1,248</span>
                       <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Orders</span>
                    </div>
                 </div>
                 
                 <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                    {mockOrderStatusData.map(stat => (
                       <div key={stat.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                             <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }}></span>
                             <span className="text-gray-600 font-medium">{stat.name}</span>
                          </div>
                          <div className="font-bold text-[#1e2338]">
                             {Math.round((stat.value / 1248) * 100)}% <span className="text-gray-400 font-normal">({stat.value})</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Tables Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-[#1e2338]">Recent Orders</h3>
                    <button className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                          <tr className="text-xs text-gray-400 border-b border-gray-100">
                             <th className="pb-3 font-semibold">#</th>
                             <th className="pb-3 font-semibold">Customer</th>
                             <th className="pb-3 font-semibold">Items</th>
                             <th className="pb-3 font-semibold">Amount</th>
                             <th className="pb-3 font-semibold">Status</th>
                             <th className="pb-3 font-semibold">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {orders.map((order, i) => (
                             <tr key={order._id || i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 font-medium text-xs text-gray-500">{order.orderNumber}</td>
                                <td className="py-3">
                                   <div className="flex items-center gap-2">
                                      <img src={order.user?.image || `https://i.pravatar.cc/150?u=${i}`} alt="" className="w-6 h-6 rounded-full" />
                                      <span className="font-semibold text-[#1e2338] text-xs">{order.user?.name || 'Guest'}</span>
                                   </div>
                                </td>
                                <td className="py-3 text-xs text-gray-500">{order.items?.length || 1} items</td>
                                <td className="py-3 font-bold text-[#1e2338] text-xs">₹{order.totalAmount}</td>
                                <td className="py-3">
                                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusColor(order.orderStatus || 'Pending')}`}>
                                      {order.orderStatus || 'Pending'}
                                   </span>
                                </td>
                                <td className="py-3">
                                   <button className="text-xs font-bold text-blue-600 hover:text-blue-800">View</button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Low Stock Products */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-[#1e2338]">Low Stock Products</h3>
                    <button className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                          <tr className="text-xs text-gray-400 border-b border-gray-100">
                             <th className="pb-3 font-semibold">Product</th>
                             <th className="pb-3 font-semibold">Stock</th>
                             <th className="pb-3 font-semibold">Status</th>
                             <th className="pb-3 font-semibold">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {[
                             { name: 'Royal Canin Puppy Food', stock: 5, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119' },
                             { name: 'Pedigree Adult Dog Food', stock: 8, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119' },
                             { name: 'Drools Cat Food', stock: 3, status: 'Critical', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119' },
                             { name: 'Vet Life Renal', stock: 6, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119' },
                             { name: 'Me-O Adult Cat Food', stock: 4, status: 'Critical', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119' },
                          ].map((item, i) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                                         <img src={item.img} alt="" className="w-full h-full object-contain" />
                                      </div>
                                      <span className="font-semibold text-[#1e2338] text-xs max-w-[120px] truncate" title={item.name}>{item.name}</span>
                                   </div>
                                </td>
                                <td className={`py-3 font-bold text-xs ${item.stock <= 4 ? 'text-red-500' : 'text-orange-500'}`}>{item.stock}</td>
                                <td className="py-3">
                                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                      {item.status}
                                   </span>
                                </td>
                                <td className="py-3">
                                   <button className="text-xs font-bold text-[#1e2338] hover:text-blue-600">Update</button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column (Side Panels) */}
        <div className="space-y-6">
           
           {/* Ad / Promo */}
           <div className="bg-[#FFF8F8] rounded-3xl p-6 text-center shadow-sm border border-red-50 relative overflow-hidden">
              <h3 className="font-black text-xl text-[#1e2338] italic rotate-[-2deg]">Every order feeds a happier tail!</h3>
              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200" alt="Cat" className="h-24 mx-auto object-contain mt-4 rounded-full border-4 border-white shadow-md" />
           </div>

           {/* Quick Actions */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e2338] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                 {[
                    { label: 'Add Product', icon: <PlusCircle className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' },
                    { label: 'Add Category', icon: <LayoutGrid className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
                    { label: 'View Orders', icon: <ListOrdered className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
                    { label: 'Manage Inventory', icon: <Archive className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
                    { label: 'Review Prescriptions', icon: <FileText className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
                    { label: 'Send Notification', icon: <Send className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
                 ].map((action, i) => (
                    <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group">
                       <div className={`p-2 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                       </div>
                       <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{action.label}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Pending Approvals */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-[#1e2338]">Pending Approvals</h3>
                 <button className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
              </div>
              <div className="space-y-4">
                 {[
                    { title: 'Prescription for Bruno', sub: 'User: Priya Desai', time: '2 hours ago', icon: <FileText className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50', type: 'Review' },
                    { title: 'Prescription for Luna', sub: 'User: Rohit Kumar', time: '5 hours ago', icon: <FileText className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50', type: 'Review' },
                    { title: 'Product Return Request', sub: 'Order: #FN123400', time: '1 day ago', icon: <RefreshCcw className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50', type: 'View' },
                    { title: 'New Seller Integration', sub: 'Partner: PetCare Distributors', time: '1 day ago', icon: <Users className="w-4 h-4 text-green-600" />, bg: 'bg-green-50', type: 'Review' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${item.bg}`}>
                             {item.icon}
                          </div>
                          <div>
                             <h4 className="text-xs font-bold text-[#1e2338] mb-0.5">{item.title}</h4>
                             <p className="text-[10px] text-gray-500">{item.sub}</p>
                             <p className="text-[9px] text-gray-400 mt-1">{item.time}</p>
                          </div>
                       </div>
                       <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type}
                       </button>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
