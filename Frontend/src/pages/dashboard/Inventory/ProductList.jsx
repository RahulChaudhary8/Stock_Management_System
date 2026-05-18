import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    IconButton
} from "@mui/material";

export default function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get(
                "/products/products/"
            );
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredProducts = products.filter((product) => {
        const query = search.toLowerCase();

        return (
            product.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query) ||
            product.category_name?.toLowerCase().includes(query) ||
            product.brand_name?.toLowerCase().includes(query) ||
            product.supplier_name?.toLowerCase().includes(query) ||
            product.price?.toString().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Typography
                            variant="h5"
                            className="!font-bold text-center md:text-left"
                        >
                            All Products
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search anything..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Link
                            to="/add-product"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Product
                        </Link>

                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <TableContainer className="rounded-xl overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50">
                                    <TableCell><b>ID</b></TableCell>
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>SKU</b></TableCell>
                                    <TableCell><b>Category</b></TableCell>
                                    <TableCell><b>Brand</b></TableCell>
                                    <TableCell><b>Supplier</b></TableCell>
                                    <TableCell><b>Price</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.category_name || "N/A"}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>{product.brand_name || "N/A"}</TableCell>
                                        <TableCell>{product.supplier_name || "N/A"}</TableCell>
                                        <TableCell className="font-semibold text-purple-600">
                                            ₹{product.price}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile / Tablet Card View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredProducts.map((product) => (
                        <Paper
                            key={product.id}
                            className="p-4 rounded-xl shadow-md"
                        >
                            <div className="space-y-2">

                                <Typography className="!font-bold text-lg">
                                    <b>ID:</b> {product.id}
                                </Typography>

                                <Typography className="!font-bold text-lg">
                                    <b>Name:</b> {product.name}
                                </Typography>

                                <Typography variant="body2" component="div">
                                    <b>SKU:</b> {product.sku}
                                </Typography>

                                <Typography variant="body2" component="div">
                                    <b>Category:</b>{" "}
                                    <Chip
                                        label={product.category_name || "N/A"}
                                        size="small"
                                    />
                                </Typography>

                                <Typography variant="body2" component="div">
                                    <b>Brand:</b> {product.brand_name || "N/A"}
                                </Typography>

                                <Typography variant="body2" component="div">
                                    <b>Supplier:</b> {product.supplier_name || "N/A"}
                                </Typography>

                                <Typography className="!font-bold text-purple-600">
                                    <b>Price:</b> ₹{product.price}
                                </Typography>

                            </div>
                        </Paper>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-10">
                        <Typography color="textSecondary">
                            No products found
                        </Typography>
                    </div>
                )}
            </Paper>
        </div>
    );
}