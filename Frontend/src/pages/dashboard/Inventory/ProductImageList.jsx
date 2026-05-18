import { useEffect, useState } from "react";
import api from "../../..//api/axios";
import { Link, useNavigate } from "react-router-dom";
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
    IconButton,
} from "@mui/material";

export default function ProductImageList() {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await api.get(
                "/products/images/"
            );
            setImages(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredImages = images.filter((img) =>
        search === "" ||
        img.product?.toLowerCase().includes(search.toLowerCase()) ||
        img.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        img.id?.toString().includes(search)
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" className="!font-bold">
                            Product Images
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search..."
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link
                            to="/add-product-image"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Product Image
                        </Link>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>ID</b></TableCell>
                                    <TableCell><b>Product</b></TableCell>
                                    <TableCell><b>Image</b></TableCell>
                                    <TableCell><b>File</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredImages.map((img) => (
                                    <TableRow key={img.id} hover>
                                        <TableCell>{img.id}</TableCell>

                                        <TableCell>
                                            {img.product_name || "N/A"}
                                        </TableCell>

                                        <TableCell>
                                            <img
                                                src={img.image}
                                                alt="product"
                                                className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {img.image?.split("/").pop()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredImages.map((img) => (
                        <Paper
                            key={img.id}
                            className="p-4 rounded-xl shadow-md"
                        >
                            <img
                                src={img.image}
                                alt="product"
                                className="w-full h-32 object-cover rounded-lg"
                            />

                            <div className="mt-3 space-y-1">
                                <Typography>
                                    <b>ID:</b> {img.id}
                                </Typography>

                                <Typography>
                                    <b>Product:</b> {img.product_name || "N/A"}
                                </Typography>

                                <Typography variant="body2">
                                    <b>File:</b> {img.image?.split("/").pop()}
                                </Typography>
                            </div>
                        </Paper>
                    ))}
                </div>

            </Paper>
        </div>
    );
}