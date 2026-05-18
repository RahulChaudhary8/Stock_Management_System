import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [showOtp, setShowOtp] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [passwords, setPasswords] = useState({
        new_password: "",
        confirm_password: ""
    });

    const handleSendOtp = async () => {
        try {
            const res = await api.post(
                "/users/forgot-password/",
                { email }
            );

            toast.success(res.data.message);
            setShowOtp(true);
        } catch (error) {
            toast.error(error.response?.data?.error);
        }
    };

    const handleVerifyOtp = async () => {
        const finalOtp = otp.join("");

        try {
            const res = await api.post(
                "/users/verify-forgot-otp/",
                {
                    email,
                    otp: finalOtp
                }
            );

            toast.success(res.data.message);
            setShowOtp(false);
            setShowReset(true);

        } catch (err) {
            toast.error(err.response?.data?.error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8b7ab0] to-[#7a1fcf] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl bg-[#241d33] rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[650px]">

                    {/* Left Side */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 text-white">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-center md:text-left">
                            Forgot Password
                        </h1>

                        <p className="text-gray-300 mb-8 text-center md:text-left">
                            Enter your email to receive OTP
                        </p>

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#3a3250] p-4 rounded-lg outline-none mb-6 w-full"
                        />

                        <button onClick={handleSendOtp} className="bg-[#7a58d1] py-4 rounded-lg text-lg sm:text-xl font-semibold mb-8 hover:opacity-90 transition">
                            Send OTP
                        </button>
                        {showOtp && (
                            <div className="mb-6">
                                <p className="text-gray-300 mb-3">Enter OTP</p>

                                <div className="flex gap-2 justify-center md:justify-start">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => {
                                                const newOtp = [...otp];
                                                newOtp[index] = e.target.value;
                                                setOtp(newOtp);
                                            }}
                                            className="w-12 h-12 text-center bg-[#3a3250] rounded text-white"
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    className="mt-4 bg-green-600 py-3 px-6 rounded"
                                >
                                    Verify OTP
                                </button>
                            </div>
                        )}

                        {showReset && (
                            <div className="mt-6">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="p-3 bg-[#3a3250] w-full mb-3"
                                    onChange={(e) =>
                                        setPasswords({ ...passwords, new_password: e.target.value })
                                    }
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="p-3 bg-[#3a3250] w-full mb-3"
                                    onChange={(e) =>
                                        setPasswords({ ...passwords, confirm_password: e.target.value })
                                    }
                                />

                                <button
                                    onClick={async () => {
                                        await api.post(
                                            "/users/reset-password/",
                                            {
                                                email,
                                                otp: otp.join(""),
                                                ...passwords
                                            }
                                        );
                                        toast.success("Password reset successful");
                                        navigate("/login");
                                    }}
                                    className="bg-blue-600 py-3 px-6 rounded"
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}

                        <p className="text-gray-400 text-center md:text-left">
                            Remember password?{" "}
                            <Link
                                to="/login"
                                className="underline cursor-pointer hover:text-white transition"
                            >
                                Login
                            </Link>
                        </p>
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center justify-center bg-[#2e2540]">
                        <div className="text-center px-8">
                            <h2 className="text-white text-4xl font-bold mb-4">
                                Recover Access
                            </h2>

                            <p className="text-gray-300 text-lg">
                                We'll send you a verification OTP to reset your password.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}