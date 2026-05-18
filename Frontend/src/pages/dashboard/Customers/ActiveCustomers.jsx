import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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


export default function ActiveCustomers() {
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await api.get("/sales/customers/");
        setCustomers(res.data.filter((c) => c.is_active));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-5 md:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Typography
                        variant="h5"
                        className="!font-bold !text-xl sm:!text-2xl"
                    >
                        Active Customers
                    </Typography>
                </div>

                {/* Table */}
                <TableContainer className="overflow-x-auto rounded-xl border">
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow className="bg-gray-50">
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        hover
                                        className="transition"
                                    >
                                        <TableCell className="whitespace-nowrap">
                                            {customer.id}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            {customer.name}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            {customer.email}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label="Active"
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align="center"
                                        className="py-8 text-gray-500"
                                    >
                                        No active customers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>
        </div>
    );
}