import { useState } from "react";
import api from "../../../api/axios";
import { TextField, Button, Paper, Typography, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AddSupplier() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/products/suppliers/", form);

            toast.success("Supplier Added");

            // reset form
            setForm({ name: "", email: "", phone: "" });

        } catch (err) {
            toast.error("Failed to add supplier");
            console.log(err);
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
                        Add Supplier
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} />
                    <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} />
                    <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />

                    <Button fullWidth type="submit" variant="contained" className="!bg-purple-600">
                        Add Supplier
                    </Button>

                </form>
            </Paper>
        </div>
    );
}