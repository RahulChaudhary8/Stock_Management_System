import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    TextField,
    CircularProgress,
    IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function StockListPage() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchStocks = async () => {
        try {
            setLoading(true);

            const res = await api.get("/inventory/stocks/");
            setStocks(res.data);

        } catch (err) {
            toast.error("Failed to load stock");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    // 🔍 SEARCH FILTER
    const filteredStocks = stocks.filter((item) =>
        item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouse_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.quantity.toString().includes(search)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">

            <Card className="rounded-3xl shadow-xl">
                <CardContent>

                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <IconButton
                                onClick={() => navigate(-1)}
                                className="!bg-gray-100 hover:!bg-gray-200"
                            >
                                <ArrowBackIcon />
                            </IconButton>

                            <Typography variant="h4" className="font-bold text-gray-800">
                                Stock Overview
                            </Typography>
                        </div>
                        <TextField
                            size="small"
                            placeholder="Search product or warehouse..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-72"
                        />
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="flex justify-center items-center py-16">
                            <CircularProgress />
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && filteredStocks.length === 0 && (
                        <div className="text-center py-16">
                            <Typography className="text-gray-500 text-lg">
                                📦 No stock found
                            </Typography>
                            <Typography className="text-gray-400 text-sm mt-1">
                                Try adjusting your search
                            </Typography>
                        </div>
                    )}

                    {/* GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                        {filteredStocks.map((item) => (
                            <Card
                                key={item.id}
                                className="rounded-2xl shadow-md hover:shadow-2xl transition duration-300 border border-gray-100"
                            >
                                <CardContent className="space-y-3">

                                    {/* PRODUCT NAME */}
                                    <Typography className="font-bold text-lg text-gray-800">
                                        {item.product_name || "Unknown Product"}
                                    </Typography>

                                    {/* WAREHOUSE */}
                                    <Typography className="text-gray-500 text-sm">
                                        Warehouse: {item.warehouse_name || "Unknown"}
                                    </Typography>

                                    {/* FOOTER */}
                                    <div className="flex justify-between items-center pt-2">

                                        <Chip
                                            label={`Qty: ${item.quantity}`}
                                            color={
                                                item.quantity <= item.low_stock_threshold
                                                    ? "error"
                                                    : "success"
                                            }
                                            size="small"
                                        />

                                        {item.quantity <= item.low_stock_threshold && (
                                            <Chip
                                                label="Low Stock"
                                                color="warning"
                                                size="small"
                                            />
                                        )}

                                    </div>

                                </CardContent>
                            </Card>
                        ))}

                    </div>

                </CardContent>
            </Card>
        </div>
    );
}