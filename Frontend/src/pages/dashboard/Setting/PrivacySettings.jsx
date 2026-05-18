import React, { useState } from "react";
import { Switch, Button, Card, CardContent, Typography, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function PrivacyPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        profileVisibility: true,
        activityStatus: false,
        dataCollection: true,
        searchEngineIndexing: false,
    });

    const handleToggle = (field) => {
        setSettings((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleUpdate = () => {
        toast.success("Privacy settings updated 🔐");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 flex items-center justify-center">

            <Card className="w-full max-w-5xl rounded-3xl shadow-2xl">
                <CardContent className="p-6 sm:p-10">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <IconButton
                                onClick={() => navigate(-1)}
                                className="!bg-gray-100 hover:!bg-gray-200"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" className="!font-bold">
                                Privacy & Security
                            </Typography>
                        </div>
                        <Typography className="text-gray-500 mt-1">
                            Control how your data is used and visible
                        </Typography>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Profile Visibility */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="font-semibold">Profile Visibility</p>
                                <p className="text-sm text-gray-500">
                                    Make your profile visible to others
                                </p>
                            </div>

                            <Switch
                                checked={settings.profileVisibility}
                                onChange={() => handleToggle("profileVisibility")}
                            />
                        </div>

                        {/* Activity Status */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="font-semibold">Activity Status</p>
                                <p className="text-sm text-gray-500">
                                    Show when you're active
                                </p>
                            </div>

                            <Switch
                                checked={settings.activityStatus}
                                onChange={() => handleToggle("activityStatus")}
                            />
                        </div>

                        {/* Data Collection */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="font-semibold">Data Collection</p>
                                <p className="text-sm text-gray-500">
                                    Allow system analytics tracking
                                </p>
                            </div>

                            <Switch
                                checked={settings.dataCollection}
                                onChange={() => handleToggle("dataCollection")}
                            />
                        </div>

                        {/* Search Indexing */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="font-semibold">Search Indexing</p>
                                <p className="text-sm text-gray-500">
                                    Allow search engines to index profile
                                </p>
                            </div>

                            <Switch
                                checked={settings.searchEngineIndexing}
                                onChange={() => handleToggle("searchEngineIndexing")}
                            />
                        </div>

                    </div>

                    {/* Save Button */}
                    <div className="mt-10 flex justify-end">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleUpdate}
                            className="!px-8 !py-3 !rounded-xl"
                        >
                            Save Changes
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}