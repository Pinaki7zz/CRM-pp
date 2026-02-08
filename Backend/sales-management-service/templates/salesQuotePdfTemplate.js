module.exports = (quote) => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 25px;
      color: #333;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #1a237e;
    }
    .section-title {
      font-size: 15px;
      font-weight: bold;
      border-bottom: 2px solid #eee;
      margin-top: 25px;
      margin-bottom: 10px;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      text-align: left;
      background: #f5f5f5;
      padding: 8px;
      border: 1px solid #ddd;
    }
    td {
      padding: 8px;
      border: 1px solid #ddd;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>

<body>

  <div class="header">
    <div class="company-name">Galvinus</div>
    <div>
      <div><strong>Quote ID:</strong> ${quote.quoteId}</div>
      <div><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString()}</div>
      <div><strong>Status:</strong> ${quote.status}</div>
    </div>
  </div>

  <div class="section-title">Customer Information</div>
  <table>
    <tr><td><strong>Account:</strong></td><td>${quote.accountName || "-"}</td></tr>
    <tr><td><strong>Primary Contact:</strong></td><td>${quote.contactName || "-"}</td></tr>
  </table>

  <div class="section-title">Items</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Tax %</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${quote.items
			.map(
				(item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice}</td>
          <td>${item.tax || 0}</td>
          <td>${item.totalPrice}</td>
        </tr>
      `
			)
			.join("")}
    </tbody>
  </table>

  <div class="section-title">Total Summary</div>
  <table>
    <tr><td><strong>Subtotal</strong></td><td>${quote.amount}</td></tr>
    <tr><td><strong>Success Rate</strong></td><td>${quote.successRate || 0}%</td></tr>
  </table>

  <div class="footer">
    Thank you for your business!<br/>
    This is a system-generated quotation.
  </div>

</body>
</html>
`;
};
