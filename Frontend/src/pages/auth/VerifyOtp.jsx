import React, { useState } from "react";

export default function VerifyOtp() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8b7ab0] to-[#7a1fcf] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl bg-[#241d33] rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[650px]">

                    {/* Left Side */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 text-white">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-center md:text-left">
                            Verify OTP
                        </h1>

                        <p className="text-gray-300 mb-8 text-center md:text-left">
                            Enter the 6-digit OTP sent to your email
                        </p>

                        <div className="flex justify-center md:justify-start gap-3 mb-8 flex-wrap">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl bg-[#3a3250] rounded-lg outline-none"
                                />
                            ))}
                        </div>

                        <button className="bg-[#7a58d1] py-4 rounded-lg text-lg sm:text-xl font-semibold mb-6 hover:opacity-90 transition">
                            Verify OTP
                        </button>

                        <p className="text-gray-400 text-center md:text-left mb-4">
                            Didn't receive code?{" "}
                            <span className="underline cursor-pointer">
                                Resend OTP
                            </span>
                        </p>

                        <p className="text-gray-400 text-center md:text-left">
                            Back to{" "}
                            <span className="underline cursor-pointer">
                                Forgot Password
                            </span>
                        </p>
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center justify-center bg-[#2e2540]">
                        <div className="text-center px-8">
                            <h2 className="text-white text-4xl font-bold mb-4">
                                Verify Identity
                            </h2>

                            <p className="text-gray-300 text-lg">
                                Secure verification helps keep your account protected.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}