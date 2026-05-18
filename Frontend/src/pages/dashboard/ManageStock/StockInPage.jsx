import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    FormControl,
    IconButton
} from "@mui/material";
import { toast } from "react-toastify";

export default function StockInPage() {
    const [stocks, setStocks] = useState([]);
    const [selected, setSelected] = useState("");
    const [qty, setQty] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("access");

    useEffect(() => {
        api.get("/inventory/stocks/", {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
            console.log(res.data);
            setStocks(res.data);
        });
    }, []);

    const handleStockIn = async () => {
        try {
            await api.post(
                `/inventory/stocks/${selected}/stock_in/`,
                { quantity: qty },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Stock added successfully");
            setQty("");
            setSelected("");
        } catch (err) {
            toast.error("Failed to add stock");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 sm:p-6">

            <Card className="w-full max-w-xl rounded-2xl shadow-lg mt-10 sm:mt-16">
                <CardContent className="p-5 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <div className="flex items-center gap-3 mb-6">
                            <IconButton
                                onClick={() => navigate(-1)}
                                className="!bg-gray-100 hover:!bg-gray-200"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Link
                                to="/stock/add"
                                className="bg-purple-600 text-white px-4 py-2 my-4 rounded-lg hover:bg-purple-700 transition text-center "
                            >
                                + Add Stock
                            </Link>
                        </div>
                    </div>
                    <Typography variant="h5" className="mb-6 font-bold">
                        Stock In
                    </Typography>


                    {/* SELECT FIX */}
                    <FormControl fullWidth className="mb-4">
                        <TextField
                            select
                            label="Select Product Stock"
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            fullWidth
                        >
                            {stocks.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.product_name} - {s.warehouse_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>


                    <TextField
                        label="Quantity"
                        fullWidth
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        className="mt-6 py-2"
                        onClick={handleStockIn}
                    >
                        Add Stock
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}