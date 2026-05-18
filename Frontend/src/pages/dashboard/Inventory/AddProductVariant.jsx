import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    IconButton,
} from "@mui/material";
import { toast } from "react-toastify";

export default function AddProductVariant() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [form, setForm] = useState({
        product: "",
        name: "",
        sku: "",
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products/products/");
            setProducts(res.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load products");
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!form.product || !form.name || !form.sku) {
            toast.error("All fields required");
            return;
        }

        try {
            await api.post("/products/variants/", form);

            toast.success("Variant added successfully");

            navigate("/product-variants");
        } catch (error) {
            console.log(error.response?.data);
            toast.error("Failed to add variant");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center items-center">
            <Paper className="w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography
                        variant="h5"
                        className="!font-bold mb-6 text-center"
                    >
                        Add Product Variant
                    </Typography>
                </div>
                <div className="space-y-5">

                    {/* Product Dropdown */}
                    <TextField
                        select
                        fullWidth
                        label="Product"
                        name="product"
                        value={form.product}
                        onChange={handleChange}
                    >
                        {products.map((product) => (
                            <MenuItem
                                key={product.id}
                                value={product.id}
                            >
                                {product.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Variant Name */}
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    {/* SKU */}
                    <TextField
                        fullWidth
                        label="SKU"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                    />

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate("/product-variants")}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                        >
                            Add Variant
                        </Button>
                    </div>

                </div>
            </Paper>
        </div>
    );
}