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

export default function AddProductImage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        product: "",
        image: null,
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
        if (e.target.name === "image") {
            setForm({
                ...form,
                image: e.target.files[0],
            });
        } else {
            setForm({
                ...form,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async () => {
        if (!form.product || !form.image) {
            toast.error("All fields are required");
            return;
        }

        const formData = new FormData();
        formData.append("product", form.product);
        formData.append("image", form.image);

        try {
            await api.post("/products/images/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Product image added successfully");
            navigate("/product-images");
        } catch (error) {
            console.log(error.response?.data);
            toast.error("Failed to add image");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex justify-center items-start">
            <Paper className="w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" className="!font-bold mb-6">
                        Add Product Image
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
                        <MenuItem value="">---------</MenuItem>
                        {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                                {product.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Image Upload */}
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        className="!py-3"
                    >
                        Upload Image
                        <input
                            type="file"
                            hidden
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                        />
                    </Button>

                    {form.image && (
                        <Typography variant="body2">
                            Selected: {form.image.name}
                        </Typography>
                    )}

                    {/* Preview */}
                    {form.image && (
                        <img
                            src={URL.createObjectURL(form.image)}
                            alt="preview"
                            className="w-full h-64 object-cover rounded-xl border"
                        />
                    )}

                    {/* Submit */}
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSubmit}
                    >
                        Add Image
                    </Button>
                </div>
            </Paper>
        </div>
    );
}