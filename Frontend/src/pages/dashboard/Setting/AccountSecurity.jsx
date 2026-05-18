import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import {
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    Typography,
    TextField,
    IconButton,
} from "@mui/material";

export default function SecurityPage() {
    const navigate = useNavigate();
    const handleUpdate = () => {
        toast.success("Security settings updated successfully!");
    };
    const [settings, setSettings] = useState({
        login_alerts: false,
        two_factor_auth: false,
        block_suspicious_logins: false,
        save_devices: false,
    });

    useEffect(() => {
        api.get("/security/settings/")
            .then(res => setSettings(res.data))
            .catch(() => toast.error("Failed to load security settings"));
    }, []);

    const handleToggle = (field) => {
        setSettings((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSave = async () => {
        try {
            await api.put("/security/settings/1/", settings);
            toast.success("Security settings updated");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex justify-center">
            <Card className="w-full max-w-5xl rounded-3xl shadow-xl">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        {/* Header */}
                        <Typography variant="h4" className="!font-bold mb-2">
                            Security Center
                        </Typography>
                    </div>
                    <Typography className="text-gray-500 mb-6">
                        Manage your account security and protection settings
                    </Typography>

                    <Divider className="mb-6" />

                    {/* Security Toggles */}
                    <div className="grid sm:grid-cols-2 gap-6">

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.login_alerts}
                                    onChange={() => handleToggle("login_alerts")}
                                />
                            }
                            label="Enable Login Alerts"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.two_factor_auth}
                                    onChange={() => handleToggle("two_factor_auth")}
                                />
                            }
                            label="Two-Factor Authentication (2FA)"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.block_suspicious_logins}
                                    onChange={() => handleToggle("block_suspicious_logins")}
                                />
                            }
                            label="Block Suspicious Login Attempts"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.save_devices}
                                    onChange={() => handleToggle("save_devices")}
                                />
                            }
                            label="Save Login Devices"
                        />
                    </div>

                    <Divider className="my-6" />

                    {/* Device Section */}
                    <Typography variant="h6" className="mb-3 font-semibold">
                        Active Sessions
                    </Typography>

                    <div className="bg-gray-100 p-4 rounded-xl mb-6">
                        <p className="text-sm text-gray-700">
                            Chrome - Windows (Current Device)
                        </p>
                        <p className="text-xs text-gray-500">
                            Last active: Just now
                        </p>
                    </div>

                    {/* Password Section (READ ONLY LINK STYLE) */}
                    <Typography variant="h6" className="mb-2 font-semibold">
                        Password Security
                    </Typography>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <TextField
                            label="Last Password Change"
                            value="10 days ago"
                            disabled
                            fullWidth
                        />

                        <TextField
                            label="Password Strength"
                            value="Strong"
                            disabled
                            fullWidth
                        />
                    </div>

                    {/* Action Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                    >
                        Save Security Settings
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}