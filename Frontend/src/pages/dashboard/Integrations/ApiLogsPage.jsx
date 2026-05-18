import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
} from "@mui/material";
import { toast } from "react-toastify";

export default function ApiLogsPage() {
    const [logs, setLogs] = useState([]);
    const token = localStorage.getItem("access");

    const fetchLogs = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:8000/api/integrations/logs/",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setLogs(res.data);
        } catch (err) {
            toast.error("Failed to load logs");
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <Card className="rounded-3xl shadow-xl">
                <CardContent>

                    <Typography variant="h4" className="mb-6 font-bold">
                        API Logs
                    </Typography>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Endpoint</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{log.endpoint}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={log.status_code}
                                            color={
                                                log.status_code >= 200 &&
                                                    log.status_code < 300
                                                    ? "success"
                                                    : "error"
                                            }
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </CardContent>
            </Card>
        </div>
    );
}