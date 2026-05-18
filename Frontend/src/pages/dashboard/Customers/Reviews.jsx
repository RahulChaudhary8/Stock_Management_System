import { useEffect, useState } from "react";
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
    Rating,
    IconButton,
} from "@mui/material";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get("/products/reviews/");
            setReviews(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredReviews = reviews.filter((review) =>
        Object.values(review).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-5 md:p-6">
            <Paper className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <IconButton
                            onClick={() => navigate(-1)}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            variant="h5"
                            className="!font-bold !text-xl sm:!text-2xl"
                        >
                            Reviews
                        </Typography>
                    </div>
                    <TextField
                        label="Search reviews..."
                        size="small"
                        fullWidth
                        className="sm:!w-80"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <TableContainer className="overflow-x-auto rounded-xl border">
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow className="bg-gray-50">
                                <TableCell>
                                    <b>Customer</b>
                                </TableCell>
                                <TableCell>
                                    <b>Product</b>
                                </TableCell>
                                <TableCell>
                                    <b>Rating</b>
                                </TableCell>
                                <TableCell>
                                    <b>Comment</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <TableRow
                                        key={review.id}
                                        hover
                                        className="transition"
                                    >
                                        <TableCell className="whitespace-nowrap">
                                            {review.customer}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap">
                                            {review.product}
                                        </TableCell>

                                        <TableCell>
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell
                                            className="max-w-[250px] truncate"
                                            title={review.comment}
                                        >
                                            {review.comment}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align="center"
                                        className="py-8 text-gray-500"
                                    >
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Paper>
        </div>
    );
}