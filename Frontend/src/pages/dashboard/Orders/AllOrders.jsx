import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../api/axios";
import {
    Paper,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
} from "@mui/material";
import { downloadInvoice } from '../../../services/invoiceService';

export default function AllOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/sales/orders/");
            setOrders(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case "PENDING":
                return { label: "Pending", color: "warning" };

            case "CONFIRMED":
                return { label: "Confirmed", color: "success" };

            case "CANCELLED":
                return { label: "Cancelled", color: "error" };

            default:
                return { label: status, color: "default" };
        }
    };

    const filteredOrders = orders.filter((order) =>
        Object.values(order).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <Paper className="p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" className="!font-bold">
                            All Orders
                        </Typography>
                    </div>
                    <TextField
                        label="Search orders..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Customer</b></TableCell>
                                <TableCell><b>Total</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell><b>Invoice</b></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>₹{order.total_amount}</TableCell>
                                    <TableCell>
                                        {(() => {
                                            const statusChip = getStatusChip(order.status);

                                            return (
                                                <Chip
                                                    label={statusChip.label}
                                                    color={statusChip.color}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => downloadInvoice(order.id)}
                                        >
                                            Download
                                        </Button>
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