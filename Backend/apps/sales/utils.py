from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


def generate_invoice_pdf(order):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    elements = []
    elements.append(Paragraph('INVOICE', styles['Heading1']))
    elements.append(Spacer(1, 0.2 * inch))

    order_info = [
        f"Order ID: {order.id}",
        f"Date: {order.created_at.strftime('%Y-%m-%d')}",
        f"Customer: {order.customer.name}",
        f"Warehouse: {order.warehouse.name}",
    ]

    for info in order_info:
        elements.append(Paragraph(info, styles['Normal']))
        elements.append(Spacer(1, 0.1 * inch))

    elements.append(Spacer(1, 0.2 * inch))

    table_data = [['Product', 'SKU', 'Quantity', 'Price', 'Total']]
    for item in order.items.all():
        total = item.quantity * item.price
        table_data.append([
            item.product.name,
            item.product.sku,
            str(item.quantity),
            f"₹{item.price:.2f}",
            f"₹{total:.2f}"
        ])

    table = Table(table_data, colWidths=[2.5 * inch, 1.2 * inch, 0.8 * inch, 0.8 * inch, 0.8 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph(f"Total Amount: ₹{order.total_amount:.2f}", styles['Heading3']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
