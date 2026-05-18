import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { TextField, Button, Paper, Typography, MenuItem, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";

export default function AddCategory() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        parent: "",
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await api.get("/products/categories/");
        setCategories(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/products/categories/", form);

            toast.success("Category Added");

            setForm({ name: "", parent: "" });

            // 🔥 REFRESH LIST AFTER SAVE
            fetchCategories();

        } catch (err) {
            console.log(err);
            toast.error("Failed to add category");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Paper className="w-full max-w-lg p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    
                    <Typography variant="h5" className="text-center mb-5">
                        Add Category
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <TextField
                        fullWidth
                        label="Category Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Parent Category"
                        name="parent"
                        value={form.parent}
                        onChange={handleChange}
                    >
                        <MenuItem value="">None</MenuItem>

                        {categories.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button fullWidth type="submit" variant="contained" className="!bg-purple-600">
                        Add Category
                    </Button>

                </form>
            </Paper>
        </div>
    );
}