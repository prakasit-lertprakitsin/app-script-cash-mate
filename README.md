# CashMate

CashMate is a web-based income & expense management system for small businesses, built with Google Apps Script and modern web technologies. It helps you record, track, and analyze your shop's financial transactions with ease.

## Features

- **User Authentication**: Secure login system for users.
- **Dashboard**: Overview of total income, expenses, cost, and profit with summary cards and charts.
- **Add Transactions**: Quickly add new income, expense, or cost records with category selection and details.
- **View Transactions**: Filter, search, edit, and delete transaction records by type, category, date, and more.
- **Reports**: Generate summary reports with filters, bar/pie charts, and export to PDF/Excel.
- **Category Management**: Add, edit, and delete categories for each transaction type.
- **Responsive UI**: Modern, mobile-friendly interface using Bootstrap 5.

## Technology Stack

- **Google Apps Script** (backend, data storage in Google Sheets)
- **HTML5/CSS3** (frontend)
- **Bootstrap 5** (UI framework)
- **Chart.js** (data visualization)
- **Moment.js** (date handling)
- **jsPDF, html2canvas, xlsx** (report export)

## File Structure

```
  ├── code.gs                # Google Apps Script backend
  ├── index.html             # Main SPA entry point
  ├── login.html             # Login form
  ├── dashboard.html         # Dashboard page
  ├── add-transaction.html   # Add transaction page
  ├── view-transactions.html # View/edit/delete transactions
  ├── reports.html           # Reports and export
  ├── categories.html        # Category management
  ├── script.html            # Main JS logic (frontend)
  ├── styles.html            # Custom styles
  ├── CashMate_Flowchart.mmd     # System flowchart (Mermaid)
```

## Getting Started

1. **Deploy as Google Apps Script Web App**
   - Open `src/code.gs` in Google Apps Script Editor.
   - Deploy as a Web App (set access to "Anyone" or as needed).
   - Copy the deployment URL.
2. **Access the Web App**
   - Open the deployment URL in your browser.
   - Login with your credentials (default admin may be set in code).
3. **Start Managing**
   - Add categories, record transactions, view dashboard and reports.

## Notes
- All data is stored in a Google Sheet (see `SHEET_ID` in `code.gs`).
- The system supports multiple transaction types: Income, Expense, Cost.
- Export reports as PDF or Excel for further analysis.
- UI is optimized for both desktop and mobile devices.

## License
MIT 