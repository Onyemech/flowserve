export interface InvoiceData {
  invoiceNumber: string
  businessName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  itemName: string
  amount: number
  paymentMethod: string
  date: string
}

export function generateInvoiceHTML(data: InvoiceData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #20C997; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #20C997; margin: 0; }
    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .item-row { display: flex; justify-content: space-between; padding: 10px; background: #f9f9f9; margin-bottom: 10px; }
    .total { font-size: 24px; font-weight: bold; text-align: right; color: #20C997; margin-top: 20px; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>FlowServe AI - ${data.businessName}</p>
  </div>
  
  <div class="invoice-details">
    <div>
      <strong>Invoice Number:</strong> ${data.invoiceNumber}<br>
      <strong>Date:</strong> ${data.date}
    </div>
    <div>
      <strong>Payment Method:</strong> ${data.paymentMethod}
    </div>
  </div>
  
  <div class="section">
    <h3>Bill To</h3>
    <strong>${data.customerName}</strong><br>
    ${data.customerEmail}<br>
    ${data.customerPhone}
  </div>
  
  <div class="section">
    <h3>Items</h3>
    <div class="item-row">
      <span>${data.itemName}</span>
      <span>₦${data.amount.toLocaleString()}</span>
    </div>
  </div>
  
  <div class="total">
    Total: ₦${data.amount.toLocaleString()}
  </div>
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p>This is an automated invoice from FlowServe AI</p>
  </div>
</body>
</html>
  `
}

export function generateInvoiceText(data: InvoiceData): string {
  return `
INVOICE
${data.businessName}

Invoice Number: ${data.invoiceNumber}
Date: ${data.date}

Bill To:
${data.customerName}
${data.customerEmail}
${data.customerPhone}

Item: ${data.itemName}
Amount: ₦${data.amount.toLocaleString()}

Payment Method: ${data.paymentMethod}

Total: ₦${data.amount.toLocaleString()}

Thank you for your business!
  `
}
