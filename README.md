# Kaisyn Photography

Customer-facing proof gallery and order builder for Kaisyn Photography. The app lets customers browse protected previews, select images, choose print/download products, enter delivery details, and hand the order to the Ghost-Proof backend for watermark release, checkout, payment processing, and fulfillment.

## Local Development

```bash
npm install
npm run dev
```

## Ghost-Proof Integration

Set this environment variable in Vercel when the Ghost-Proof API is ready:

```bash
VITE_GHOST_PROOF_API_URL=https://your-ghost-proof-api.example.com
```

The frontend posts orders to:

```text
POST /orders
```

Payload shape:

```json
{
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "555-555-5555",
    "delivery": "Digital delivery",
    "notes": "Retouching or pickup notes"
  },
  "items": [
    {
      "imageId": "kp-1042",
      "productId": "digital",
      "quantity": 1
    }
  ],
  "source": "kaisynphotography-web",
  "requestedAt": "2026-07-24T00:00:00.000Z"
}
```

Expected response:

```json
{
  "orderId": "order_123",
  "checkoutUrl": "https://checkout.example.com/session"
}
```

If `checkoutUrl` is returned, the customer is redirected there. If the environment variable is not set, the draft order is saved to `localStorage` for frontend testing.
