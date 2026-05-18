import React, { useState, useEffect, } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import websocketManager from "../../services/websocket";
import { toast } from "react-toastify";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    ChevronDown,
    ChevronUp,
    Plug,
} from "lucide-react";

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access")
    );
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("access");

            const res = await api.get("/users/edit-profile/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    const token = localStorage.getItem("access");

    useEffect(() => {

        if (!token) return;

        api.get("/users/edit-profile/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.log(err);
            });

    }, [token]);

    useEffect(() => {
        const onDashboardMessage = (data) => {
            setLiveMetrics(data);
            setStats([
                {
                    title: 'Total Products',
                    value: data.total_products ?? 0,
                    path: '/products',
                },
                {
                    title: 'Orders',
                    value: data.total_orders ?? 0,
                    path: '/orders',
                },
                {
                    title: 'Customers',
                    value: data.total_customers ?? 0,
                    path: '/customers',
                },
                {
                    title: 'Revenue',
                    value: `₹${data.total_sales ?? 0}`,
                },
            ]);
        };

        websocketManager.connect('dashboard', onDashboardMessage, console.error, { token });
        return () => websocketManager.disconnect('dashboard');
    }, [token]);

    const searchablePages = [
        { name: "Dashboard", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Categories", path: "/categories" },
        { name: "Brands", path: "/brands" },
        { name: "Suppliers", path: "/suppliers" },
        { name: "Product Variants", path: "/product-variants" },
        { name: "Product Images", path: "/product-images" },

        { name: "Stock In", path: "/stock/in" },
        { name: "Stock List", path: "/stock" },
        { name: "Stock Out", path: "/stock/out" },

        { name: "Orders", path: "/orders" },
        { name: "Pending Orders", path: "/orders/pending" },
        { name: "Completed Orders", path: "/orders/completed" },

        { name: "Customers", path: "/customers" },
        { name: "Active Customers", path: "/customers/active" },
        { name: "Reviews", path: "/customers/reviews" },

        { name: "Notifications", path: "/notifications" },

        { name: "Edit Profile", path: "/edit-profile" },
        { name: "Change Password", path: "/change-password" },
        { name: "Privacy Settings", path: "/privacy-settings" },
        { name: "Account Security", path: "/account-security" },

        { name: "Integration Config", path: "/integrations/configs" },
        { name: "API Logs", path: "/integrations/logs" },
        { name: "Test Connections", path: "/integrations/test" },
    ];

    useEffect(() => {

        if (search.trim() === "") {
            setSearchResults([]);
            return;
        }

        const filtered = searchablePages.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );

        setSearchResults(filtered);

    }, [search]);



    const handleLogout = async () => {
        const refresh = localStorage.getItem("refresh");

        if (refresh) {
            try {
                await api.post(
                    "/users/logout/",
                    { refresh }
                );
            } catch (error) {
                console.log(error.response?.data);
                toast.error("Error logging out");
            }
        }

        localStorage.clear();
        navigate("/login", { replace: true });
    };

    // Dropdown states
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [customersOpen, setCustomersOpen] = useState(false);
    const [integrationsOpen, setIntegrationsOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);




    const [stats, setStats] = useState([
        { title: "Total Products", value: 0, path: "/products" },
        { title: "Orders", value: 0, path: "/orders" },
        { title: "Customers", value: 0, path: "/customers" },
        { title: "Revenue", value: 0 },
    ]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            let totalProducts = 0;
            let totalOrders = 0;
            let totalCustomers = 0;
            let totalRevenue = 0;

            // Products
            try {
                const productRes = await api.get(
                    "/products/products/"
                );
                totalProducts = productRes.data.length;
            } catch (err) {
                console.log("Products Error:", err);
                toast.error("Failed to fetch products");
            }

            // Orders
            try {
                const orderRes = await api.get(
                    "/sales/orders/"
                );
                totalOrders = orderRes.data.length;

                totalRevenue = orderRes.data.reduce(
                    (sum, order) => sum + Number(order.total_amount || 0),
                    0
                );
            } catch (err) {
                console.log("Orders Error:", err);
                toast.error("Failed to fetch orders");
            }

            // Customers
            try {
                const customerRes = await api.get(
                    "/sales/customers/"
                );
                totalCustomers = customerRes.data.length;
            } catch (err) {
                console.log("Customers Error:", err);
                toast.error("Failed to fetch customers");
            }

            setStats([
                {
                    title: "Total Products",
                    value: totalProducts,
                    path: "/products"
                },
                {
                    title: "Orders",
                    value: totalOrders,
                    path: "/orders"
                },
                {
                    title: "Customers",
                    value: totalCustomers,
                    path: "/customers"
                },
                {
                    title: "Revenue",
                    value: `₹${totalRevenue}`,
                },
            ]);
        } catch (error) {
            console.log(error);
            toast.error("Error fetching dashboard data");
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 h-screen overflow-y-auto w-72 bg-white shadow-lg z-50 transform transition-transform duration-300
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-purple-700">
                        <Link to="/" className="text-2xl font-bold text-purple-700">
                            StockFlow
                        </Link>
                    </h1>

                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={index}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl mb-3 transition ${index === 0
                                    ? "bg-purple-100 text-purple-700"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </button>
                        );
                    })}



                    {/* Inventory Dropdown */}
                    <button
                        onClick={() => setProductsOpen(!productsOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <Package size={20} />
                            <span>Inventory</span>
                        </div>

                        {productsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {productsOpen && (
                        <div className="ml-8 mt-2 space-y-2">

                            {/* PRODUCT */}
                            <Link to="/products" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Products
                            </Link>

                            {/* CATEGORY */}
                            <Link to="/categories" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Categories
                            </Link>

                            {/* BRAND */}
                            <Link to="/brands" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Brands
                            </Link>

                            {/* SUPPLIER */}
                            <Link to="/suppliers" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Suppliers
                            </Link>

                            {/* VARIANTS */}
                            <Link to="/product-variants" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Product Variants
                            </Link>

                            {/* IMAGES (optional admin view) */}
                            <Link to="/product-images" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Product Images
                            </Link>

                        </div>
                    )}

                    {/* STOCK Dropdown */}
                    <button
                        onClick={() => setStockOpen(!stockOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition">

                        <div className="flex items-center gap-4">
                            <ShoppingCart size={20} />
                            <span>Stock Management</span>
                        </div>
                        {stockOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>


                    {stockOpen && (
                        <div className="ml-8 mt-2 space-y-2">
                            <Link to="/stock/in" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Stock In Page
                            </Link>

                            <Link to="/stock/receive" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Warehouse Receive
                            </Link>

                            <Link to="/stock" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Stock List
                            </Link>

                            <Link to="/stock/out" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Stock Out Page
                            </Link>
                        </div>
                    )}

                    {/* Orders Dropdown */}
                    <button
                        onClick={() => setOrdersOpen(!ordersOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <ShoppingCart size={20} />
                            <span>Orders</span>
                        </div>

                        {ordersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {ordersOpen && (
                        <div className="ml-8 mt-2 space-y-2">
                            <Link to="/orders" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                All Orders
                            </Link>

                            <Link to="/orders/pending" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Pending Orders
                            </Link>

                            <Link to="/orders/completed" className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Completed Orders
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={() => setCustomersOpen(!customersOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <Users size={20} />
                            <span>Customers</span>
                        </div>

                        {customersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {customersOpen && (
                        <div className="ml-8 mt-2 space-y-2">
                            <Link
                                to="/customers"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                All Customers
                            </Link>

                            <Link
                                to="/customers/active"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                Active Customers
                            </Link>

                            <Link
                                to="/customers/reviews"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                Reviews
                            </Link>
                        </div>
                    )}

                    {/* Integrations Dropdown */}
                    <button
                        onClick={() => setIntegrationsOpen(!integrationsOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <Plug size={20} />
                            <span>Integrations</span>
                        </div>

                        {integrationsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {integrationsOpen && (
                        <div className="ml-8 mt-2 space-y-2">
                            <Link
                                to="/integrations/configs"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                Integration Config
                            </Link>

                            <Link
                                to="/integrations/logs"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                API Logs
                            </Link>

                            <Link
                                to="/integrations/test"
                                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                Test Connections
                            </Link>
                        </div>
                    )}


                    <Link
                        to="/notifications"
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <Bell size={20} />
                        <span>Notifications</span>
                    </Link>

                    {/* Settings Dropdown */}
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                    >
                        <div className="flex items-center gap-4">
                            <Settings size={20} />
                            <span>Settings</span>
                        </div>

                        {settingsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {settingsOpen && (
                        <div className="ml-8 mt-2 space-y-2">
                            <Link to="/edit-profile" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Edit Profile
                            </Link>

                            <Link to="/change-password" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Change Password
                            </Link>

                            <Link to="/notifications" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Notifications
                            </Link>

                            <Link to="/privacy-settings" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Privacy Settings
                            </Link>

                            <Link to="/account-security" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600">
                                Account Security
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">

                {/* Top Navbar */}
                <header className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center">

                    <div className="flex items-center gap-4 w-full relative">

                        {/* Mobile Menu */}
                        <button
                            className="lg:hidden p-2 bg-gray-100 rounded-xl"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu
                                size={22}
                                style={{
                                    color: "#000",
                                    fontWeight: "bold"
                                }}
                            />
                        </button>

                        {/* Search */}
                        <div className="flex items-center gap-4 bg-gray-100 px-4 py-3 rounded-xl w-full max-w-md">
                            <Search
                                size={18}
                                color="#000"
                                strokeWidth={2.8}
                            />

                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none w-full"
                            />
                        </div>

                        {/* SEARCH RESULTS */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-16 left-0 w-full bg-white shadow-2xl rounded-2xl overflow-hidden z-50 border">

                                {searchResults.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            navigate(item.path);
                                            setSearch("");
                                            setSearchResults([]);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-purple-50 transition border-b last:border-none"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4 ml-4">
                        <Link to="/notifications" className="p-3 bg-gray-100 rounded-xl">
                            <Bell size={20} style={{
                                color: "#000",
                                fontWeight: "bold"
                            }} />
                        </Link>

                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="px-5 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <Link
                                    to="/login"
                                    className="px-5 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                                    onClick={() => {
                                        localStorage.setItem("isLoggedIn", "true");
                                        setIsLoggedIn(true);
                                    }}
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 sm:p-6">
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Dashboard Overview
                        </h2>
                        <p className="text-gray-500">
                            Welcome back, {user?.user_name || "User"} 👋
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(stat.path)}
                                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition cursor-pointer"
                            >
                                <p className="text-gray-500 mb-2">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-purple-700">
                                    {stat.value}
                                </h3>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Recent Orders */}
                        <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">
                                Recent Orders
                            </h3>

                            <div className="space-y-4">
                                {["#1024", "#1025", "#1026"].map((order, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center border-b pb-4"
                                    >
                                        <p>{order}</p>
                                        <span className="text-green-600 font-medium">
                                            Completed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">
                                Activity
                            </h3>

                            <div className="space-y-4">
                                {[
                                    "New product added",
                                    "Order shipped",
                                    "Inventory updated",
                                ].map((item, i) => (
                                    <p key={i} className="text-gray-700">
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}