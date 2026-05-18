import { useState } from "react";
import api from "../../../api/axios";
import { TextField, Button, Paper, Typography,IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AddBrand() {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/products/brands/", {
                name,
            });

            toast.success("Brand Added");
            setName("");

        } catch (err) {
            console.log(err);
            toast.error("Failed to add brand");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Paper className="w-full max-w-md p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="!bg-gray-100 hover:!bg-gray-200"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" className="text-center mb-5">
                        Add Brand
                    </Typography>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <TextField
                        fullWidth
                        label="Brand Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Button fullWidth type="submit" variant="contained" className="!bg-purple-600">
                        Add Brand
                    </Button>

                </form>
            </Paper>
        </div>
    );
}