import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export Payments Report as PDF
 * @param {Object} options - Export options
 * @param {Array} options.data - Payments data
 * @param {Object} options.summary - Summary statistics
 * @param {Object} options.filters - Applied filters
 */
export const exportPaymentsPDF = async (data, summary, filters) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Set default font
  doc.setFont('helvetica');

  // ==================== HEADER ====================
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('M.K EXPORTS', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123, Auto Parts Market, Delhi', pageWidth / 2, 26, { align: 'center' });

  doc.setFontSize(9);
  doc.text('GSTIN: 07ABCDE1234F1Z5', pageWidth / 2, 31, { align: 'center' });

  doc.setFontSize(8);
  doc.text('Contact: +91-9876543210', pageWidth / 2, 36, { align: 'center' });

  // Horizontal divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, 39, pageWidth - 20, 39);

  // ==================== REPORT TITLE ====================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENTS & SALES REPORT', pageWidth / 2, 48, { align: 'center' });

  // Date range
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateRangeText = filters?.startDate && filters?.endDate
    ? `From ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`
    : 'All Dates';
  doc.text(dateRangeText, pageWidth / 2, 54, { align: 'center' });

  // Filter info
  if (filters?.paymentStatus) {
    doc.text(`Status: ${filters.paymentStatus.toUpperCase()}`, pageWidth / 2, 59, { align: 'center' });
  }

  // ==================== SUMMARY SECTION ====================
  let yPos = 68;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 8;

  // Summary grid - 2 columns
  const summaryData = [
    { label: 'Total Orders', value: summary.totalOrders || 0 },
    { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue || 0) },
    { label: 'Total Paid', value: formatCurrency(summary.totalPaid || 0) },
    { label: 'Total Pending', value: formatCurrency(summary.totalPending || 0) },
    { label: 'Total Customers', value: summary.totalCustomers || 0 },
  ];

  doc.setFontSize(8);
  const colWidth = 80;
  const rowHeight = 8;
  const startX = 20;
  const startY = yPos;

  // Draw summary boxes
  summaryData.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + (col * colWidth);
    const y = startY + (row * (rowHeight + 12));

    // Box background
    doc.setFillColor(col === 0 ? 240 : 250, col === 0 ? 250 : 240, 245);
    doc.rect(x, y, colWidth - 5, rowHeight + 8, 'F');

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, colWidth - 5, rowHeight + 8);

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + 3, y + 5);

    // Value
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(item.value.toString(), x + 3, y + 12);
  });

  yPos = startY + (Math.ceil(summaryData.length / 2) * (rowHeight + 12)) + 8;

  // ==================== TABLE ====================
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', 20, yPos);
  yPos += 6;

  const tableData = data.map((payment) => {
    const saleData = payment.sale || payment;
    const invoiceNumber = payment.invoiceNumber || saleData.invoiceNumber || 'N/A';
    const date = formatDate(payment.createdAt || saleData.createdAt);
    const customer = saleData.customer?.name || 'Walk-in';
    const method = (payment.paymentMethod || 'N/A').toUpperCase();
    const status = (payment.status || saleData.paymentStatus || 'N/A').toUpperCase();
    const totalAmount = saleData.finalAmount || payment.amount || 0;
    const paidAmount = payment.amount || saleData.amountPaid || 0;
    const dueAmount = totalAmount - paidAmount;

    return [
      invoiceNumber,
      date,
      customer,
      method,
      status,
      formatCurrency(totalAmount),
      formatCurrency(paidAmount),
      formatCurrency(dueAmount > 0 ? dueAmount : 0),
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [[
      'Invoice #',
      'Date',
      'Customer',
      'Method',
      'Status',
      'Total Amount',
      'Paid Amount',
      'Due Amount',
    ]],
    body: tableData,
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [34, 197, 94], // Green theme
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245], // Light grey
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 28 },
      7: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 20, right: 20 },
    theme: 'grid',
  });

  // ==================== TAX / BUSINESS SUMMARY ====================
  yPos = doc.lastAutoTable.finalY + 10;

  if (summary.totalCost !== undefined && summary.netProfit !== undefined) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Summary', 20, yPos);
    yPos += 6;

    const businessData = [
      ['Total Revenue', formatCurrency(summary.totalRevenue || 0)],
      ['Total Cost', formatCurrency(summary.totalCost || 0)],
      ['Net Profit', formatCurrency(summary.netProfit || 0)],
      ['Profit Margin', `${summary.profitMargin || 0}%`],
    ];

    doc.autoTable({
      startY: yPos,
      body: businessData,
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right', cellWidth: 60 },
      },
      margin: { left: 20, right: 80 },
      theme: 'plain',
    });

    yPos = doc.lastAutoTable.finalY + 8;
  }

  // ==================== FINAL TOTAL SECTION ====================
  const totalPaid = summary.totalPaid || 0;
  const totalDue = summary.totalPending || 0;

  const summaryBoxY = yPos + 5;
  const summaryBoxHeight = 24;

  // Box background
  doc.setFillColor(240, 250, 240);
  doc.rect(60, summaryBoxY, pageWidth - 120, summaryBoxHeight, 'F');

  // Box border
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1);
  doc.rect(60, summaryBoxY, pageWidth - 120, summaryBoxHeight);

  // Left side - Total Paid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL PAID', 65, summaryBoxY + 9);
  
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text(formatCurrency(totalPaid), pageWidth / 2 - 5, summaryBoxY + 9);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(65, summaryBoxY + 13, pageWidth - 65, summaryBoxY + 13);

  // Right side - Total Credit/Due
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL CREDIT/DUE', 65, summaryBoxY + 20);
  
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text(formatCurrency(totalDue), pageWidth / 2 - 5, summaryBoxY + 20);

  // ==================== FOOTER ====================
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  
  const currentDate = new Date();
  const generatedText = `Generated on: ${currentDate.toLocaleDateString('en-IN')} ${currentDate.toLocaleTimeString('en-IN')}`;
  doc.text(generatedText, pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  doc.text('Powered by AutoParts POS', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save PDF
  const fileName = `payments-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Format currency with Indian Rupee symbol and comma separators
 */
function formatCurrency(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '₹0.00';
  
  // Format with Indian numbering system
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `₹${formatted}`;
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
