import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { TextField, Button, Paper, Typography, Autocomplete, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        brand: "",
        supplier: "",
        description: "",
        price: "",
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();

    // 🔥 Load dropdown data from backend
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, brandRes, supRes] = await Promise.all([
                api.get("/products/categories/"),
                api.get("/products/brands/"),
                api.get("/products/suppliers/"),
            ]);

            setCategories(catRes.data);
            setBrands(brandRes.data);
            setSuppliers(supRes.data);

        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch data");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post(
                "/products/products/",
                form
            );

            toast.success("Product Added Successfully");
            // 🔥 RESET FORM
            setForm({
                name: "",
                sku: "",
                category: "",
                brand: "",
                supplier: "",
                description: "",
                price: "",
            });

            // 🔥 OPTIONAL: refresh dropdowns (IMPORTANT PART)
            await fetchData();

        } catch (error) {
            console.log(error);
            toast.error("Failed to add product");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Paper className="w-full max-w-3xl p-6 rounded-2xl shadow-lg">

                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" className="mb-6 font-bold text-center">
                        Add Product
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <TextField fullWidth label="Name" name="name" onChange={handleChange} />

                    <TextField fullWidth label="SKU" name="sku" onChange={handleChange} />

                    {/* CATEGORY FROM DB */}
                    <Autocomplete
                        options={categories}
                        getOptionLabel={(option) => option.name || ""}
                        value={categories.find((c) => c.id === form.category) || null}
                        onChange={(e, newValue) =>
                            setForm({
                                ...form,
                                category: newValue ? newValue.id : "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Category" fullWidth />
                        )}
                    />
                    {/* BRAND FROM DB */}
                    <Autocomplete
                        options={brands}
                        getOptionLabel={(option) => option.name || ""}
                        value={brands.find((b) => b.id === form.brand) || null}
                        onChange={(e, newValue) =>
                            setForm({
                                ...form,
                                brand: newValue ? newValue.id : "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Brand" fullWidth />
                        )}
                    />

                    {/* SUPPLIER FROM DB */}
                    <Autocomplete
                        options={suppliers}
                        getOptionLabel={(option) => option.name || ""}
                        value={suppliers.find((s) => s.id === form.supplier) || null}
                        onChange={(e, newValue) =>
                            setForm({
                                ...form,
                                supplier: newValue ? newValue.id : "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Supplier" fullWidth />
                        )}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        name="description"
                        onChange={handleChange}
                    />

                    <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        onChange={handleChange}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="!bg-purple-600 !py-3"
                    >
                        Add Product
                    </Button>

                </form>
            </Paper>
        </div>
    );
}