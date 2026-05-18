import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../api/axios";
import {
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Typography,
    IconButton
} from "@mui/material";


export default function AddStockPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [form, setForm] = useState({
        product: "",
        warehouse: "",
        quantity: 0,
        low_stock_threshold: 5,
    });

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products/products/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProducts(res.data);
        } catch (error) {
            toast.error("Failed to load products");
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await api.get("/warehouse/warehouses/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setWarehouses(res.data);
        } catch (error) {
            toast.error("Failed to load warehouses");
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!form.product || !form.warehouse) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            await api.post("/inventory/stocks/", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Stock added successfully");
            navigate("/stock");
        } catch (error) {
            console.log(error.response?.data);
            toast.error("Failed to add stock");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center items-start p-4 sm:p-6">
            <Card className="w-full max-w-2xl rounded-2xl shadow-xl mt-10">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" className="mb-6 font-bold">
                            Add Stock
                        </Typography>
                    </div>
                    <div className="space-y-5">

                        {/* Product */}
                        <TextField
                            select
                            fullWidth
                            label="Product"
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                        >
                            <MenuItem value="">---------</MenuItem>

                            {products.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Warehouse */}
                        <TextField
                            select
                            fullWidth
                            label="Warehouse"
                            name="warehouse"
                            value={form.warehouse}
                            onChange={handleChange}
                        >
                            <MenuItem value="">---------</MenuItem>

                            {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Quantity */}
                        <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                        />

                        {/* Low Stock Threshold */}
                        <TextField
                            fullWidth
                            type="number"
                            label="Low Stock Threshold"
                            name="low_stock_threshold"
                            value={form.low_stock_threshold}
                            onChange={handleChange}
                        />

                        {/* Submit */}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleSubmit}
                        >
                            Add Stock
                        </Button>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}