import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import EditProfilePage from "./pages/dashboard/Setting/EditProfile";
import ChangePasswordPage from "./pages/auth/ChangePassword";
import NotificationsPage from "./pages/dashboard/Notifications";
import PrivacySettingsPage from "./pages/dashboard/Setting/PrivacySettings";
import AccountSecurityPage from "./pages/dashboard/Setting/AccountSecurity";

// ✅ Inventory Pages
import AddSupplier from "./pages/dashboard/Inventory/AddSupplier";
import AddBrand from "./pages/dashboard/Inventory/AddBrand";
import AddCategory from "./pages/dashboard/Inventory/AddCategory";
import AddProduct from "./pages/dashboard/Inventory/AddProduct";
import ProductList from "./pages/dashboard/Inventory/ProductList";
import CategoryList from "./pages/dashboard/Inventory/CategoryList";
import BrandList from "./pages/dashboard/Inventory/BrandList";
import SupplierList from "./pages/dashboard/Inventory/SupplierList";
import ProductVariantList from "./pages/dashboard/Inventory/ProductVariantList";
import ProductImageList from "./pages/dashboard/Inventory/ProductImageList";
import AddProductVariant from "./pages/dashboard/Inventory/AddProductVariant";
import AddProductImage from "./pages/dashboard/Inventory/AddProductImage";

//Orders Pages
import AllOrders from "./pages/dashboard/Orders/AllOrders";
import PendingOrders from "./pages/dashboard/Orders/PendingOrders";
import CompletedOrders from "./pages/dashboard/Orders/CompletedOrders";

// Customers Pages
import AllCustomers from "./pages/dashboard/Customers/AllCustomers";
import ActiveCustomers from "./pages/dashboard/Customers/ActiveCustomers";
import Reviews from "./pages/dashboard/Customers/Reviews";

// Integrations Pages
import IntegrationConfigPage from "./pages/dashboard/Integrations/IntegrationConfigPage";
import TestConnectionPage from "./pages/dashboard/Integrations/TestConnectionPage";
import ApiLogsPage from "./pages/dashboard/Integrations/ApiLogsPage";

// Stock Management Pages
import StockListPage from "./pages/dashboard/ManageStock/StockListPage";
import StockInPage from "./pages/dashboard/ManageStock/StockInPage";
import StockOutPage from "./pages/dashboard/ManageStock/StockOutPage";
import AddStockPage from "./pages/dashboard/ManageStock/AddStockPage";
import ReceivingFlow from "./pages/warehouse/ReceivingFlow";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("access");
    return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Settings */}
            <Route
                path="/edit-profile"
                element={
                    <ProtectedRoute>
                        <EditProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/change-password"
                element={
                    <ProtectedRoute>
                        <ChangePasswordPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <NotificationsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/privacy-settings"
                element={
                    <ProtectedRoute>
                        <PrivacySettingsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/account-security"
                element={
                    <ProtectedRoute>
                        <AccountSecurityPage />
                    </ProtectedRoute>
                }
            />

            {/* 🟣 INVENTORY ROUTES */}
            <Route
                path="/add-supplier"
                element={
                    <ProtectedRoute>
                        <AddSupplier />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/add-brand"
                element={
                    <ProtectedRoute>
                        <AddBrand />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/add-category"
                element={
                    <ProtectedRoute>
                        <AddCategory />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/add-product"
                element={
                    <ProtectedRoute>
                        <AddProduct />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/products"
                element={
                    <ProtectedRoute>
                        <ProductList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/categories"
                element={
                    <ProtectedRoute>
                        <CategoryList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/brands"
                element={
                    <ProtectedRoute>
                        <BrandList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/suppliers"
                element={
                    <ProtectedRoute>
                        <SupplierList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/product-variants"
                element={
                    <ProtectedRoute>
                        <ProductVariantList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/product-variants/add"
                element={
                    <ProtectedRoute>
                        <AddProductVariant />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/product-images"
                element={
                    <ProtectedRoute>
                        <ProductImageList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/add-product-image"
                element={
                    <ProtectedRoute>
                        <AddProductImage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <AllOrders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders/pending"
                element={
                    <ProtectedRoute>
                        <PendingOrders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders/completed"
                element={
                    <ProtectedRoute>
                        <CompletedOrders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customers"
                element={
                    <ProtectedRoute>
                        <AllCustomers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customers/active"
                element={
                    <ProtectedRoute>
                        <ActiveCustomers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customers/reviews"
                element={
                    <ProtectedRoute>
                        <Reviews />
                    </ProtectedRoute>
                }
            />

            {/* 🔌 INTEGRATIONS */}
            <Route
                path="/integrations/configs"
                element={
                    <ProtectedRoute>
                        <IntegrationConfigPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/integrations/logs"
                element={
                    <ProtectedRoute>
                        <ApiLogsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/integrations/test"
                element={
                    <ProtectedRoute>
                        <TestConnectionPage />
                    </ProtectedRoute>
                }
            />
            {/* 📦 STOCK MANAGEMENT */}
            <Route
                path="/stock"
                element={
                    <ProtectedRoute>
                        <StockListPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/stock/in"
                element={
                    <ProtectedRoute>
                        <StockInPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/stock/receive"
                element={
                    <ProtectedRoute>
                        <ReceivingFlow />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/stock/add"
                element={
                    <ProtectedRoute>
                        <AddStockPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/stock/out"
                element={
                    <ProtectedRoute>
                        <StockOutPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}