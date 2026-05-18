import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Typography,
    IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
export default function StockOutPage() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [selected, setSelected] = useState("");
    const [qty, setQty] = useState("");

    const token = localStorage.getItem("access");

    useEffect(() => {
        api.get("/inventory/stocks/", {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => setStocks(res.data));
    }, []);

    const handleStockOut = async () => {
        try {
            await api.post(
                `/inventory/stocks/${selected}/stock_out/`,
                { quantity: qty },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Stock deducted successfully");
            setQty("");
        } catch (err) {
            toast.error("Not enough stock");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-slate-50 p-6">
            <Card className="w-full max-w-xl rounded-3xl shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Typography variant="h4" className="mb-6 font-bold">
                            Stock Out
                        </Typography>
                    </div>

                    <TextField
                        select
                        label="Select Product Stock"
                        fullWidth
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        {stocks.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.product_name} - {s.warehouse_name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Quantity"
                        fullWidth
                        className="mt-4"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        className="mt-6"
                        onClick={handleStockOut}
                    >
                        Deduct Stock
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}