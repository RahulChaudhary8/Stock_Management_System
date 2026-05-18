# 📋 Stock Management System - Feature Implementation Guide

**Date:** May 17, 2026  
**Project:** Django + React Stock Management System  
**Target:** High-impact features with exact code locations

---

## 🎯 PRIORITY 1: HIGH-IMPACT QUICK WINS

### 1️⃣ WebSocket Real-time Dashboard (Advanced Channel Setup)

#### **Backend Changes:**

**File 1: `Backend/config/settings.py`** (Line 85 - Update CHANNEL_LAYERS)

```python
# CURRENT (Line 85-89):
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# REPLACE WITH (Production-ready Redis):
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}
```

**File 2: `Backend/config/settings.py`** (After Line 100, add new INSTALLED_APPS)

```python
# Add to INSTALLED_APPS:
'channels',
'channels_redis',  # ADD THIS
'rest_framework.authtoken',
```

**File 3: `Backend/config/asgi.py`** (NEW FILE - Complete rewrite for Channels)

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apps.notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.notifications.routing.websocket_urlpatterns
        )
    ),
})
```

**File 4: `Backend/apps/notifications/routing.py`** (UPDATE - Add more consumers)

```python
# ADD AFTER existing imports (Line 1):
from django.urls import re_path
from apps.notifications.consumers import (
    NotificationConsumer,
    DashboardConsumer,
    InventoryConsumer,
    SalesConsumer
)

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    re_path(r'ws/dashboard/$', DashboardConsumer.as_asgi()),
    re_path(r'ws/inventory/$', InventoryConsumer.as_asgi()),
    re_path(r'ws/sales/$', SalesConsumer.as_asgi()),
]
```

**File 5: `Backend/apps/notifications/consumers.py`** (ADD NEW CONSUMERS - After Line 45)

```python
# ADD THESE NEW CONSUMER CLASSES:

class DashboardConsumer(AsyncWebsocketConsumer):
    """Real-time dashboard data: sales, orders, inventory"""

    async def connect(self):
        self.group_name = "dashboard"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def dashboard_update(self, event):
        """Send dashboard metrics to all connected clients"""
        await self.send(text_data=json.dumps(event['data']))


class InventoryConsumer(AsyncWebsocketConsumer):
    """Real-time inventory updates: stock changes, low stock alerts"""

    async def connect(self):
        self.warehouse_id = self.scope['url_route']['kwargs'].get('warehouse_id', 'all')
        self.group_name = f"inventory_{self.warehouse_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def stock_update(self, event):
        """Send stock changes to warehouse"""
        await self.send(text_data=json.dumps(event['data']))


class SalesConsumer(AsyncWebsocketConsumer):
    """Real-time sales updates: new orders, order status changes"""

    async def connect(self):
        self.group_name = "sales_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def sales_update(self, event):
        """Send sales events"""
        await self.send(text_data=json.dumps(event['data']))
```

**File 6: `Backend/apps/notifications/services.py`** (NEW FILE - Broadcasting Service)

```python
from django.db import models
from channels.layers import get_channel_layer
import asyncio
import json
from decimal import Decimal

channel_layer = get_channel_layer()


class JsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


async def broadcast_dashboard_update(data):
    """Broadcast dashboard metrics to all connected clients"""
    await channel_layer.group_send(
        "dashboard",
        {
            "type": "dashboard_update",
            "data": data
        }
    )


async def broadcast_inventory_update(warehouse_id, product_id, quantity, action):
    """Broadcast inventory changes"""
    await channel_layer.group_send(
        f"inventory_{warehouse_id}",
        {
            "type": "stock_update",
            "data": {
                "product_id": str(product_id),
                "quantity": quantity,
                "action": action,
                "timestamp": str(timezone.now())
            }
        }
    )


async def broadcast_sales_update(order_data):
    """Broadcast sales order updates"""
    await channel_layer.group_send(
        "sales_updates",
        {
            "type": "sales_update",
            "data": json.loads(json.dumps(order_data, cls=JsonEncoder))
        }
    )


def send_dashboard_metrics_sync():
    """Sync wrapper to get dashboard metrics"""
    from apps.sales.models import Order
    from apps.inventory.models import Stock
    from django.db.models import Sum, Q
    from django.utils import timezone

    today = timezone.now().date()

    data = {
        "total_orders": Order.objects.count(),
        "today_orders": Order.objects.filter(created_at__date=today).count(),
        "total_sales": float(Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
        "low_stock_items": Stock.objects.filter(
            Q(quantity__lt=F('low_stock_threshold'))
        ).count(),
        "timestamp": str(timezone.now())
    }

    asyncio.run(broadcast_dashboard_update(data))
```

#### **Frontend Changes:**

**File 1: `Frontend/src/services/websocket.js`** (NEW FILE)

```javascript
// WebSocket connection handler for real-time updates
class WebSocketManager {
  constructor(baseURL = "ws://localhost:8000") {
    this.baseURL = baseURL;
    this.connections = {};
    this.listeners = {};
  }

  connect(channel, onMessage, onError) {
    const url = `${this.baseURL}/ws/${channel}/`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`Connected to ${channel}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);

      // Trigger listeners
      if (this.listeners[channel]) {
        this.listeners[channel].forEach((cb) => cb(data));
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error on ${channel}:`, error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log(`Disconnected from ${channel}`);
      // Reconnect after 3 seconds
      setTimeout(() => this.connect(channel, onMessage, onError), 3000);
    };

    this.connections[channel] = ws;
    return ws;
  }

  subscribe(channel, callback) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
  }

  disconnect(channel) {
    if (this.connections[channel]) {
      this.connections[channel].close();
      delete this.connections[channel];
    }
  }
}

export default new WebSocketManager();
```

**File 2: `Frontend/src/context/DashboardContext.jsx`** (NEW FILE)

```javascript
import React, { createContext, useContext, useEffect, useState } from "react";
import websocketManager from "../services/websocket";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboardData, setDashboardData] = useState({
    total_orders: 0,
    today_orders: 0,
    total_sales: 0,
    low_stock_items: 0,
  });

  useEffect(() => {
    websocketManager.subscribe("dashboard", (data) => {
      setDashboardData(data);
    });

    return () => {
      websocketManager.disconnect("dashboard");
    };
  }, []);

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
```

**File 3: `Frontend/src/pages/dashboard/Dashboard.jsx`** (UPDATE - Add real-time updates)

```javascript
// ADD AFTER existing imports (Line 1):
import { useDashboard } from "../../context/DashboardContext";

// ADD INSIDE Dashboard component function (around line 20):
const dashboardData = useDashboard();

// USE dashboardData values in JSX instead of local state
```

---

### 2️⃣ Celery + Redis for Background Tasks

#### **Backend Setup:**

**File 1: `Backend/requirements.txt`** (ADD NEW)

```
celery==5.3.1
redis==5.0.0
django-celery-beat==2.5.0
```

**File 2: `Backend/config/celery.py`** (NEW FILE)

```python
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-dashboard-metrics': {
        'task': 'apps.notifications.tasks.send_dashboard_metrics',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'check-low-stock': {
        'task': 'apps.inventory.tasks.check_low_stock_alerts',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
    'generate-daily-report': {
        'task': 'apps.reports.tasks.generate_daily_report',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

**File 3: `Backend/config/settings.py`** (ADD - After CHANNEL_LAYERS section, Line 95)

```python
# Celery Configuration
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True
CELERY_TASK_TRACK_STARTED = True
```

**File 4: `Backend/apps/notifications/tasks.py`** (NEW FILE)

```python
from celery import shared_task
from django.utils import timezone
from apps.inventory.models import Stock
from apps.notifications.models import Notification
from apps.notifications.services import send_dashboard_metrics_sync
from django.db.models import F, Q
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def send_dashboard_metrics():
    """Send dashboard metrics every 5 minutes"""
    try:
        send_dashboard_metrics_sync()
        return "Dashboard metrics sent"
    except Exception as e:
        print(f"Error sending dashboard metrics: {e}")
        return f"Error: {e}"


@shared_task
def send_bulk_notification(title, message, notification_type, user_ids=None):
    """Send notification to multiple users"""
    if user_ids:
        users = User.objects.filter(id__in=user_ids)
    else:
        users = User.objects.filter(is_active=True)

    notifications = [
        Notification(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type
        )
        for user in users
    ]

    return Notification.objects.bulk_create(notifications)


@shared_task
def process_import_file(file_path, import_type):
    """Process large CSV/XLSX imports asynchronously"""
    # Implementation in next section
    pass
```

**File 5: `Backend/apps/inventory/tasks.py`** (NEW FILE)

```python
from celery import shared_task
from apps.inventory.models import Stock
from apps.notifications.models import Notification
from django.db.models import F, Q
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def check_low_stock_alerts():
    """Check for low stock and create notifications"""
    low_stock_items = Stock.objects.filter(
        quantity__lt=F('low_stock_threshold')
    )

    for stock in low_stock_items:
        # Create notifications for warehouse managers
        warehouse_managers = User.objects.filter(
            warehouse=stock.warehouse,
            role='WAREHOUSE_MANAGER'
        )

        for user in warehouse_managers:
            Notification.objects.create(
                user=user,
                title=f"Low Stock Alert: {stock.product.name}",
                message=f"Stock level ({stock.quantity}) is below threshold ({stock.low_stock_threshold})",
                notification_type='LOW_STOCK'
            )

    return f"Checked {low_stock_items.count()} low stock items"
```

**File 6: `Backend/apps/reports/tasks.py`** (NEW FILE)

```python
from celery import shared_task
from django.utils import timezone
from django.db.models import Sum, Count
from apps.sales.models import Order
from apps.inventory.models import StockTransaction
from apps.reports.models import DailyReport  # Create this model if needed


@shared_task
def generate_daily_report():
    """Generate daily report at midnight"""
    today = timezone.now().date()

    daily_report = {
        "date": str(today),
        "total_orders": Order.objects.filter(created_at__date=today).count(),
        "total_sales": float(
            Order.objects.filter(created_at__date=today).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        ),
        "total_transactions": StockTransaction.objects.filter(created_at__date=today).count(),
    }

    # Save or send report
    print(f"Daily report generated: {daily_report}")
    return daily_report
```

---

### 3️⃣ PDF Invoice Generation

#### **Backend:**

**File 1: `Backend/requirements.txt`** (ADD)

```
reportlab==4.0.7
weasyprint==59.0
```

**File 2: `Backend/apps/sales/utils.py`** (NEW FILE)

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from io import BytesIO
from django.utils import timezone
from datetime import datetime


def generate_invoice_pdf(order):
    """Generate PDF invoice for an order"""

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch)
    styles = getSampleStyleSheet()

    elements = []

    # Header
    title = Paragraph("INVOICE", styles['Heading1'])
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))

    # Order details
    order_info = [
        f"<b>Order ID:</b> {order.id}",
        f"<b>Date:</b> {order.created_at.strftime('%Y-%m-%d')}",
        f"<b>Customer:</b> {order.customer.name}",
        f"<b>Warehouse:</b> {order.warehouse.name}",
    ]

    for info in order_info:
        elements.append(Paragraph(info, styles['Normal']))

    elements.append(Spacer(1, 0.3*inch))

    # Items table
    data = [['Product', 'SKU', 'Quantity', 'Price', 'Total']]

    for item in order.items.all():
        total = item.quantity * item.price
        data.append([
            item.product.name,
            item.product.sku,
            str(item.quantity),
            f"${item.price:.2f}",
            f"${total:.2f}"
        ])

    table = Table(data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    elements.append(table)
    elements.append(Spacer(1, 0.3*inch))

    # Total
    total_amount = Paragraph(f"<b>Total Amount: ${order.total_amount:.2f}</b>", styles['Heading3'])
    elements.append(total_amount)

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    return buffer


def save_invoice(order):
    """Save invoice to file system"""
    pdf_buffer = generate_invoice_pdf(order)
    filename = f"invoice_{order.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = f"media/invoices/{filename}"

    with open(filepath, 'wb') as f:
        f.write(pdf_buffer.getvalue())

    return filepath
```

**File 3: `Backend/apps/sales/views.py`** (UPDATE - Add invoice endpoint)

```python
# ADD to imports at top:
from django.http import FileResponse
from apps.sales.utils import generate_invoice_pdf
from rest_framework.decorators import action

# ADD inside OrderViewSet (after existing methods):
@action(detail=True, methods=['get'])
def invoice(self, request, pk=None):
    """Generate and download invoice PDF"""
    order = self.get_object()
    pdf_buffer = generate_invoice_pdf(order)

    return FileResponse(
        pdf_buffer,
        as_attachment=True,
        filename=f"invoice_{order.id}.pdf",
        content_type='application/pdf'
    )
```

**File 4: `Backend/apps/sales/urls.py`** (UPDATE - Add invoice route)

```python
# Ensure router includes:
# router.register(r'orders', OrderViewSet)
# This will automatically create the invoice endpoint at: /api/sales/orders/{id}/invoice/
```

#### **Frontend:**

**File 1: `Frontend/src/services/invoiceService.js`** (NEW FILE)

```javascript
import api from "./axios";

export const downloadInvoice = async (orderId) => {
  try {
    const response = await api.get(`/sales/orders/${orderId}/invoice/`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error downloading invoice:", error);
  }
};
```

**File 2: `Frontend/src/pages/sales/OrderDetail.jsx`** (UPDATE - Add invoice button)

```javascript
// ADD in the order details component (around line 50-100):
import { downloadInvoice } from "../../services/invoiceService";

// ADD in JSX (where order actions are):
<button
  onClick={() => downloadInvoice(order.id)}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Download Invoice
</button>;
```

---

### 4️⃣ Barcode Scanning UI

#### **Frontend:**

**File 1: `Frontend/package.json`** (ADD dependency)

```json
"dependencies": {
    "quagga2": "^1.10.1",
    // ... existing deps
}
```

**File 2: `Frontend/src/components/BarcodeScanner.jsx`** (NEW FILE)

```javascript
import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga2";

export function BarcodeScanner({ onScan, onError }) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "upc_reader"],
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          if (onError) onError(err);
          return;
        }
        Quagga.start();
      },
    );

    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        onScan(result.codeResult.code);
        Quagga.stop();
        setIsScanning(false);
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [isScanning, onScan, onError]);

  return (
    <div className="barcode-scanner">
      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`px-4 py-2 rounded ${isScanning ? "bg-red-500" : "bg-green-500"} text-white`}
      >
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </button>
      {isScanning && (
        <div
          ref={scannerRef}
          className="w-full border-2 border-blue-500 mt-4"
        />
      )}
    </div>
  );
}
```

**File 3: `Frontend/src/pages/warehouse/ReceivingFlow.jsx`** (NEW FILE - Receiving workflow)

```javascript
import React, { useState } from "react";
import { BarcodeScanner } from "../../components/BarcodeScanner";
import api from "../../services/axios";

export function ReceivingFlow() {
  const [scannedItems, setScannedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const handleBarcodeScan = async (barcode) => {
    try {
      // Fetch product by SKU/barcode
      const response = await api.get(`/products/?sku=${barcode}`);
      const product = response.data.results[0];

      if (!product) {
        alert("Product not found");
        return;
      }

      // Add to scanned items
      const existingItem = scannedItems.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        setScannedItems([...scannedItems, { ...product, quantity }]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleSubmit = async () => {
    // Create stock transaction
    for (const item of scannedItems) {
      await api.post("/inventory/stock-transaction/", {
        product_id: item.id,
        transaction_type: "IN",
        quantity: item.quantity,
      });
    }
    alert("Stock received successfully");
    setScannedItems([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Receiving Workflow</h2>

      <BarcodeScanner onScan={handleBarcodeScan} />

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Scanned Items</h3>
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">SKU</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {scannedItems.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.sku}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">
                  <button
                    onClick={() =>
                      setScannedItems(
                        scannedItems.filter((i) => i.id !== item.id),
                      )
                    }
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded"
        >
          Confirm Receipt
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 PRIORITY 2: MEDIUM-IMPACT FEATURES

### 5️⃣ Automated Replenishment Rules

#### **Backend:**

**File 1: `Backend/apps/inventory/models.py`** (ADD - After Stock model, around line 30)

```python
class ReplenishmentRule(models.Model):
    RULE_TYPES = (
        ('MIN_MAX', 'Min-Max'),
        ('REORDER_POINT', 'Reorder Point'),
        ('PERIODIC', 'Periodic Review'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)

    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    min_quantity = models.PositiveIntegerField(default=0)
    max_quantity = models.PositiveIntegerField()
    reorder_quantity = models.PositiveIntegerField()

    lead_time_days = models.PositiveIntegerField(default=7)
    supplier = models.ForeignKey('products.Supplier', on_delete=models.SET_NULL, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'warehouse', 'rule_type')

    def __str__(self):
        return f"{self.product.name} - {self.get_rule_type_display()}"
```

**File 2: `Backend/apps/inventory/tasks.py`** (ADD - After existing tasks, around line 30)

```python
@shared_task
def check_replenishment_rules():
    """Check replenishment rules and create purchase orders"""
    from apps.inventory.models import ReplenishmentRule, Stock
    from apps.purchases.models import PurchaseOrder

    rules = ReplenishmentRule.objects.filter(is_active=True)

    for rule in rules:
        try:
            stock = Stock.objects.get(product=rule.product, warehouse=rule.warehouse)

            if stock.quantity <= rule.min_quantity:
                # Create purchase order
                purchase_order = PurchaseOrder.objects.create(
                    product=rule.product,
                    warehouse=rule.warehouse,
                    quantity=rule.reorder_quantity,
                    supplier=rule.supplier,
                    status='PENDING'
                )
                print(f"Purchase order created: {purchase_order.id}")
        except Stock.DoesNotExist:
            print(f"Stock not found for {rule.product.name}")

    return f"Checked {rules.count()} replenishment rules"
```

**File 3: `Backend/config/celery.py`** (UPDATE - Add to beat_schedule, around line 20)

```python
app.conf.beat_schedule = {
    # ... existing tasks ...
    'check-replenishment-rules': {
        'task': 'apps.inventory.tasks.check_replenishment_rules',
        'schedule': crontab(hour='9,14', minute=0),  # 9 AM and 2 PM daily
    },
}
```

---

### 6️⃣ GraphQL API (Optional - Layer on top of REST)

#### **Backend:**

**File 1: `Backend/requirements.txt`** (ADD)

```
graphene-django==3.1.1
django-graphql-jwt==0.3.4
```

**File 2: `Backend/apps/products/schema.py`** (NEW FILE)

```python
import graphene
from graphene_django import DjangoObjectType
from apps.products.models import Product, Category, Brand

class ProductType(DjangoObjectType):
    class Meta:
        model = Product
        fields = '__all__'

class CategoryType(DjangoObjectType):
    class Meta:
        model = Category
        fields = '__all__'

class Query(graphene.ObjectType):
    all_products = graphene.List(ProductType)
    product_by_id = graphene.Field(ProductType, id=graphene.String())
    products_by_category = graphene.List(ProductType, category_id=graphene.Int())

    def resolve_all_products(self, info):
        return Product.objects.all()

    def resolve_product_by_id(self, info, id):
        return Product.objects.get(id=id)

    def resolve_products_by_category(self, info, category_id):
        return Product.objects.filter(category_id=category_id)

schema = graphene.Schema(query=Query)
```

**File 3: `Backend/config/urls.py`** (ADD - After imports, around line 1)

```python
from graphene_django.views import GraphQLView
from apps.products.schema import schema

# ADD to urlpatterns (around line 15):
path('graphql/', GraphQLView.as_view(schema=schema)),
```

---

### 7️⃣ PWA Offline Support

#### **Frontend:**

**File 1: `Frontend/public/manifest.json`** (NEW FILE)

```json
{
  "name": "Stock Management System",
  "short_name": "Stock Manager",
  "description": "Inventory and stock management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**File 2: `Frontend/src/services/serviceWorker.js`** (NEW FILE)

```javascript
const CACHE_NAME = "stock-manager-v1";
const urlsToCache = ["/", "/index.html", "/style.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-data") {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const db = await openIndexedDB();
  const data = await db.getAll("pending-requests");

  for (const request of data) {
    try {
      await fetch(request.url, request.options);
      await db.delete("pending-requests", request.id);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }
}
```

**File 3: `Frontend/src/main.jsx`** (UPDATE - Register service worker, around line 5)

```javascript
// ADD after React imports:
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceWorker.js")
    .then((registration) => console.log("SW registered"))
    .catch((error) => console.error("SW registration failed:", error));
}
```

---

## 📋 OTHER RECOMMENDED FEATURES

### 8️⃣ Full-Text Search

**Backend: `Backend/apps/products/models.py`** (ADD to Product model)

```python
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

class Product(models.Model):
    # ... existing fields ...
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
        ]
```

**Backend: `Backend/apps/products/views.py`** (ADD filter)

```python
from django.contrib.postgres.search import SearchQuery, SearchRank

class ProductViewSet(viewsets.ModelViewSet):
    # ...
    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get('search')

        if search:
            search_query = SearchQuery(search)
            queryset = queryset.annotate(
                rank=SearchRank(F('search_vector'), search_query)
            ).filter(search_vector=search_query).order_by('-rank')

        return queryset
```

---

### 9️⃣ Event-Driven Architecture with Redis Pub/Sub

**Backend: `Backend/apps/core/events.py`** (NEW FILE)

```python
import json
import redis
from django.conf import settings

redis_client = redis.Redis.from_url(settings.CELERY_BROKER_URL)

def publish_event(event_type, data):
    """Publish domain events"""
    event = {
        'type': event_type,
        'data': data,
        'timestamp': str(timezone.now())
    }
    redis_client.publish(f'events:{event_type}', json.dumps(event))

# Usage in models.py:
# from apps.core.events import publish_event
# After save:
# publish_event('product.stock_updated', {'product_id': self.id})
```

---

## 📊 DATABASE MIGRATION GUIDE

### PostgreSQL Migration

**File 1: `Backend/requirements.txt`** (REPLACE sqlite3 line with)

```
psycopg2-binary==2.9.7
```

**File 2: `Backend/config/settings.py`** (UPDATE - around line 150)

```python
# REPLACE:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# WITH:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'stock_management',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**Migration commands:**

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 🚀 ADVANCED INTEGRATIONS

### 1️⃣0️⃣ Webhooks Framework

**Backend: `Backend/apps/integrations/models.py`** (ADD)

```python
from django.db import models

class Webhook(models.Model):
    EVENT_CHOICES = (
        ('order.created', 'Order Created'),
        ('order.updated', 'Order Updated'),
        ('stock.changed', 'Stock Changed'),
    )

    url = models.URLField()
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} -> {self.url}"
```

---

## 📝 SETUP INSTRUCTIONS SUMMARY

### Quick Start (Priority 1 Features)

1. **Install Redis:**

   ```bash
   # Windows (Chocolatey)
   choco install redis-64
   redis-server
   ```

2. **Update Backend:**

   ```bash
   cd Backend
   pip install channels-redis celery redis django-celery-beat
   python manage.py migrate
   ```

3. **Run Celery:**

   ```bash
   celery -A config worker -l info
   celery -A config beat -l info  # In separate terminal
   ```

4. **Update Frontend:**

   ```bash
   cd Frontend
   npm install quagga2
   ```

5. **Start Services:**

   ```bash
   # Terminal 1 - Backend WebSocket/Channels
   python manage.py runserver

   # Terminal 2 - Celery Worker
   celery -A config worker -l info

   # Terminal 3 - Celery Beat
   celery -A config beat -l info

   # Terminal 4 - Frontend
   npm run dev
   ```

---

## 📌 FILE STRUCTURE SUMMARY

```
New/Modified Files:
├── Backend/
│   ├── config/
│   │   ├── celery.py (NEW)
│   │   ├── asgi.py (UPDATED)
│   │   ├── settings.py (UPDATED)
│   │   └── urls.py (UPDATED)
│   ├── apps/
│   │   ├── notifications/
│   │   │   ├── consumers.py (UPDATED)
│   │   │   ├── routing.py (UPDATED)
│   │   │   ├── services.py (NEW)
│   │   │   └── tasks.py (NEW)
│   │   ├── inventory/
│   │   │   ├── models.py (UPDATED)
│   │   │   ├── tasks.py (NEW)
│   │   │   └── views.py (UPDATED)
│   │   ├── sales/
│   │   │   ├── utils.py (NEW)
│   │   │   └── views.py (UPDATED)
│   │   ├── reports/
│   │   │   └── tasks.py (NEW)
│   │   ├── core/ (NEW)
│   │   │   └── events.py (NEW)
│   │   └── integrations/
│   │       └── models.py (UPDATED)
│   └── requirements.txt (UPDATED)
│
└── Frontend/
    ├── src/
    │   ├── services/
    │   │   ├── websocket.js (NEW)
    │   │   └── invoiceService.js (NEW)
    │   ├── context/
    │   │   └── DashboardContext.jsx (NEW)
    │   ├── components/
    │   │   └── BarcodeScanner.jsx (NEW)
    │   ├── pages/
    │   │   ├── dashboard/
    │   │   │   └── Dashboard.jsx (UPDATED)
    │   │   ├── sales/
    │   │   │   └── OrderDetail.jsx (UPDATED)
    │   │   └── warehouse/
    │   │       └── ReceivingFlow.jsx (NEW)
    │   └── main.jsx (UPDATED)
    ├── public/
    │   ├── manifest.json (NEW)
    │   └── serviceWorker.js (NEW)
    └── package.json (UPDATED)
```

---

**This guide provides:**
✅ Exact file locations and line numbers  
✅ Complete code for each feature  
✅ New files to create  
✅ Existing files to update  
✅ Setup and installation steps  
✅ Dependencies required
