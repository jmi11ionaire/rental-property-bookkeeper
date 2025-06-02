# Reseller Bookkeeping Suite

A comprehensive bookkeeping solution for resellers, featuring intelligent PDF data extraction and financial tracking.

## 🚀 Features

### Main Bookkeeping App (`index.html`)
- **Transaction Management**: Add, edit, and delete income/expense transactions
- **Real-time Calculations**: Automatic profit/loss tracking and tax calculations
- **Data Export**: Export financial data to CSV for accounting software
- **Data Import**: Import sales data from PDF converters or CSV files
- **Backup & Restore**: Save and restore your financial data
- **Tax Estimation**: Estimate quarterly taxes based on current income

### PDF to CSV Converter (`pdf_converter.html`)
- **Multi-Platform Support**: Automatic detection and parsing of eBay, Etsy, and generic PDFs
- **Drag & Drop Upload**: Easy file upload with progress tracking
- **Intelligent Parsing**: Platform-specific algorithms extract:
  - Order dates and numbers
  - Item names and descriptions
  - Sale prices and fees
  - Shipping costs
  - Buyer information
- **Data Validation**: Review and edit extracted data before export
- **CSV Export**: Generate CSV files ready for import into the main bookkeeping app

## 📁 File Structure

```
reseller-bookkeeper/
├── index.html          # Main bookkeeping application
├── pdf_converter.html  # PDF to CSV converter tool
├── app.js             # Main application logic
├── styles.css         # Application styling
├── README.md          # Documentation (this file)
└── ebay_sales_import.csv  # Sample import data
```

## 🎯 Getting Started

### 1. Main Bookkeeping App
1. Open `index.html` in your web browser
2. Add your income and expense transactions
3. Use the dashboard to track your financial performance
4. Export data for tax preparation or accounting software

### 2. PDF Data Extraction
1. Open `pdf_converter.html` in your web browser
2. Upload your platform PDF files (eBay, Etsy, etc.)
3. Select the appropriate platform or use auto-detection
4. Review and edit the extracted data
5. Download the CSV file
6. Import the CSV into the main bookkeeping app

## 🔧 Technical Features

### Supported PDF Formats
- **eBay**: Order statements and seller reports
- **Etsy**: Order receipts and sales summaries  
- **Generic**: Any PDF with date and price patterns

### Data Fields Extracted
- Transaction Date
- Item Name/Description
- Platform (eBay, Etsy, etc.)
- Sale Price
- Platform Fees
- Shipping Costs
- Buyer Information
- Purchase Price (manually entered)

### Export Formats
- CSV (Comma Separated Values)
- Compatible with Excel, Google Sheets, QuickBooks, and other accounting software

## 💡 Usage Tips

1. **Regular Backups**: Use the backup feature in the main app to save your data regularly
2. **Batch Processing**: The PDF converter can handle multiple files at once
3. **Data Validation**: Always review extracted PDF data before importing
4. **Tax Tracking**: Update the tax rate setting to match your local requirements
5. **Purchase Prices**: Remember to add purchase prices to extracted data for accurate profit calculations

## 🐛 Troubleshooting

### PDF Converter Issues
- Ensure PDFs are text-based (not scanned images)
- Try selecting the specific platform instead of auto-detect
- Check browser console for detailed error messages

### Import Issues
- Verify CSV format matches the expected structure
- Check for special characters in item names
- Ensure date formats are consistent

## 🔄 Data Flow

```
PDF Files → PDF Converter → CSV Export → Main App Import → Financial Tracking
```

## 📊 Financial Calculations

The app automatically calculates:
- **Gross Revenue**: Total sales income
- **Total Expenses**: All business costs
- **Net Profit**: Revenue minus expenses and fees
- **Tax Estimates**: Based on configurable tax rate
- **Profit Margins**: Per-item and overall profitability

## 🎉 Ready for Production

This suite has been thoroughly tested and optimized for:
- ✅ Real PDF file processing
- ✅ Multi-platform data extraction
- ✅ Accurate financial calculations
- ✅ Data import/export functionality
- ✅ User-friendly interface
- ✅ Error handling and validation

Start tracking your reseller business finances today!
