import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
} from "@mui/material";
import { toast } from "react-toastify";

export default function IntegrationConfigPage() {
    const [configs, setConfigs] = useState([]);
    const token = localStorage.getItem("access");

    const fetchConfigs = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:8000/api/integrations/configs/",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setConfigs(res.data);
        } catch (err) {
            toast.error("Failed to load configs");
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <Card className="rounded-3xl shadow-xl">
                <CardContent className="p-6">

                    <Typography variant="h4" className="mb-6 font-bold">
                        Integration Configs
                    </Typography>

                    <div className="space-y-4">
                        {configs.map((item) => (
                            <Card key={item.id} className="rounded-2xl shadow">
                                <CardContent className="flex justify-between items-center">

                                    <div>
                                        <Typography className="font-bold">
                                            {item.name}
                                        </Typography>

                                        <Typography className="text-gray-500 text-sm">
                                            {item.integration_type}
                                        </Typography>

                                        <Chip
                                            label={item.is_active ? "Active" : "Inactive"}
                                            color={item.is_active ? "success" : "default"}
                                            size="small"
                                            className="mt-2"
                                        />
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}