// Invoice Generator - Creates PDF-style invoice data
export interface InvoiceData {
  invoiceNumber: string
  orderDate: string
  dueDate: string
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: Array<{
    name: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  status: 'pending' | 'paid' | 'cancelled'
  notes?: string
}

export function generateInvoiceNumber(orderId: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortId = orderId.substring(0, 8).toUpperCase()
  return `INV-${year}${month}-${shortId}`
}

export function generateInvoiceHTML(invoice: InvoiceData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .invoice-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #4A90E2;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #4A90E2;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-pending {
      background: #FFF3CD;
      color: #856404;
    }
    .status-paid {
      background: #D4EDDA;
      color: #155724;
    }
    .status-cancelled {
      background: #F8D7DA;
      color: #721C24;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .party h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }
    .party p {
      margin: 5px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #4A90E2;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .item-description {
      color: #666;
      font-size: 12px;
      margin-top: 3px;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.grand-total {
      border-top: 2px solid #4A90E2;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #4A90E2;
    }
    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 5px;
      font-size: 13px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="logo">FlowServe AI</div>
        <p style="margin: 5px 0; color: #666;">Powered by ${invoice.businessName}</p>
      </div>
      <div class="invoice-details">
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <span class="status status-${invoice.status}">${invoice.status}</span>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
          Date: ${new Date(invoice.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>From</h3>
        <p><strong>${invoice.businessName}</strong></p>
        <p>${invoice.businessPhone}</p>
        ${invoice.businessEmail ? `<p>${invoice.businessEmail}</p>` : ''}
        ${invoice.businessAddress ? `<p>${invoice.businessAddress}</p>` : ''}
      </div>
      <div class="party">
        <h3>Bill To</h3>
        <p><strong>${invoice.customerName}</strong></p>
        <p>${invoice.customerPhone}</p>
        ${invoice.customerEmail ? `<p>${invoice.customerEmail}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₦${item.unitPrice.toLocaleString()}</td>
            <td style="text-align: right;"><strong>₦${item.total.toLocaleString()}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₦${invoice.subtotal.toLocaleString()}</span>
      </div>
      ${invoice.tax > 0 ? `
      <div class="total-row">
        <span>Tax:</span>
        <span>₦${invoice.tax.toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>₦${invoice.total.toLocaleString()}</span>
      </div>
    </div>

    ${invoice.notes ? `
    <div class="notes">
      <strong>Notes:</strong><br>
      ${invoice.notes}
    </div>
    ` : ''}

    <div class="footer">
      <p>Payment Method: ${invoice.paymentMethod === 'card' ? 'Paystack (Card)' : 'Bank Transfer'}</p>
      <p>Thank you for your business!</p>
      <p style="margin-top: 20px;">This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateInvoiceText(invoice: InvoiceData): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice #: ${invoice.invoiceNumber}
Status: ${invoice.status.toUpperCase()}
Date: ${new Date(invoice.orderDate).toLocaleDateString()}

FROM:
${invoice.businessName}
${invoice.businessPhone}
${invoice.businessEmail || ''}

BILL TO:
${invoice.customerName}
${invoice.customerPhone}
${invoice.customerEmail || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${invoice.items.map(item => `
${item.name}
${item.description}
Qty: ${item.quantity} × ₦${item.unitPrice.toLocaleString()} = ₦${item.total.toLocaleString()}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal: ₦${invoice.subtotal.toLocaleString()}
${invoice.tax > 0 ? `Tax: ₦${invoice.tax.toLocaleString()}\n` : ''}
TOTAL: ₦${invoice.total.toLocaleString()}

Payment Method: ${invoice.paymentMethod === 'card' ? 'Paystack' : 'Bank Transfer'}

${invoice.notes ? `\nNotes:\n${invoice.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your business!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim()
}
