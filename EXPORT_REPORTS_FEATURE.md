# Export Reports Feature

## Overview
The Export Reports feature allows users to export payment and sales data from the "Payments & Bills" page in both PDF and Excel formats.

## Features

### PDF Export
- Professional, print-ready PDF layout
- Business header with company information
- Summary section with key metrics
- Detailed payment table with alternating row colors
- Tax breakdown and business summary
- Final totals section (Paid vs Due)
- Footer with generation timestamp and page numbers

### Excel Export
- Clean .xlsx file with formatted data
- Frozen header row
- Bold headers with green theme
- Auto column widths
- Currency formatting (₹)
- Alternating row backgrounds
- Totals row at the bottom
- Business summary section (if available)

## Filters Applied
The export respects all currently applied filters:
- **Date Range**: From/To dates
- **Payment Status**: All/Pending/Completed (based on active tab)
- **Search**: Invoice number or customer name

## Usage

### Desktop
1. Navigate to "Payments & Bills" page
2. Apply desired filters (date range, status)
3. Click "Export PDF" or "Export Excel" button in the header
4. File will be automatically downloaded

### Mobile
1. Navigate to "Payments & Bills" page
2. Apply desired filters
3. Tap "Export PDF" or "Export Excel" buttons below the header
4. File will be automatically downloaded

## Technical Implementation

### Frontend
- **PDF Generation**: jsPDF with jspdf-autotable
- **Excel Generation**: SheetJS (xlsx)
- **Export Utilities**: 
  - `src/utils/exportPDF.js`
  - `src/utils/exportExcel.js`

### Backend
- **Endpoint**: `GET /api/payments/export`
- **Authentication**: Required (JWT token)
- **Query Parameters**:
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `paymentStatus`: completed/pending
  - `store`: Store ID (if multi-store)

### Response Data
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "summary": {
      "totalOrders": 150,
      "totalRevenue": 250000,
      "totalPaid": 200000,
      "totalPending": 50000,
      "totalCustomers": 75,
      "totalCost": 180000,
      "netProfit": 70000,
      "profitMargin": 28.00
    }
  }
}
```

## File Naming
Files are named with the format:
- `payments-report-YYYY-MM-DD.pdf`
- `payments-report-YYYY-MM-DD.xlsx`

## Currency Format
All amounts use Indian Rupee (₹) formatting with comma separators:
- Example: ₹1,50,000.00

## Date Format
All dates use DD-MM-YYYY format in exports.

## Mobile Responsiveness
- Export buttons stack vertically on mobile screens
- Full touch-friendly interface (44px minimum touch targets)
- Responsive layout adapts to screen size
- Same functionality across all devices

## Color Theme
- PDF: Green theme (#22C55E) for headers
- Excel: Green theme matching POS branding
- Buttons: Red for PDF, Green for Excel

## Error Handling
- Displays error messages if export fails
- Loading state during export (disabled buttons)
- Graceful fallback for missing data

## Notes
- No emojis in exported documents
- Professional business document appearance
- Suitable for accounting and auditing
- Consistent with POS system branding
