import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { TextField, Button, Avatar, IconButton, Switch, FormControlLabel } from '@mui/material';
import { Camera } from 'lucide-react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function EditProfilePage() {
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState("");
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
        darkMode: false,
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    const handleRemoveImage = () => {
        setProfileImage(null);
        setPreview("");
    };

    const token = localStorage.getItem("access");

    // LOAD DATA
    useEffect(() => {
        api.get("/users/edit-profile/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((res) => {
            setForm({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone || "",
                bio: res.data.bio || "",
                darkMode: res.data.darkMode || false,
            });
            setPreview(res.data.profile_image || "");
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDarkMode = () => {
        setForm({ ...form, darkMode: !form.darkMode });
    };

    // SAVE PROFILE
    const handleSave = async () => {
        try {
            const formData = new FormData();

            formData.append("phone", form.phone);
            formData.append("bio", form.bio);
            formData.append("darkMode", form.darkMode);
            formData.append("remove_image", !preview);

            if (profileImage) {
                formData.append("profile_image", profileImage);
            }

            const res = await api.put(
                "/users/edit-profile/",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            toast.success(res.data.message);

        } catch (err) {
            console.log(err.response?.data);
            toast.error("Error updating profile");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center items-center">
            <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 ">
                <IconButton
                    onClick={() => navigate(-1)}
                    className="!bg-white shadow-lg hover:!bg-gray-100 "
                    sx={{
                        width: { xs: 42, sm: 50 },
                        height: { xs: 42, sm: 50 },
                        fontSize: { xs: 24, sm: 30 },
                        color: "#000",
                        fontWeight: "bold"
                    }}
                >
                    <ArrowBackIcon sx={{ fontSize: { xs: 22, sm: 28 } }} />
                </IconButton>
            </div>
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-3">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 flex flex-col items-center justify-center">

                    <div className="relative flex flex-col items-center gap-3">
                        <Avatar
                            src={preview}
                            sx={{ width: 130, height: 130 }}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            id="profile-upload"
                            hidden
                            onChange={handleImageUpload}
                        />

                        <label htmlFor="profile-upload">
                            <IconButton
                                component="span"
                                className="!absolute bottom-10 right-0 !bg-white"
                            >
                                <Camera size={18} className="text-purple-700" />
                            </IconButton>
                        </label>

                        {preview && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={handleRemoveImage}
                            >
                                Remove Photo
                            </Button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{form.name}</h2>
                    <p className="opacity-80">{form.bio}</p>
                </div>

                <div className="md:col-span-2 p-6 sm:p-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Profile</h1>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <TextField label="Full Name" name="name" value={form.name} fullWidth disabled
                            className="mb-4" />

                        <TextField label="Email" name="email" value={form.email} fullWidth disabled
                            className="mb-4" />

                        <TextField
                            label="Phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            fullWidth
                            className="mb-4"
                        />

                        <TextField
                            label="Bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            className="mb-4"
                        />
                    </div>

                    <div className="mt-6">
                        <FormControlLabel
                            control={<Switch checked={form.darkMode} onChange={handleDarkMode} />}
                            label="Enable Dark Mode"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button variant="contained" size="large" onClick={handleSave}>Save Changes</Button>
                        <Button variant="outlined" size="large">Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
