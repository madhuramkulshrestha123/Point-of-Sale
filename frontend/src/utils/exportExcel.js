import * as XLSX from 'xlsx';

/**
 * Export Payments Report as Excel
 * @param {Array} data - Payments data
 * @param {Object} summary - Summary statistics
 * @param {Object} filters - Applied filters
 * @param {Object} user - User data (optional)
 */
export const exportPaymentsExcel = async (data, summary, filters, user = null) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare worksheet data
  const wsData = [];

  // Header section with user's business info
  if (user?.businessName) {
    wsData.push([user.businessName.toUpperCase()]);
    if (user?.phone) wsData.push([`Phone: ${user.phone}`]);
    if (user?.email) wsData.push([`Email: ${user.email}`]);
  } else {
    wsData.push(['POS System']);
  }
  wsData.push(['']);

  // Report title and filters
  const dateRangeText = filters?.startDate && filters?.endDate
    ? `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`
    : 'All Dates';
  
  wsData.push(['PAYMENTS & SALES REPORT']);
  wsData.push([`Period: ${dateRangeText}`]);
  if (filters?.paymentStatus) {
    wsData.push([`Status: ${filters.paymentStatus.toUpperCase()}`]);
  }
  wsData.push(['']);

  // Summary section
  wsData.push(['SUMMARY']);
  wsData.push(['Total Orders', summary.totalOrders || 0]);
  wsData.push(['Total Revenue', formatCurrencyValue(summary.totalRevenue || 0)]);
  wsData.push(['Total Paid', formatCurrencyValue(summary.totalPaid || 0)]);
  wsData.push(['Total Pending', formatCurrencyValue(summary.totalPending || 0)]);
  wsData.push(['Total Customers', summary.totalCustomers || 0]);
  wsData.push(['']);

  // Main data table header
  wsData.push([
    'Invoice Number',
    'Date',
    'Customer',
    'Payment Method',
    'Status',
    'Total Amount',
    'Paid Amount',
    'Due Amount',
  ]);

  // Main data rows
  data.forEach((payment) => {
    const saleData = payment.sale || payment;
    const invoiceNumber = payment.invoiceNumber || saleData.invoiceNumber || 'N/A';
    const date = formatDate(payment.createdAt || saleData.createdAt);
    const customer = saleData.customer?.name || 'Walk-in';
    const method = (payment.paymentMethod || 'N/A').toUpperCase();
    const status = (payment.status || saleData.paymentStatus || 'N/A').toUpperCase();
    const totalAmount = saleData.finalAmount || payment.amount || 0;
    const paidAmount = payment.amount || saleData.amountPaid || 0;
    const dueAmount = totalAmount - paidAmount;

    wsData.push([
      invoiceNumber,
      date,
      customer,
      method,
      status,
      totalAmount,
      paidAmount,
      dueAmount > 0 ? dueAmount : 0,
    ]);
  });

  // Empty row
  wsData.push(['']);

  // Totals row
  const totalRevenue = data.reduce((sum, payment) => {
    const saleData = payment.sale || payment;
    return sum + (saleData.finalAmount || payment.amount || 0);
  }, 0);

  const totalPaid = data.reduce((sum, payment) => {
    return sum + (payment.amount || saleData.amountPaid || 0);
  }, 0);

  const totalPending = totalRevenue - totalPaid;

  wsData.push([
    '',
    '',
    '',
    '',
    'TOTAL',
    formatCurrencyValue(totalRevenue),
    formatCurrencyValue(totalPaid),
    formatCurrencyValue(totalPending),
  ]);

  // Business summary (if available)
  if (summary.totalCost !== undefined && summary.netProfit !== undefined) {
    wsData.push(['']);
    wsData.push(['BUSINESS SUMMARY']);
    wsData.push(['Total Revenue', formatCurrencyValue(summary.totalRevenue || 0)]);
    wsData.push(['Total Cost', formatCurrencyValue(summary.totalCost || 0)]);
    wsData.push(['Net Profit', formatCurrencyValue(summary.netProfit || 0)]);
    wsData.push(['Profit Margin', `${summary.profitMargin || 0}%`]);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Invoice Number
    { wch: 15 }, // Date
    { wch: 25 }, // Customer
    { wch: 18 }, // Payment Method
    { wch: 15 }, // Status
    { wch: 18 }, // Total Amount
    { wch: 18 }, // Paid Amount
    { wch: 18 }, // Due Amount
  ];

  // Merge cells for header
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Business name
    { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // Report title
  ];

  // Freeze header row (row 15 is where the main table starts - index 14)
  ws['!freeze'] = { xSplit: 0, ySplit: 15 };

  // Apply styles
  applyStyles(ws, wsData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Payments Report');

  // Generate and download file
  const fileName = `payments-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Apply formatting to worksheet cells
 */
function applyStyles(ws, wsData) {
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Iterate through all cells
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      // Header row styling (row 14 - main data table header)
      if (R === 14) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          fill: { fgColor: { rgb: '22C55E' } }, // Green theme
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }

      // Data rows styling (rows 15+)
      if (R >= 15 && R < 15 + (wsData.length - 20)) {
        const cell = ws[cellAddress];
        cell.s = {
          alignment: { vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
          },
        };

        // Alternating row colors
        if (R % 2 === 0) {
          cell.s.fill = { fgColor: { rgb: 'F5F5F5' } };
        }

        // Currency formatting for amount columns
        if (C >= 5 && C <= 7) {
          cell.s.numFmt = '₹#,##0.00';
          cell.s.alignment = { horizontal: 'right', vertical: 'center' };
        }

        // Center alignment for certain columns
        if (C === 3 || C === 4) {
          cell.s.alignment = { horizontal: 'center', vertical: 'center' };
        }
      }

      // Totals row styling
      if (R === wsData.length - 5) {
        for (let c = 0; c <= 7; c++) {
          const addr = XLSX.utils.encode_cell({ r: R, c });
          if (ws[addr]) {
            ws[addr].s = {
              font: { bold: true, color: { rgb: '000000' }, sz: 11 },
              fill: { fgColor: { rgb: 'E0E0E0' } },
              alignment: { horizontal: C >= 5 ? 'right' : 'center', vertical: 'center' },
              border: {
                top: { style: 'medium', color: { rgb: '000000' } },
                bottom: { style: 'medium', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } },
              },
              numFmt: C >= 5 ? '₹#,##0.00' : undefined,
            };
          }
        }
      }
    }
  }
}

/**
 * Format currency value for Excel
 */
function formatCurrencyValue(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 0;
  return numAmount;
}

/**
 * Format date to DD-MM-YYYY
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}
