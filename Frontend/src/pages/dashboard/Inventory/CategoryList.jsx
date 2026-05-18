import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Paper,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton
} from "@mui/material";

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get(
                "/products/categories/"
            );
            setCategories(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredCategories = categories.filter((category) => {
        const query = search.toLowerCase();

        return (
            category.name?.toLowerCase().includes(query) ||
            category.parent?.toString().toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            variant="h5"
                            className="!font-bold text-center md:text-left"
                        >
                            All Categories
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search category..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Link
                            to="/add-category"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Category
                        </Link>

                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <TableContainer className="rounded-xl overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50">
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>Parent Category</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id} hover>
                                        <TableCell>{category.name}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={category.parent || "None"}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile Card View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredCategories.map((category) => (
                        <Paper
                            key={category.id}
                            className="p-4 rounded-xl shadow-md"
                        >
                            <div className="space-y-3">

                                <Typography className="!font-bold text-lg">
                                    {category.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    component="div"
                                >
                                    <b>Parent:</b>{" "}
                                    <Chip
                                        label={category.parent || "None"}
                                        size="small"
                                    />
                                </Typography>

                            </div>
                        </Paper>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCategories.length === 0 && (
                    <div className="text-center py-10">
                        <Typography color="textSecondary">
                            No categories found
                        </Typography>
                    </div>
                )}
            </Paper>
        </div>
    );
}