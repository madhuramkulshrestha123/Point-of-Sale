import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format currency with INR prefix and comma separators
 */
function formatCurrency(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 'INR 0.00';
  
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `INR ${formatted}`;
}

/**
 * Export Payments Report as PDF
 * @param {Array} data - Payments data
 * @param {Object} summary - Summary statistics
 * @param {Object} filters - Applied filters
 */
export const exportPaymentsPDF = async (data, summary, filters) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // ==================== HEADER SECTION ====================
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('M.K EXPORTS', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('123, Auto Parts Market, Delhi', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(8);
  doc.text('GSTIN: 07ABCDE1234F1Z5', pageWidth / 2, 29, { align: 'center' });

  doc.setFontSize(7);
  doc.text('Contact: +91-9876543210', pageWidth / 2, 33, { align: 'center' });

  // Horizontal divider
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.8);
  doc.line(margin, 36, pageWidth - margin, 36);

  // ==================== REPORT TITLE ====================
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PAYMENTS & SALES REPORT', pageWidth / 2, 44, { align: 'center' });

  // Date range
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const dateRangeText = filters?.startDate && filters?.endDate
    ? `From ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`
    : 'All Dates';
  doc.text(dateRangeText, pageWidth / 2, 50, { align: 'center' });

  // Filter info
  let filterYPos = 55;
  if (filters?.paymentStatus) {
    doc.text(`Status: ${filters.paymentStatus.toUpperCase()}`, pageWidth / 2, filterYPos, { align: 'center' });
    filterYPos += 5;
  }

  // ==================== SUMMARY GRID ====================
  let summaryYPos = filterYPos + 3;
  
  const summaryItems = [
    { label: 'Total Orders', value: (summary.totalOrders || 0).toString() },
    { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue || 0) },
    { label: 'Total Paid', value: formatCurrency(summary.totalPaid || 0) },
    { label: 'Total Pending', value: formatCurrency(summary.totalPending || 0) },
  ];

  const boxWidth = (contentWidth - 10) / 2;
  const boxHeight = 16;
  
  summaryItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (col * (boxWidth + 10));
    const y = summaryYPos + (row * (boxHeight + 6));

    // Box background
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'F');

    // Left border accent
    doc.setFillColor(34, 197, 94);
    doc.rect(x, y, 2, boxHeight, 'F');

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + 6, y + 6);

    // Value
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(item.value, x + 6, y + 12);
  });

  // Calculate next Y position
  const tableStartY = summaryYPos + (boxHeight * 2) + 6;

  // ==================== MAIN TABLE ====================
  const tableData = data.map((payment) => {
    const saleData = payment.sale || payment;
    const invoiceNumber = payment.invoiceNumber || saleData.invoiceNumber || 'N/A';
    const date = formatDate(payment.createdAt || saleData.createdAt);
    const customer = saleData.customer?.name || 'Walk-in';
    const method = (payment.paymentMethod || 'N/A').toUpperCase();
    const status = (payment.status || saleData.paymentStatus || 'N/A').toUpperCase();
    const totalAmount = saleData.finalAmount || payment.amount || 0;
    const paidAmount = payment.amount || saleData.amountPaid || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    return [
      invoiceNumber,
      date,
      customer,
      method,
      status,
      formatCurrency(totalAmount),
      formatCurrency(paidAmount),
      formatCurrency(dueAmount),
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      'Invoice #',
      'Date',
      'Customer',
      'Method',
      'Status',
      'Total',
      'Paid',
      'Due',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', fontSize: 7 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 40 },
      3: { cellWidth: 20, halign: 'center', fontSize: 7 },
      4: { cellWidth: 24, halign: 'center', fontStyle: 'bold', fontSize: 7 },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 28, halign: 'right' },
      7: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Header on each page
      if (data.pageNumber > 1) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('M.K EXPORTS', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENTS & SALES REPORT', pageWidth / 2, 21, { align: 'center' });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      
      const currentDate = new Date();
      const generatedText = `Generated on: ${currentDate.toLocaleDateString('en-IN')} ${currentDate.toLocaleTimeString('en-IN')}`;
      doc.text(generatedText, margin, pageHeight - 10);
      
      doc.text('Powered by AutoParts POS', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      const totalPages = doc.internal.getNumberOfPages();
      doc.text(
        `Page ${data.pageNumber} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    },
  });

  // ==================== BUSINESS SUMMARY ====================
  let finalY = doc.lastAutoTable.finalY + 10;

  if (summary.totalCost !== undefined && summary.netProfit !== undefined) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Business Summary', margin, finalY);
    finalY += 5;

    const businessData = [
      ['Total Revenue', formatCurrency(summary.totalRevenue || 0)],
      ['Total Cost', formatCurrency(summary.totalCost || 0)],
      ['Net Profit', formatCurrency(summary.netProfit || 0)],
      ['Profit Margin', `${summary.profitMargin || 0}%`],
    ];

    autoTable(doc, {
      startY: finalY,
      body: businessData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right', cellWidth: 80, fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin + 50 },
    });

    finalY = doc.lastAutoTable.finalY + 8;
  }

  // ==================== FINAL TOTALS BOX ====================
  const totalPaid = summary.totalPaid || 0;
  const totalDue = summary.totalPending || 0;
  const boxWidth2 = contentWidth - 40;
  const boxX = margin + 20;
  
  // Box background
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(boxX, finalY, boxWidth2, 28, 3, 3, 'F');

  // Border
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.5);
  doc.roundedRect(boxX, finalY, boxWidth2, 28, 3, 3, 'S');

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(boxX + 10, finalY + 14, boxX + boxWidth2 - 10, finalY + 14);

  // Total Paid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('TOTAL PAID', boxX + 10, finalY + 9);
  
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text(formatCurrency(totalPaid), pageWidth / 2 + 15, finalY + 9);

  // Total Credit/Due
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('TOTAL CREDIT/DUE', boxX + 10, finalY + 21);
  
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text(formatCurrency(totalDue), pageWidth / 2 + 15, finalY + 21);

  // Save PDF
  const fileName = `payments-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

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
