import React, { useState } from "react";
import api from "../../api/axios";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ChangePassword() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleChangePassword = async () => {
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const token = localStorage.getItem("access");
            const refresh = localStorage.getItem("refresh");

            const res = await api.post(
                "/users/change-password/",
                {
                    old_password: form.oldPassword,
                    new_password: form.newPassword,
                    confirm_password: form.confirmPassword,
                    refresh: refresh,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            toast.success(res.data.message);

            setTimeout(() => {
                localStorage.clear();
                navigate("/login", { replace: true });
            }, 1000);
            
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#8b7ab0] to-[#7a1fcf] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl bg-[#241d33] rounded-2xl shadow-2xl overflow-hidden">

                <div className="flex flex-col justify-center p-6 text-white">

                    <h1 className="text-3xl font-bold mb-6">
                        Change Password
                    </h1>

                    <input
                        name="oldPassword"
                        placeholder="Old Password"
                        onChange={handleChange}
                        className="bg-[#3a3250] p-4 rounded-lg mb-4 w-full"
                    />

                    <div className="relative mb-4">
                        <input
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            onChange={handleChange}
                            className="w-full bg-[#3a3250] p-4 rounded-lg pr-14"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>

                    <input
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        className="bg-[#3a3250] p-4 rounded-lg mb-6 w-full"
                    />

                    <button
                        onClick={handleChangePassword}
                        className="bg-[#7a58d1] py-4 rounded-lg font-semibold"
                    >
                        Change Password
                    </button>

                    <p className="mt-4 text-gray-300">
                        Back to <Link to="/login" className="underline">Login</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}