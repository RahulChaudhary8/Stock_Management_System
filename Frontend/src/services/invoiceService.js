import api from '../api/axios';

export const downloadInvoice = async (orderId) => {
    try {
        const response = await api.get(`/sales/orders/${orderId}/invoice/`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Invoice download failed:', error);
    }
};
