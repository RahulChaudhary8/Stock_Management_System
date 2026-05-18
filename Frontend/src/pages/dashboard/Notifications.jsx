import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import websocketManager from "../../services/websocket";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    IconButton,
} from "@mui/material";
import { toast } from "react-toastify";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!token) return;

        const handleNotification = (data) => {
            const next = {
                id: Date.now(),
                title: data.title,
                message: data.message,
                notification_type: data.notification_type,
                is_read: false,
            };
            setNotifications((prev) => [next, ...prev]);
            toast.info(`${data.title}: ${data.message}`);
        };

        websocketManager.connect('notifications', handleNotification, console.error, { token });

        return () => websocketManager.disconnect('notifications');
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("access");

            console.log("TOKEN:", token);

            const res = await api.get(
                "/notifications/notifications/",
                {
                    headers: {
                        Authorization: token ? `Bearer ${token.trim()}` : "",
                    },
                }
            );

            setNotifications(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("access");

            await api.post(
                `/notifications/notifications/${id}/mark_as_read/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchNotifications();
        } catch (error) {
            console.log(error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("access");

            await api.post(
                "/notifications/notifications/mark_all_read/",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchNotifications();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <Card className="rounded-3xl shadow-xl">
                <CardContent className="p-6 sm:p-8">

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-3 mb-6">
                            <IconButton
                                onClick={() => navigate(-1)}
                                className="!bg-gray-100 hover:!bg-gray-200"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" className="!font-bold">
                                Notifications
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            onClick={markAllRead}
                        >
                            Mark All Read
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <Card
                                    key={item.id}
                                    className={`rounded-2xl shadow-md ${!item.is_read
                                        ? "border-l-4 border-purple-600"
                                        : ""
                                        }`}
                                >
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div>
                                                <Typography className="!font-bold">
                                                    {item.title}
                                                </Typography>

                                                <Typography className="text-gray-600 mt-1">
                                                    {item.message}
                                                </Typography>

                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    <Chip
                                                        label={item.notification_type}
                                                        size="small"
                                                    />

                                                    <Chip
                                                        label={
                                                            item.is_read
                                                                ? "Read"
                                                                : "Unread"
                                                        }
                                                        color={
                                                            item.is_read
                                                                ? "success"
                                                                : "warning"
                                                        }
                                                        size="small"
                                                    />
                                                </div>
                                            </div>

                                            {!item.is_read && (
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        markAsRead(item.id)
                                                    }
                                                >
                                                    Mark Read
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography className="text-center text-gray-500 py-10">
                                No notifications found
                            </Typography>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}