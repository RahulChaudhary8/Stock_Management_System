import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    IconButton,
} from "@mui/material";

export default function SupplierList() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get(
                "/products/suppliers/"
            );
            setSuppliers(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredSuppliers = suppliers.filter((supplier) => {
        const query = search.toLowerCase();

        return (
            supplier.name?.toLowerCase().includes(query) ||
            supplier.email?.toLowerCase().includes(query) ||
            supplier.phone?.includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg">

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" className="!font-bold">
                            All Suppliers
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search supplier..."
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link
                            to="/add-supplier"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Supplier
                        </Link>
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>Email</b></TableCell>
                                    <TableCell><b>Phone</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredSuppliers.map((supplier) => (
                                    <TableRow key={supplier.id} hover>
                                        <TableCell>{supplier.name}</TableCell>
                                        <TableCell>{supplier.email || "N/A"}</TableCell>
                                        <TableCell>{supplier.phone || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredSuppliers.map((supplier) => (
                        <Paper
                            key={supplier.id}
                            className="p-4 rounded-xl shadow-md"
                        >
                            <div className="space-y-2">
                                <Typography className="!font-bold text-lg">
                                    {supplier.name}
                                </Typography>

                                <Typography variant="body2">
                                    {supplier.email || "N/A"}
                                </Typography>

                                <Typography variant="body2">
                                    {supplier.phone || "N/A"}
                                </Typography>
                            </div>
                        </Paper>
                    ))}
                </div>

            </Paper>
        </div>
    );
}