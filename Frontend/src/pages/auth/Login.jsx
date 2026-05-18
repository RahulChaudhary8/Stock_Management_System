import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = async () => {
        localStorage.clear();

        try {
            const res = await api.post(
                "/users/login/",
                form
            );

            console.log(res.data);

            if (res.data.tokens?.access) {
                localStorage.setItem(
                    "access",
                    res.data.tokens.access
                );

                localStorage.setItem(
                    "refresh",
                    res.data.tokens.refresh
                );

                toast.success("Login successful");

                navigate("/dashboard", {
                    replace: true
                });

            } else {
                toast.error("Login failed");
            }

        } catch (error) {
            console.log(error.response?.data);
            localStorage.clear();
            toast.error("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8b7ab0] to-[#7a1fcf] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl bg-[#241d33] rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[650px]">

                    {/* Left Side */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 text-white">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-center md:text-left">
                            Welcome Back
                        </h1>

                        <p className="text-gray-300 mb-8 text-center md:text-left">
                            Don’t have an account?{" "}
                            <Link
                                to="/register"
                                className="underline hover:text-white transition"
                            >
                                Sign up
                            </Link>
                        </p>

                        {/* Username */}
                        <input
                            name="username"
                            type="text"
                            onChange={handleChange}
                            placeholder="Username"
                            className="bg-[#3a3250] p-4 rounded-lg outline-none mb-4 w-full"
                        />

                        {/* Password */}
                        <div className="relative mb-4">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                onChange={handleChange}
                                placeholder="Enter Your Password"
                                className="w-full bg-[#3a3250] p-4 rounded-lg outline-none pr-14"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-6 text-sm sm:text-base">
                            <label className="flex items-center gap-2 text-gray-300">
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <Link
                                to="/forgot-password"
                                className="underline text-gray-300"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="bg-[#7a58d1] py-4 rounded-lg text-lg sm:text-xl font-semibold mb-8 hover:opacity-90 transition"
                        >
                            Login
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center justify-center bg-[#2e2540]">
                        <div className="text-center px-8">
                            <h2 className="text-white text-4xl font-bold mb-4">
                                Login Securely
                            </h2>

                            <p className="text-gray-300 text-lg">
                                Access your dashboard and manage everything in one place.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}