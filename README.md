# Rental Property Bookkeeper

A comprehensive web-based application for tracking rental property income, expenses, security deposits, and generating financial reports. Built with vanilla HTML, CSS, and JavaScript with IndexedDB for local data storage.

## Features

### 📊 Dashboard Overview
- **Total Income**: Current year rental income summary
- **Total Expenses**: Current year expense tracking
- **Net Income**: Automatic calculation of profit/loss
- **Security Deposits**: Track held security deposits

### 💰 Income Management
- Record rental payments, late fees, pet fees, and other income
- Property-specific tracking
- Date and description support
- Edit and delete existing entries

### 📝 Expense Tracking
- Categorized expense tracking (maintenance, utilities, insurance, etc.)
- Tax-deductible expense flagging
- Property-specific expense allocation
- Professional expense categories for tax reporting

### 🔒 Security Deposit Management
- Track security deposits by tenant and property
- Status tracking (Held, Returned, Applied to Damages)
- Tenant name association
- Easy status updates

### 📈 Financial Reports
- Year-based financial reporting
- Income breakdown by type and property
- Expense categorization and analysis
- Tax-deductible expense summaries
- Property-specific financial insights

### 💾 Data Management
- **Local Storage**: All data stored locally using IndexedDB
- **Export**: Download complete data backup as JSON
- **Import**: Restore data from backup files
- **Privacy**: No data sent to external servers

## Getting Started

### Installation
1. Download the project files
2. Open `index.html` in your web browser
3. Start adding your rental income and expenses

### Usage

#### Adding Income
1. Click the "Add Income" button in the Income tab
2. Fill in the date, property address, amount, and type
3. Add an optional description
4. Click "Save" to record the income

#### Recording Expenses
1. Navigate to the Expenses tab
2. Click "Add Expense"
3. Select the appropriate category and mark if tax-deductible
4. Fill in property, amount, and description details
5. Save the expense entry

#### Managing Security Deposits
1. Go to the Security Deposits tab
2. Click "Add Deposit"
3. Enter tenant information and deposit amount
4. Update status as needed (Held/Returned/Applied)

#### Generating Reports
1. Visit the Reports tab
2. Select the desired year
3. Click "Generate Report" for comprehensive financial analysis

### Data Export/Import
- **Export**: Use the Export button in the header to download a backup
- **Import**: Use the Import button to restore from a backup file
- **Multi-device**: Use export/import to sync data between devices

## Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: IndexedDB for local storage
- **Icons**: Font Awesome 6
- **Responsive**: Mobile-friendly design

### Browser Compatibility
- Chrome/Chromium 60+
- Firefox 55+
- Safari 10.1+
- Edge 79+

### File Structure
```
├── index.html          # Main application file
├── styles.css          # Application styling
├── app.js             # Application logic and functionality
└── README.md          # This documentation
```

### Data Storage
All data is stored locally in your browser using IndexedDB:
- **Income entries**: Date, property, type, amount, description
- **Expense entries**: Date, property, category, amount, tax-deductible flag
- **Security deposits**: Date, property, tenant, amount, status

## Features for Property Managers

### Multi-Property Support
- Track multiple rental properties in one application
- Property-specific income and expense reporting
- Easy property identification in all records

### Tax Preparation Support
- Tax-deductible expense flagging
- Categorized expense reports
- Annual summaries for tax filing
- Professional expense categories

### Financial Analysis
- Year-over-year comparison capability
- Property performance analysis
- Cash flow tracking
- Profit/loss calculations

## Security & Privacy

- **Local-only storage**: No data transmitted to external servers
- **Offline capable**: Works without internet connection
- **Data control**: You own and control all your financial data
- **Export flexibility**: Easy data portability

## Troubleshooting

### Browser Storage
If you're not seeing saved data:
1. Ensure your browser supports IndexedDB
2. Check that you haven't disabled local storage
3. Try refreshing the page

### Import Issues
If import fails:
1. Verify the JSON file format
2. Ensure it's a valid backup from this application
3. Check file size isn't too large

### Performance
For optimal performance:
- Regular data export for backup
- Clear browser cache if experiencing issues
- Use modern browser versions

## Future Enhancements

Potential features for future versions:
- PDF report generation
- Recurring transaction support
- Multi-user/property manager support
- Advanced filtering and search
- Chart visualizations
- Cloud sync capabilities

## Support

This is an open-source project. For issues or feature requests:
1. Check existing data with export function
2. Try refreshing the application
3. Clear browser data if problems persist

---

**Note**: This application stores data locally in your browser. Remember to export your data regularly for backup purposes and before clearing browser data.
