import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../api/axios";
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
} from "@mui/material";

export default function CompletedOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await api.get("/sales/orders/");
        setOrders(res.data.filter(order => order.status === "CONFIRMED"));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <Paper className="p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" className="!font-bold mb-6">
                        Completed Orders
                    </Typography>
                </div>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Customer</b></TableCell>
                                <TableCell><b>Total</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>₹{order.total_amount}</TableCell>
                                    <TableCell>
                                        <Chip label="CONFIRMED" color="success" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}