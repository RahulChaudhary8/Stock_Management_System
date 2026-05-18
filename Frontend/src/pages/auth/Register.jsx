import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "staff"
    });

    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async () => {
        try {
            await api.post(
                "/users/send-register-otp/",
                form,
                { withCredentials: true }
            );

            toast.success("OTP sent to your email");
            setShowOtpInput(true);

        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            await api.post(
                "/users/verify-register-otp/",
                { otp },
                { withCredentials: true }

            );

            toast.success("Registration successful");
            navigate("/login");

        } catch (error) {
            console.log(error.response?.data);
            toast.error(JSON.stringify(error.response?.data));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8b7ab0] to-[#7a1fcf] flex items-center justify-center">
            <div className="w-full max-w-5xl bg-[#241d33] rounded-2xl shadow-2xl overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[700px]">

                    {/* Left side */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 text-white">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
                            Create an account
                        </h1>

                        <p className="text-gray-300 mb-8">
                            Already have an account?{" "}
                            <Link to="/login" className="underline">
                                Log in
                            </Link>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input
                                name="first_name"
                                onChange={handleChange}
                                placeholder="First Name"
                                className="bg-[#3a3250] p-4 rounded-lg outline-none w-full"
                            />

                            <input
                                name="last_name"
                                onChange={handleChange}
                                placeholder="Last Name"
                                className="bg-[#3a3250] p-4 rounded-lg outline-none w-full"
                            />
                        </div>

                        {/* Username */}
                        <input
                            name="username"
                            onChange={handleChange}
                            placeholder="Username"
                            className="bg-[#3a3250] p-4 rounded-lg outline-none mb-4 w-full"
                        />

                        {/* Email */}
                        <input
                            name="email"
                            onChange={handleChange}
                            placeholder="Email"
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
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <select
                            name="role"
                            onChange={handleChange}
                            className="bg-[#3a3250] p-4 rounded-lg outline-none mb-4 w-full"
                        >
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                        </select>

                        {showOtpInput && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-[#3a3250] p-4 rounded-lg outline-none mb-4 w-full"
                                />

                                <button
                                    onClick={handleVerifyOtp}
                                    className="bg-green-600 py-4 rounded-lg text-lg font-semibold mb-4 hover:opacity-90 transition w-full"
                                >
                                    Verify OTP
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleRegister}
                            className="bg-[#7a58d1] py-4 rounded-lg text-lg font-semibold mb-8 hover:opacity-90 transition"
                        >
                            {showOtpInput ? "OTP Sent" : "Create Account"}
                        </button>
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center justify-center bg-[#2e2540]">
                        <div className="text-center px-8">
                            <h2 className="text-white text-4xl font-bold mb-4">
                                Welcome
                            </h2>
                            <p className="text-gray-300 text-lg">
                                Join us and manage everything easily.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}