import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../api/axios";
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
    IconButton,
} from "@mui/material";

export default function BrandList() {
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await api.get(
                "/products/brands/"
            );
            setBrands(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredBrands = brands.filter((brand) =>
        brand.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg">

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" className="!font-bold">
                            All Brands
                        </Typography>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">

                        <TextField
                            label="Search brand..."
                            size="small"
                            fullWidth
                            className="md:!w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link
                            to="/add-brand"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
                        >
                            + Add Brand
                        </Link>
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Brand Name</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredBrands.map((brand) => (
                                    <TableRow key={brand.id} hover>
                                        <TableCell>{brand.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                {/* Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {filteredBrands.map((brand) => (
                        <Paper
                            key={brand.id}
                            className="p-4 rounded-xl shadow-md"
                        >
                            <Typography className="!font-bold text-lg">
                                {brand.name}
                            </Typography>
                        </Paper>
                    ))}
                </div>

            </Paper>
        </div>
    );
}