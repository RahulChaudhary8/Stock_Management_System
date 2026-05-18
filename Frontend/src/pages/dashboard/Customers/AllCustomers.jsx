import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
} from "@mui/material";

export default function AllCustomers() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get("/sales/customers/");
            setCustomers(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredCustomers = customers.filter((customer) =>
        Object.values(customer).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-5 md:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
                            All Customers
                        </Typography>
                    </div>
                    <TextField
                        label="Search customer..."
                        size="small"
                        fullWidth
                        className="sm:!w-80"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
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
                                                label={
                                                    customer.is_active
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                                color={
                                                    customer.is_active
                                                        ? "success"
                                                        : "default"
                                                }
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
                                        No customers found
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