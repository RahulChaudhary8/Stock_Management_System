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

export default function ProductVariantList() {
    const navigate = useNavigate();
    const [variants, setVariants] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        try {
            const res = await api.get(
                "/products/variants/"
            );
            setVariants(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredVariants = variants.filter((variant) => {
        const query = search.toLowerCase();

        return (
            variant.name?.toLowerCase().includes(query) ||
            variant.sku?.toLowerCase().includes(query) ||
            variant.product_name?.toLowerCase().includes(query)
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
                            Product Variants
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search variant..."
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link
                            to="/product-variants/add"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Variant
                        </Link>
                    </div>

                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Product ID</b></TableCell>
                                    <TableCell><b>Product Name</b></TableCell>
                                    <TableCell><b>Variant</b></TableCell>
                                    <TableCell><b>SKU</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredVariants.map((variant) => (
                                    <TableRow key={variant.id} hover>
                                        <TableCell>{variant.id}</TableCell>
                                        <TableCell>{variant.product_name}</TableCell>
                                        <TableCell>{variant.name}</TableCell>
                                        <TableCell>{variant.sku}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredVariants.map((variant) => (
                        <Paper key={variant.id} className="p-4 rounded-xl shadow-md">

                            <Typography className="!font-bold text-lg">
                                <b>ID:</b> {variant.id}
                            </Typography>

                            <Typography className="!font-bold text-lg">
                                <b>Variant:</b> {variant.name}
                            </Typography>

                            <Typography variant="body2">
                                <b>Product:</b> {variant.product_name}
                            </Typography>

                            <Typography variant="body2">
                                <b>SKU:</b> {variant.sku}
                            </Typography>
                        </Paper>
                    ))}
                </div>

            </Paper>
        </div>
    );
}