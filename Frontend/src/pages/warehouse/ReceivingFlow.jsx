import { useEffect, useState } from 'react';
import { BarcodeScanner } from '../../components/BarcodeScanner';
import api from '../../api/axios';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

export default function ReceivingFlow() {
    const [scannedSku, setScannedSku] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [scannedItems, setScannedItems] = useState([]);

    const handleScan = async (sku) => {
        setScannedSku(sku);

        try {
            const res = await api.get('/products/products/');
            const found = res.data.find((product) => product.sku === sku);

            if (!found) {
                toast.error('Product not found for SKU: ' + sku);
                return;
            }

            setScannedItems((current) => {
                const existing = current.find((item) => item.id === found.id);
                if (existing) {
                    return current.map((item) =>
                        item.id === found.id ? { ...item, quantity: item.quantity + quantity } : item
                    );
                }
                return [...current, { ...found, quantity }];
            });
        } catch (error) {
            console.error(error);
            toast.error('Unable to fetch product data');
        }
    };

    const handleSubmit = async () => {
        try {
            for (const item of scannedItems) {
                await api.post('/inventory/stocks/receive/', {
                    product_id: item.id,
                });
            }

            toast.success('Stock received successfully');
            setScannedItems([]);

        } catch (error) {
            console.error(error);
            toast.error('Failed to submit received stock');
        }
    };

            return (
                <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
                    <Paper className="p-6 rounded-3xl shadow-xl">
                        <div className="flex flex-col gap-4 mb-6">
                            <Typography variant="h5" className="font-bold">
                                Warehouse Receiving
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Scan item barcodes to receive products and update stock directly in inventory.
                            </Typography>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <BarcodeScanner onScan={handleScan} />
                                <div className="mt-4 space-y-3">
                                    <TextField
                                        label="Scanned SKU"
                                        value={scannedSku}
                                        fullWidth
                                        disabled
                                    />
                                    <TextField
                                        type="number"
                                        label="Quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        fullWidth
                                    />
                                </div>
                            </div>

                            <div>
                                <Typography variant="h6" className="font-semibold mb-4">
                                    Scanned Items
                                </Typography>

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>SKU</TableCell>
                                                <TableCell>Qty</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {scannedItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.sku}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() =>
                                                                setScannedItems((current) => current.filter((row) => row.id !== item.id))
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    className="mt-4"
                                    onClick={handleSubmit}
                                    disabled={scannedItems.length === 0}
                                >
                                    Submit Received Stock
                                </Button>
                            </div>
                        </div>
                    </Paper>
                </div>
            );
        }
