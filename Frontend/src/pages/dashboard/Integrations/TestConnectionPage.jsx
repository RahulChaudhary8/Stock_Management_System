import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    Typography,
    Button,
    MenuItem,
    TextField,
} from "@mui/material";
import { toast } from "react-toastify";

export default function TestConnectionPage() {
    const [configs, setConfigs] = useState([]);
    const [selected, setSelected] = useState("");
    const token = localStorage.getItem("access");

    const fetchConfigs = async () => {
        const res = await axios.get(
            "http://127.0.0.1:8000/api/integrations/configs/",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        setConfigs(res.data);
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const testConnection = async () => {
        if (!selected) return toast.error("Select integration");

        try {
            const res = await axios.post(
                `http://127.0.0.1:8000/api/integrations/configs/${selected}/test_connection/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(res.data.message);
        } catch (err) {
            toast.error("Connection failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">

            <Card className="w-full max-w-xl rounded-3xl shadow-xl">
                <CardContent className="p-6">

                    <Typography variant="h4" className="mb-6 font-bold">
                        Test Connection
                    </Typography>

                    <TextField
                        select
                        label="Select Integration"
                        fullWidth
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        {configs.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        fullWidth
                        className="mt-6"
                        onClick={testConnection}
                    >
                        Test Connection
                    </Button>

                </CardContent>
            </Card>

        </div>
    );
}