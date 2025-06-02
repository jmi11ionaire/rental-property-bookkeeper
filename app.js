// Rental Property Bookkeeper Application
class RentalBookkeeper {
    constructor() {
        this.dbName = 'RentalBookkeeperDB';
        this.dbVersion = 2;
        this.db = null;
        this.currentEditId = null;
        this.currentItemType = null;
        
        this.init();
    }

    async init() {
        await this.initDB();
        this.setupEventListeners();
        this.updateDashboard();
        this.loadIncomeTable();
        this.setCurrentYear();
    }

    // Database Management
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Income store
                if (!db.objectStoreNames.contains('income')) {
                    const incomeStore = db.createObjectStore('income', { keyPath: 'id', autoIncrement: true });
                    incomeStore.createIndex('date', 'date');
                    incomeStore.createIndex('property', 'property');
                    incomeStore.createIndex('type', 'type');
                }
                
                // Expenses store
                if (!db.objectStoreNames.contains('expenses')) {
                    const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
                    expenseStore.createIndex('date', 'date');
                    expenseStore.createIndex('property', 'property');
                    expenseStore.createIndex('category', 'category');
                }
                
                // Security deposits store
                if (!db.objectStoreNames.contains('deposits')) {
                    const depositStore = db.createObjectStore('deposits', { keyPath: 'id', autoIncrement: true });
                    depositStore.createIndex('date', 'date');
                    depositStore.createIndex('property', 'property');
                    depositStore.createIndex('status', 'status');
                }
                
                // Bank accounts store
                if (!db.objectStoreNames.contains('bankAccounts')) {
                    const bankAccountStore = db.createObjectStore('bankAccounts', { keyPath: 'id', autoIncrement: true });
                    bankAccountStore.createIndex('accountName', 'accountName');
                    bankAccountStore.createIndex('bank', 'bank');
                }
                
                // Credit cards store
                if (!db.objectStoreNames.contains('creditCards')) {
                    const creditCardStore = db.createObjectStore('creditCards', { keyPath: 'id', autoIncrement: true });
                    creditCardStore.createIndex('cardName', 'cardName');
                    creditCardStore.createIndex('issuer', 'issuer');
                }
                
                // Properties store
                if (!db.objectStoreNames.contains('properties')) {
                    const propertyStore = db.createObjectStore('properties', { keyPath: 'id', autoIncrement: true });
                    propertyStore.createIndex('address', 'address');
                }
            };
        });
    }

    async addItem(storeName, item) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.add(item);
    }

    async updateItem(storeName, item) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.put(item);
    }

    async deleteItem(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.delete(id);
    }

    async getItems(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getItem(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const modal = document.getElementById('modal');
        
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'modal') this.closeModal();
            });
        }

        // Add buttons
        const addIncomeBtn = document.getElementById('addIncomeBtn');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const addDepositBtn = document.getElementById('addDepositBtn');
        const addBankAccountBtn = document.getElementById('addBankAccountBtn');
        const addCreditCardBtn = document.getElementById('addCreditCardBtn');
        const addPropertyBtn = document.getElementById('addPropertyBtn');
        
        if (addIncomeBtn) addIncomeBtn.addEventListener('click', () => this.openModal('income'));
        if (addExpenseBtn) addExpenseBtn.addEventListener('click', () => this.openModal('expense'));
        if (addDepositBtn) addDepositBtn.addEventListener('click', () => this.openModal('deposit'));
        if (addBankAccountBtn) addBankAccountBtn.addEventListener('click', () => this.openModal('bankAccount'));
        if (addCreditCardBtn) addCreditCardBtn.addEventListener('click', () => this.openModal('creditCard'));
        if (addPropertyBtn) addPropertyBtn.addEventListener('click', () => this.openModal('property'));

        // Form submission
        const itemForm = document.getElementById('itemForm');
        if (itemForm) itemForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Export/Import
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelector('.dropdown').classList.toggle('active');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        });
        
        if (importBtn) importBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('importFile');
            if (fileInput) fileInput.click();
        });
        if (importFile) importFile.addEventListener('change', (e) => this.importData(e));

        // Report generation
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) generateReportBtn.addEventListener('click', () => this.generateReport());
        
        console.log('Event listeners attached successfully');
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');

        // Load appropriate data
        switch(tabName) {
            case 'income':
                this.loadIncomeTable();
                break;
            case 'expenses':
                this.loadExpenseTable();
                break;
            case 'deposits':
                this.loadDepositTable();
                break;
            case 'accounts':
                this.loadAccountTables();
                break;
            case 'reports':
                this.generateReport();
                break;
        }
    }

    // Modal Management
    openModal(type, id = null) {
        this.currentItemType = type;
        this.currentEditId = id;
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        
        // Set modal title
        const titles = {
            income: id ? 'Edit Income' : 'Add Income',
            expense: id ? 'Edit Expense' : 'Add Expense',
            deposit: id ? 'Edit Security Deposit' : 'Add Security Deposit',
            bankAccount: id ? 'Edit Bank Account' : 'Add Bank Account',
            creditCard: id ? 'Edit Credit Card' : 'Add Credit Card',
            property: id ? 'Edit Property' : 'Add Property'
        };
        title.textContent = titles[type];

        // Show/hide relevant form fields
        this.configureFormFields(type);
        
        // Load data if editing
        if (id) {
            this.loadItemForEdit(type, id);
        } else {
            this.resetForm();
        }

        // Load account and property options
        if (type === 'income' || type === 'expense' || type === 'deposit') {
            this.loadAccountOptions();
            this.loadPropertyOptions();
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
        this.resetForm();
        this.currentEditId = null;
        this.currentItemType = null;
    }

    configureFormFields(type) {
        const modalBody = document.querySelector('.modal-body');
        
        // For financial transactions, restore the original form if needed
        if (type === 'income' || type === 'expense' || type === 'deposit') {
            // Check if the form has been replaced
            if (!document.getElementById('itemDate')) {
                this.restoreOriginalForm();
            }
            
            const typeGroup = document.getElementById('typeGroup');
            const categoryGroup = document.getElementById('categoryGroup');
            const tenantGroup = document.getElementById('tenantGroup');
            const statusGroup = document.getElementById('statusGroup');
            const taxDeductibleGroup = document.getElementById('taxDeductibleGroup');
            const paidByGroup = document.getElementById('paidByGroup');
            const bankAccountGroup = document.getElementById('bankAccountGroup');
            const creditCardGroup = document.getElementById('creditCardGroup');

            // Hide all optional fields first
            [typeGroup, categoryGroup, tenantGroup, statusGroup, taxDeductibleGroup, 
             paidByGroup, bankAccountGroup, creditCardGroup].forEach(el => {
                if (el) el.style.display = 'none';
            });

            // Show relevant fields based on type
            switch(type) {
                case 'income':
                    typeGroup.style.display = 'block';
                    paidByGroup.style.display = 'block';
                    bankAccountGroup.style.display = 'block';
                    break;
                case 'expense':
                    categoryGroup.style.display = 'block';
                    taxDeductibleGroup.style.display = 'block';
                    creditCardGroup.style.display = 'block';
                    break;
                case 'deposit':
                    tenantGroup.style.display = 'block';
                    statusGroup.style.display = 'block';
                    bankAccountGroup.style.display = 'block';
                    break;
            }
        } else {
            // For accounts/properties, use custom forms
            switch(type) {
                case 'bankAccount':
                    this.configureBankAccountForm();
                    break;
                case 'creditCard':
                    this.configureCreditCardForm();
                    break;
                case 'property':
                    this.configurePropertyForm();
                    break;
            }
        }
    }

    resetForm() {
        const form = document.getElementById('itemForm');
        if (form) {
            form.reset();
            // Only set date for financial transactions
            const dateField = document.getElementById('itemDate');
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    async loadItemForEdit(type, id) {
        const storeNames = {
            income: 'income',
            expense: 'expenses', 
            deposit: 'deposits',
            bankAccount: 'bankAccounts',
            creditCard: 'creditCards',
            property: 'properties'
        };
        
        const storeName = storeNames[type];
        const item = await this.getItem(storeName, id);
        
        if (item) {
            if (type === 'bankAccount') {
                document.getElementById('accountName').value = item.accountName;
                document.getElementById('bankName').value = item.bank;
                document.getElementById('accountType').value = item.accountType;
                document.getElementById('lastFourDigits').value = item.lastFourDigits;
            } else if (type === 'creditCard') {
                document.getElementById('cardName').value = item.cardName;
                document.getElementById('issuer').value = item.issuer;
                document.getElementById('cardType').value = item.cardType;
                document.getElementById('lastFourDigits').value = item.lastFourDigits;
            } else if (type === 'property') {
                document.getElementById('propertyAddress').value = item.address;
            } else {
                document.getElementById('itemDate').value = item.date;
                document.getElementById('itemProperty').value = item.property;
                document.getElementById('itemAmount').value = item.amount;
                document.getElementById('itemDescription').value = item.description || '';
                
                if (type === 'income') {
                    document.getElementById('itemType').value = item.type;
                    document.getElementById('itemPaidBy').value = item.paidBy || '';
                    document.getElementById('itemBankAccount').value = item.bankAccount || '';
                } else if (type === 'expense') {
                    document.getElementById('itemCategory').value = item.category;
                    document.getElementById('itemTaxDeductible').checked = item.taxDeductible || false;
                    document.getElementById('itemCreditCard').value = item.creditCard || '';
                } else if (type === 'deposit') {
                    document.getElementById('itemTenant').value = item.tenant || '';
                    document.getElementById('itemStatus').value = item.status;
                    document.getElementById('itemBankAccount').value = item.bankAccount || '';
                }
            }
        }
    }

    // Form Handling
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        if (this.currentItemType === 'bankAccount') {
            const item = {
                accountName: formData.get('accountName'),
                bank: formData.get('bank'),
                accountType: formData.get('accountType'),
                lastFourDigits: formData.get('lastFourDigits') || ''
            };
            
            try {
                if (this.currentEditId) {
                    item.id = this.currentEditId;
                    await this.updateItem('bankAccounts', item);
                } else {
                    await this.addItem('bankAccounts', item);
                }
                
                this.closeModal();
                this.loadAccountTables();
            } catch (error) {
                console.error('Error saving bank account:', error);
                alert('Error saving bank account. Please try again.');
            }
            return;
        }
        
        if (this.currentItemType === 'creditCard') {
            const item = {
                cardName: formData.get('cardName'),
                issuer: formData.get('issuer'),
                cardType: formData.get('cardType'),
                lastFourDigits: formData.get('lastFourDigits') || ''
            };
            
            try {
                if (this.currentEditId) {
                    item.id = this.currentEditId;
                    await this.updateItem('creditCards', item);
                } else {
                    await this.addItem('creditCards', item);
                }
                
                this.closeModal();
                this.loadAccountTables();
            } catch (error) {
                console.error('Error saving credit card:', error);
                alert('Error saving credit card. Please try again.');
            }
            return;
        }
        
        if (this.currentItemType === 'property') {
            const item = {
                address: formData.get('address')
            };
            
            try {
                if (this.currentEditId) {
                    item.id = this.currentEditId;
                    await this.updateItem('properties', item);
                } else {
                    await this.addItem('properties', item);
                }
                
                this.closeModal();
                this.loadAccountTables();
            } catch (error) {
                console.error('Error saving property:', error);
                alert('Error saving property. Please try again.');
            }
            return;
        }
        
        // Handle regular financial transactions
        const item = {
            date: formData.get('date'),
            property: formData.get('property'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description') || ''
        };

        // Add type-specific fields
        if (this.currentItemType === 'income') {
            item.type = formData.get('type');
            item.paidBy = formData.get('paidBy') || '';
            item.bankAccount = formData.get('bankAccount') || '';
        } else if (this.currentItemType === 'expense') {
            item.category = formData.get('category');
            item.taxDeductible = formData.has('taxDeductible');
            item.creditCard = formData.get('creditCard') || '';
        } else if (this.currentItemType === 'deposit') {
            item.tenant = formData.get('tenant') || '';
            item.status = formData.get('status');
            item.bankAccount = formData.get('bankAccount') || '';
        }

        const storeName = this.currentItemType === 'income' ? 'income' : 
                         this.currentItemType === 'expense' ? 'expenses' : 'deposits';

        try {
            if (this.currentEditId) {
                item.id = this.currentEditId;
                await this.updateItem(storeName, item);
            } else {
                await this.addItem(storeName, item);
                // Save property address for future use
                await this.savePropertyAddress(item.property);
            }
            
            this.closeModal();
            this.updateDashboard();
            
            // Refresh the current table
            if (this.currentItemType === 'income') {
                this.loadIncomeTable();
            } else if (this.currentItemType === 'expense') {
                this.loadExpenseTable();
            } else {
                this.loadDepositTable();
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item. Please try again.');
        }
    }

    // Table Loading
    async loadIncomeTable() {
        const income = await this.getItems('income');
        const tbody = document.querySelector('#incomeTable tbody');
        
        if (income.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div><i class="fas fa-inbox"></i><h3>No income recorded</h3><p>Add your first rental income entry to get started.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = income
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => `
                <tr>
                    <td>${this.formatDate(item.date)}</td>
                    <td>${item.property}</td>
                    <td>${this.formatType(item.type)}</td>
                    <td>${this.formatCurrency(item.amount)}</td>
                    <td>${item.description || '-'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.openModal('income', ${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('income', ${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    async loadExpenseTable() {
        const expenses = await this.getItems('expenses');
        const tbody = document.querySelector('#expenseTable tbody');
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div><i class="fas fa-inbox"></i><h3>No expenses recorded</h3><p>Add your first expense to start tracking deductions.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => `
                <tr>
                    <td>${this.formatDate(item.date)}</td>
                    <td>${item.property}</td>
                    <td>${this.formatCategory(item.category)}</td>
                    <td>${this.formatCurrency(item.amount)}</td>
                    <td>${item.description || '-'}</td>
                    <td>
                        ${item.taxDeductible ? '<span class="status-badge status-returned">Yes</span>' : '<span class="status-badge status-applied">No</span>'}
                    </td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.openModal('expense', ${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('expenses', ${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    async loadDepositTable() {
        const deposits = await this.getItems('deposits');
        const tbody = document.querySelector('#depositTable tbody');
        
        if (deposits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div><i class="fas fa-inbox"></i><h3>No security deposits recorded</h3><p>Add security deposits to track tenant funds.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = deposits
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(item => `
                <tr>
                    <td>${this.formatDate(item.date)}</td>
                    <td>${item.property}</td>
                    <td>${item.tenant || '-'}</td>
                    <td>${this.formatCurrency(item.amount)}</td>
                    <td><span class="status-badge status-${item.status}">${this.formatStatus(item.status)}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.openModal('deposit', ${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('deposits', ${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    // Dashboard Updates
    async updateDashboard() {
        const currentYear = new Date().getFullYear();
        const income = await this.getItems('income');
        const expenses = await this.getItems('expenses');
        const deposits = await this.getItems('deposits');

        // Filter by current year
        const currentYearIncome = income.filter(item => new Date(item.date).getFullYear() === currentYear);
        const currentYearExpenses = expenses.filter(item => new Date(item.date).getFullYear() === currentYear);
        const heldDeposits = deposits.filter(item => item.status === 'held');

        // Calculate totals
        const totalIncome = currentYearIncome.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = currentYearExpenses.reduce((sum, item) => sum + item.amount, 0);
        const totalDeposits = heldDeposits.reduce((sum, item) => sum + item.amount, 0);
        const netIncome = totalIncome - totalExpenses;

        // Update dashboard
        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('netIncome').textContent = this.formatCurrency(netIncome);
        document.getElementById('totalDeposits').textContent = this.formatCurrency(totalDeposits);

        // Update net income color
        const netIncomeEl = document.getElementById('netIncome');
        netIncomeEl.className = netIncome >= 0 ? 'amount' : 'amount expense';
    }

    // Delete Operations
    async deleteItemConfirm(storeName, id) {
        if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            try {
                await this.deleteItem(storeName, id);
                
                // Refresh appropriate tables based on what was deleted
                if (storeName === 'income') {
                    this.updateDashboard();
                    this.loadIncomeTable();
                } else if (storeName === 'expenses') {
                    this.updateDashboard();
                    this.loadExpenseTable();
                } else if (storeName === 'deposits') {
                    this.updateDashboard();
                    this.loadDepositTable();
                } else if (storeName === 'bankAccounts' || storeName === 'creditCards' || storeName === 'properties') {
                    this.loadAccountTables();
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
            }
        }
    }

    // Export/Import
    async exportData(format = 'csv') {
        try {
            // Gather all data
            const data = {
                income: await this.getItems('income'),
                expenses: await this.getItems('expenses'),
                deposits: await this.getItems('deposits'),
                bankAccounts: await this.getItems('bankAccounts'),
                creditCards: await this.getItems('creditCards'),
                properties: await this.getItems('properties'),
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            if (format === 'json') {
                // Original JSON export
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rental-bookkeeper-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // CSV export - create separate files for each type
                this.exportToCSV(data);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    exportToCSV(data) {
        // Export transactions as a combined CSV
        const transactions = [];
        
        // Add income records
        data.income.forEach(item => {
            transactions.push({
                Date: item.date,
                Type: 'Income',
                Property: item.property,
                Amount: item.amount,
                Description: item.description || '',
                Category: '',
                'Income Type': this.formatType(item.type),
                'Paid By': item.paidBy || '',
                'Tax Deductible': '',
                'Credit Card': '',
                Tenant: '',
                Status: '',
                'Bank Account': item.bankAccount || ''
            });
        });
        
        // Add expense records
        data.expenses.forEach(item => {
            transactions.push({
                Date: item.date,
                Type: 'Expense',
                Property: item.property,
                Amount: -item.amount, // Negative for expenses
                Description: item.description || '',
                Category: this.formatCategory(item.category),
                'Income Type': '',
                'Paid By': '',
                'Tax Deductible': item.taxDeductible ? 'Yes' : 'No',
                'Credit Card': item.creditCard || '',
                Tenant: '',
                Status: '',
                'Bank Account': ''
            });
        });
        
        // Add deposit records
        data.deposits.forEach(item => {
            transactions.push({
                Date: item.date,
                Type: 'Security Deposit',
                Property: item.property,
                Amount: item.amount,
                Description: item.description || '',
                Category: '',
                'Income Type': '',
                'Paid By': '',
                'Tax Deductible': '',
                'Credit Card': '',
                Tenant: item.tenant || '',
                Status: this.formatStatus(item.status),
                'Bank Account': item.bankAccount || ''
            });
        });
        
        // Sort by date
        transactions.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        
        // Convert to CSV
        const csv = this.convertToCSV(transactions);
        this.downloadCSV(csv, `rental-transactions-${new Date().toISOString().split('T')[0]}.csv`);
        
        // Also export accounts separately if they exist
        if (data.properties.length > 0) {
            const propertiesCSV = this.convertToCSV(data.properties.map(p => ({ Address: p.address })));
            this.downloadCSV(propertiesCSV, `properties-${new Date().toISOString().split('T')[0]}.csv`);
        }
        
        if (data.bankAccounts.length > 0 || data.creditCards.length > 0) {
            const accounts = [];
            data.bankAccounts.forEach(account => {
                accounts.push({
                    Type: 'Bank Account',
                    Name: account.accountName,
                    'Bank/Issuer': account.bank,
                    'Account/Card Type': this.formatAccountType(account.accountType),
                    'Last 4 Digits': account.lastFourDigits || ''
                });
            });
            data.creditCards.forEach(card => {
                accounts.push({
                    Type: 'Credit Card',
                    Name: card.cardName,
                    'Bank/Issuer': card.issuer,
                    'Account/Card Type': this.formatCardType(card.cardType),
                    'Last 4 Digits': card.lastFourDigits || ''
                });
            });
            const accountsCSV = this.convertToCSV(accounts);
            this.downloadCSV(accountsCSV, `accounts-${new Date().toISOString().split('T')[0]}.csv`);
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        // Get headers
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        // Convert data to CSV rows
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma or quote
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
                    ? `"${escaped}"` 
                    : escaped;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.income || !data.expenses || !data.deposits) {
                throw new Error('Invalid backup file format');
            }

            if (confirm('This will replace all existing data. Are you sure you want to continue?')) {
                // Clear existing data
                await this.clearAllData();

                // Import new data
                for (const item of data.income) {
                    delete item.id; // Let DB assign new IDs
                    await this.addItem('income', item);
                }

                for (const item of data.expenses) {
                    delete item.id;
                    await this.addItem('expenses', item);
                }

                for (const item of data.deposits) {
                    delete item.id;
                    await this.addItem('deposits', item);
                }

                // Refresh UI
                this.updateDashboard();
                this.loadIncomeTable();
                alert('Data imported successfully!');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please check the file format and try again.');
        }

        // Reset file input
        event.target.value = '';
    }

    async clearAllData() {
        const stores = ['income', 'expenses', 'deposits'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await store.clear();
        }
    }

    // Reports
    async generateReport() {
        const year = parseInt(document.getElementById('reportYear').value);
        const income = await this.getItems('income');
        const expenses = await this.getItems('expenses');

        // Filter by selected year
        const yearIncome = income.filter(item => new Date(item.date).getFullYear() === year);
        const yearExpenses = expenses.filter(item => new Date(item.date).getFullYear() === year);

        this.generateIncomeReport(yearIncome);
        this.generateExpenseReport(yearExpenses);
        this.generateTaxReport(yearExpenses.filter(item => item.taxDeductible));
    }

    generateIncomeReport(income) {
        const incomeByType = {};
        const incomeByProperty = {};

        income.forEach(item => {
            incomeByType[item.type] = (incomeByType[item.type] || 0) + item.amount;
            incomeByProperty[item.property] = (incomeByProperty[item.property] || 0) + item.amount;
        });

        const total = income.reduce((sum, item) => sum + item.amount, 0);

        const html = `
            <div class="report-summary">
                <h4>Total Income: ${this.formatCurrency(total)}</h4>
                
                <h5>By Type:</h5>
                <ul>
                    ${Object.entries(incomeByType).map(([type, amount]) => 
                        `<li>${this.formatType(type)}: ${this.formatCurrency(amount)}</li>`
                    ).join('')}
                </ul>
                
                <h5>By Property:</h5>
                <ul>
                    ${Object.entries(incomeByProperty).map(([property, amount]) => 
                        `<li>${property}: ${this.formatCurrency(amount)}</li>`
                    ).join('')}
                </ul>
            </div>
        `;

        document.getElementById('incomeReport').innerHTML = html;
    }

    generateExpenseReport(expenses) {
        const expensesByCategory = {};
        const expensesByProperty = {};

        expenses.forEach(item => {
            expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
            expensesByProperty[item.property] = (expensesByProperty[item.property] || 0) + item.amount;
        });

        const total = expenses.reduce((sum, item) => sum + item.amount, 0);

        const html = `
            <div class="report-summary">
                <h4>Total Expenses: ${this.formatCurrency(total)}</h4>
                
                <h5>By Category:</h5>
                <ul>
                    ${Object.entries(expensesByCategory).map(([category, amount]) => 
                        `<li>${this.formatCategory(category)}: ${this.formatCurrency(amount)}</li>`
                    ).join('')}
                </ul>
                
                <h5>By Property:</h5>
                <ul>
                    ${Object.entries(expensesByProperty).map(([property, amount]) => 
                        `<li>${property}: ${this.formatCurrency(amount)}</li>`
                    ).join('')}
                </ul>
            </div>
        `;

        document.getElementById('expenseReport').innerHTML = html;
    }

    generateTaxReport(taxDeductibleExpenses) {
        const total = taxDeductibleExpenses.reduce((sum, item) => sum + item.amount, 0);
        const byCategory = {};

        taxDeductibleExpenses.forEach(item => {
            byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
        });

        const html = `
            <div class="report-summary">
                <h4>Total Tax Deductible Expenses: ${this.formatCurrency(total)}</h4>
                
                <h5>By Category:</h5>
                <ul>
                    ${Object.entries(byCategory).map(([category, amount]) => 
                        `<li>${this.formatCategory(category)}: ${this.formatCurrency(amount)}</li>`
                    ).join('')}
                </ul>
                
                <p><small><em>Consult with a tax professional for proper deduction reporting.</em></small></p>
            </div>
        `;

        document.getElementById('taxReport').innerHTML = html;
    }

    // Utility Functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatType(type) {
        const types = {
            rent: 'Monthly Rent',
            late_fee: 'Late Fee',
            pet_fee: 'Pet Fee',
            other: 'Other'
        };
        return types[type] || type;
    }

    formatCategory(category) {
        const categories = {
            maintenance: 'Maintenance & Repairs',
            utilities: 'Utilities',
            insurance: 'Insurance',
            property_tax: 'Property Tax',
            management: 'Property Management',
            legal: 'Legal & Professional',
            advertising: 'Advertising',
            supplies: 'Supplies',
            travel: 'Travel',
            other: 'Other'
        };
        return categories[category] || category;
    }

    formatStatus(status) {
        const statuses = {
            held: 'Held',
            returned: 'Returned',
            applied: 'Applied to Damages'
        };
        return statuses[status] || status;
    }

    setCurrentYear() {
        const currentYear = new Date().getFullYear();
        const yearSelect = document.getElementById('reportYear');
        
        // Add current year if not present
        if (!Array.from(yearSelect.options).some(option => option.value === currentYear.toString())) {
            const option = new Option(currentYear, currentYear);
            yearSelect.insertBefore(option, yearSelect.firstChild);
        }
        
        yearSelect.value = currentYear;
    }

    // Account Management
    configureBankAccountForm() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <form id="itemForm">
                <div class="form-group">
                    <label for="accountName">Account Name</label>
                    <input type="text" id="accountName" name="accountName" required placeholder="e.g., Business Checking">
                </div>
                <div class="form-group">
                    <label for="bankName">Bank Name</label>
                    <input type="text" id="bankName" name="bank" required placeholder="e.g., Chase, Bank of America">
                </div>
                <div class="form-group">
                    <label for="accountType">Account Type</label>
                    <select id="accountType" name="accountType" required>
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="money_market">Money Market</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="lastFourDigits">Last 4 Digits</label>
                    <input type="text" id="lastFourDigits" name="lastFourDigits" maxlength="4" pattern="[0-9]{4}" placeholder="1234">
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        this.attachModalEventListeners();
    }

    configurePropertyForm() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <form id="itemForm">
                <div class="form-group">
                    <label for="propertyAddress">Property Address</label>
                    <input type="text" id="propertyAddress" name="address" required placeholder="e.g., 123 Main Street, Apt 1A">
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        this.attachModalEventListeners();
    }

    async loadPropertyTable() {
        const properties = await this.getItems('properties');
        const tbody = document.querySelector('#propertyTable tbody');
        
        if (properties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="empty-state"><div><i class="fas fa-home"></i><h3>No properties added</h3><p>Add your rental properties to use in dropdowns.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = properties.map(property => `
            <tr>
                <td>${property.address}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="app.openModal('property', ${property.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('properties', ${property.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    configureCreditCardForm() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <form id="itemForm">
                <div class="form-group">
                    <label for="cardName">Card Name</label>
                    <input type="text" id="cardName" name="cardName" required placeholder="e.g., Business Credit Card">
                </div>
                <div class="form-group">
                    <label for="issuer">Bank/Issuer</label>
                    <input type="text" id="issuer" name="issuer" required placeholder="e.g., Chase, American Express">
                </div>
                <div class="form-group">
                    <label for="cardType">Card Type</label>
                    <select id="cardType" name="cardType" required>
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                        <option value="discover">Discover</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="lastFourDigits">Last 4 Digits</label>
                    <input type="text" id="lastFourDigits" name="lastFourDigits" maxlength="4" pattern="[0-9]{4}" placeholder="1234">
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        this.attachModalEventListeners();
    }

    async loadAccountTables() {
        await this.loadBankAccountTable();
        await this.loadCreditCardTable();
        await this.loadPropertyTable();
    }

    async loadBankAccountTable() {
        const accounts = await this.getItems('bankAccounts');
        const tbody = document.querySelector('#bankAccountTable tbody');
        
        if (accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><div><i class="fas fa-university"></i><h3>No bank accounts added</h3><p>Add your bank accounts to track transactions.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = accounts.map(account => `
            <tr>
                <td>${account.accountName}</td>
                <td>${account.bank}</td>
                <td>${this.formatAccountType(account.accountType)}</td>
                <td>****${account.lastFourDigits || ''}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="app.openModal('bankAccount', ${account.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('bankAccounts', ${account.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadCreditCardTable() {
        const cards = await this.getItems('creditCards');
        const tbody = document.querySelector('#creditCardTable tbody');
        
        if (cards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><div><i class="fas fa-credit-card"></i><h3>No credit cards added</h3><p>Add your business credit cards to track expenses.</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = cards.map(card => `
            <tr>
                <td>${card.cardName}</td>
                <td>${card.issuer}</td>
                <td>${this.formatCardType(card.cardType)}</td>
                <td>****${card.lastFourDigits || ''}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="app.openModal('creditCard', ${card.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteItemConfirm('creditCards', ${card.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadAccountOptions() {
        // Load bank accounts
        const bankAccounts = await this.getItems('bankAccounts');
        const bankSelect = document.getElementById('itemBankAccount');
        if (bankSelect) {
            bankSelect.innerHTML = '<option value="">Select Bank Account</option>' +
                bankAccounts.map(account => 
                    `<option value="${account.id}">${account.accountName} (${account.bank})</option>`
                ).join('');
        }

        // Load credit cards
        const creditCards = await this.getItems('creditCards');
        const cardSelect = document.getElementById('itemCreditCard');
        if (cardSelect) {
            cardSelect.innerHTML = '<option value="">Cash/Check/Bank Transfer</option>' +
                creditCards.map(card => 
                    `<option value="${card.id}">${card.cardName} (${card.issuer})</option>`
                ).join('');
        }
    }

    formatAccountType(type) {
        const types = {
            checking: 'Checking',
            savings: 'Savings',
            money_market: 'Money Market',
            other: 'Other'
        };
        return types[type] || type;
    }

    formatCardType(type) {
        const types = {
            visa: 'Visa',
            mastercard: 'Mastercard',
            amex: 'American Express',
            discover: 'Discover',
            other: 'Other'
        };
        return types[type] || type;
    }

    // Property Address Management
    async savePropertyAddress(address) {
        if (!address || address.trim() === '') return;
        
        try {
            const properties = await this.getItems('properties');
            const existingProperty = properties.find(p => p.address.toLowerCase() === address.toLowerCase());
            
            if (!existingProperty) {
                await this.addItem('properties', { address: address.trim() });
            }
        } catch (error) {
            console.error('Error saving property address:', error);
        }
    }

    async loadPropertyOptions() {
        try {
            const properties = await this.getItems('properties');
            const propertyInput = document.getElementById('itemProperty');
            
            if (propertyInput && properties.length > 0) {
                // Convert input to select with datalist for autocomplete
                const propertySelect = document.createElement('select');
                propertySelect.id = 'itemProperty';
                propertySelect.name = 'property';
                propertySelect.required = true;
                propertySelect.className = propertyInput.className;
                
                propertySelect.innerHTML = '<option value="">Select Property or Add New</option>' +
                    properties.map(property => 
                        `<option value="${property.address}">${property.address}</option>`
                    ).join('') +
                    '<option value="__new__">+ Add New Property</option>';
                
                // Handle new property selection
                propertySelect.addEventListener('change', (e) => {
                    if (e.target.value === '__new__') {
                        const newAddress = prompt('Enter new property address:');
                        if (newAddress && newAddress.trim()) {
                            // Create text input for new address
                            const textInput = document.createElement('input');
                            textInput.type = 'text';
                            textInput.id = 'itemProperty';
                            textInput.name = 'property';
                            textInput.required = true;
                            textInput.className = propertySelect.className;
                            textInput.value = newAddress.trim();
                            textInput.placeholder = 'Property address or name';
                            
                            propertySelect.parentNode.replaceChild(textInput, propertySelect);
                        } else {
                            e.target.value = '';
                        }
                    }
                });
                
                propertyInput.parentNode.replaceChild(propertySelect, propertyInput);
            }
        } catch (error) {
            console.error('Error loading property options:', error);
        }
    }

    attachModalEventListeners() {
        // Re-attach event listeners for modal form
        const cancelBtn = document.getElementById('cancelBtn');
        const itemForm = document.getElementById('itemForm');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    restoreOriginalForm() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <form id="itemForm">
                <div class="form-group">
                    <label for="itemDate">Date</label>
                    <input type="date" id="itemDate" name="date" required>
                </div>
                <div class="form-group">
                    <label for="itemProperty">Property</label>
                    <input type="text" id="itemProperty" name="property" required placeholder="Property address or name">
                </div>
                <div class="form-group" id="paidByGroup">
                    <label for="itemPaidBy">Paid By</label>
                    <input type="text" id="itemPaidBy" name="paidBy" placeholder="Tenant name or payer">
                </div>
                <div class="form-group" id="bankAccountGroup">
                    <label for="itemBankAccount">Bank Account</label>
                    <select id="itemBankAccount" name="bankAccount">
                        <option value="">Select Bank Account</option>
                    </select>
                </div>
                <div class="form-group" id="typeGroup">
                    <label for="itemType">Type</label>
                    <select id="itemType" name="type">
                        <option value="rent">Monthly Rent</option>
                        <option value="late_fee">Late Fee</option>
                        <option value="pet_fee">Pet Fee</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group" id="categoryGroup">
                    <label for="itemCategory">Category</label>
                    <select id="itemCategory" name="category">
                        <option value="maintenance">Maintenance & Repairs</option>
                        <option value="utilities">Utilities</option>
                        <option value="insurance">Insurance</option>
                        <option value="property_tax">Property Tax</option>
                        <option value="management">Property Management</option>
                        <option value="legal">Legal & Professional</option>
                        <option value="advertising">Advertising</option>
                        <option value="supplies">Supplies</option>
                        <option value="travel">Travel</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemAmount">Amount ($)</label>
                    <input type="number" id="itemAmount" name="amount" step="0.01" required>
                </div>
                <div class="form-group" id="creditCardGroup">
                    <label for="itemCreditCard">Credit Card (for expenses)</label>
                    <select id="itemCreditCard" name="creditCard">
                        <option value="">Cash/Check/Bank Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemDescription">Description</label>
                    <input type="text" id="itemDescription" name="description" placeholder="Optional description">
                </div>
                <div class="form-group" id="tenantGroup">
                    <label for="itemTenant">Tenant Name</label>
                    <input type="text" id="itemTenant" name="tenant" placeholder="Tenant name">
                </div>
                <div class="form-group" id="statusGroup">
                    <label for="itemStatus">Status</label>
                    <select id="itemStatus" name="status">
                        <option value="held">Held</option>
                        <option value="returned">Returned</option>
                        <option value="applied">Applied to Damages</option>
                    </select>
                </div>
                <div class="form-group" id="taxDeductibleGroup">
                    <label class="checkbox-label">
                        <input type="checkbox" id="itemTaxDeductible" name="taxDeductible">
                        <span class="checkmark"></span>
                        Tax Deductible
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        this.attachModalEventListeners();
    }

    // Template Downloads
    downloadTemplate(type) {
        let csv = '';
        let filename = '';
        
        switch(type) {
            case 'all':
            case 'transactions':
                // Combined transaction template
                csv = 'Date,Type,Property,Amount,Description,Category,Income Type,Paid By,Tax Deductible,Credit Card,Tenant,Status,Bank Account\n';
                csv += '2025-01-15,Income,123 Main St,1200,January rent,,Monthly Rent,John Doe,,,,,1\n';
                csv += '2025-01-16,Expense,123 Main St,-150,Plumbing repair,Maintenance & Repairs,,,Yes,2,,,\n';
                csv += '2025-01-01,Security Deposit,123 Main St,1200,Security deposit,,,,,John Doe,Held,1\n';
                filename = 'rental-transactions-template.csv';
                break;
            case 'accounts':
                // Accounts template
                csv = 'Type,Name,Bank/Issuer,Account/Card Type,Last 4 Digits\n';
                csv += 'Bank Account,Business Checking,Chase,Checking,1234\n';
                csv += 'Credit Card,Business Card,Chase,Visa,5678\n';
                filename = 'accounts-template.csv';
                break;
        }
        
        this.downloadCSV(csv, filename);
    }

    // CSV Import
    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileType = file.name.endsWith('.csv') ? 'csv' : 'json';

        try {
            const text = await file.text();
            
            if (fileType === 'json') {
                // Original JSON import
                const data = JSON.parse(text);

                if (!data.income || !data.expenses || !data.deposits) {
                    throw new Error('Invalid backup file format');
                }

                if (confirm('This will replace all existing data. Are you sure you want to continue?')) {
                    // Clear existing data
                    await this.clearAllData();

                    // Import new data
                    for (const item of data.income) {
                        delete item.id; // Let DB assign new IDs
                        await this.addItem('income', item);
                    }

                    for (const item of data.expenses) {
                        delete item.id;
                        await this.addItem('expenses', item);
                    }

                    for (const item of data.deposits) {
                        delete item.id;
                        await this.addItem('deposits', item);
                    }

                    // Import accounts and properties if present
                    if (data.bankAccounts) {
                        for (const item of data.bankAccounts) {
                            delete item.id;
                            await this.addItem('bankAccounts', item);
                        }
                    }
                    
                    if (data.creditCards) {
                        for (const item of data.creditCards) {
                            delete item.id;
                            await this.addItem('creditCards', item);
                        }
                    }
                    
                    if (data.properties) {
                        for (const item of data.properties) {
                            delete item.id;
                            await this.addItem('properties', item);
                        }
                    }

                    // Refresh UI
                    this.updateDashboard();
                    this.loadIncomeTable();
                    alert('Data imported successfully!');
                }
            } else {
                // CSV import with smart detection
                await this.importCSV(text);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please check the file format and try again.');
        }

        // Reset file input
        event.target.value = '';
    }

    async importCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or invalid');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        // Parse CSV rows
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].trim();
                });
                data.push(row);
            }
        }
        
        // Detect type of data based on headers
        if (headers.includes('Type') && headers.includes('Property')) {
            // This is a transaction file
            await this.importTransactionCSV(data);
        } else if (headers.includes('Type') && headers.includes('Name') && headers.includes('Bank/Issuer')) {
            // This is an accounts file
            await this.importAccountsCSV(data);
        } else if (headers.includes('Address')) {
            // This is a properties file
            await this.importPropertiesCSV(data);
        } else {
            throw new Error('Unrecognized CSV format');
        }
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++;
                } else {
                    // Toggle quotes
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        // Don't forget the last field
        values.push(current);
        
        return values;
    }

    async importTransactionCSV(data) {
        if (confirm(`Import ${data.length} transactions? This will add to your existing data.`)) {
            let imported = { income: 0, expenses: 0, deposits: 0 };
            
            for (const row of data) {
                const type = row.Type;
                const date = row.Date;
                const property = row.Property;
                const amount = parseFloat(row.Amount);
                const description = row.Description || '';
                
                if (!date || !property || isNaN(amount)) continue;
                
                if (type === 'Income') {
                    const item = {
                        date,
                        property,
                        amount: Math.abs(amount),
                        description,
                        type: this.parseIncomeType(row['Income Type']),
                        paidBy: row['Paid By'] || '',
                        bankAccount: row['Bank Account'] || ''
                    };
                    await this.addItem('income', item);
                    await this.savePropertyAddress(property);
                    imported.income++;
                } else if (type === 'Expense') {
                    const item = {
                        date,
                        property,
                        amount: Math.abs(amount),
                        description,
                        category: this.parseCategory(row.Category),
                        taxDeductible: row['Tax Deductible'] === 'Yes',
                        creditCard: row['Credit Card'] || ''
                    };
                    await this.addItem('expenses', item);
                    await this.savePropertyAddress(property);
                    imported.expenses++;
                } else if (type === 'Security Deposit') {
                    const item = {
                        date,
                        property,
                        amount: Math.abs(amount),
                        description,
                        tenant: row.Tenant || '',
                        status: this.parseStatus(row.Status),
                        bankAccount: row['Bank Account'] || ''
                    };
                    await this.addItem('deposits', item);
                    await this.savePropertyAddress(property);
                    imported.deposits++;
                }
            }
            
            // Refresh UI
            this.updateDashboard();
            this.switchTab(document.querySelector('.tab-btn.active').dataset.tab);
            
            alert(`Import complete!\nIncome: ${imported.income}\nExpenses: ${imported.expenses}\nDeposits: ${imported.deposits}`);
        }
    }

    async importAccountsCSV(data) {
        if (confirm(`Import ${data.length} accounts? This will add to your existing data.`)) {
            let imported = { bankAccounts: 0, creditCards: 0 };
            
            for (const row of data) {
                const type = row.Type;
                
                if (type === 'Bank Account') {
                    const item = {
                        accountName: row.Name,
                        bank: row['Bank/Issuer'],
                        accountType: this.parseAccountType(row['Account/Card Type']),
                        lastFourDigits: row['Last 4 Digits'] || ''
                    };
                    await this.addItem('bankAccounts', item);
                    imported.bankAccounts++;
                } else if (type === 'Credit Card') {
                    const item = {
                        cardName: row.Name,
                        issuer: row['Bank/Issuer'],
                        cardType: this.parseCardType(row['Account/Card Type']),
                        lastFourDigits: row['Last 4 Digits'] || ''
                    };
                    await this.addItem('creditCards', item);
                    imported.creditCards++;
                }
            }
            
            // Refresh UI
            this.loadAccountTables();
            
            alert(`Import complete!\nBank Accounts: ${imported.bankAccounts}\nCredit Cards: ${imported.creditCards}`);
        }
    }

    async importPropertiesCSV(data) {
        if (confirm(`Import ${data.length} properties? This will add to your existing data.`)) {
            let imported = 0;
            
            for (const row of data) {
                if (row.Address) {
                    await this.savePropertyAddress(row.Address);
                    imported++;
                }
            }
            
            // Refresh UI
            this.loadPropertyTable();
            
            alert(`Import complete! ${imported} properties imported.`);
        }
    }

    parseIncomeType(type) {
        const mapping = {
            'Monthly Rent': 'rent',
            'Late Fee': 'late_fee',
            'Pet Fee': 'pet_fee'
        };
        return mapping[type] || 'other';
    }

    parseCategory(category) {
        const mapping = {
            'Maintenance & Repairs': 'maintenance',
            'Utilities': 'utilities',
            'Insurance': 'insurance',
            'Property Tax': 'property_tax',
            'Property Management': 'management',
            'Legal & Professional': 'legal',
            'Advertising': 'advertising',
            'Supplies': 'supplies',
            'Travel': 'travel'
        };
        return mapping[category] || 'other';
    }

    parseStatus(status) {
        const mapping = {
            'Held': 'held',
            'Returned': 'returned',
            'Applied to Damages': 'applied'
        };
        return mapping[status] || 'held';
    }

    parseAccountType(type) {
        const mapping = {
            'Checking': 'checking',
            'Savings': 'savings',
            'Money Market': 'money_market'
        };
        return mapping[type] || 'other';
    }

    parseCardType(type) {
        const mapping = {
            'Visa': 'visa',
            'Mastercard': 'mastercard',
            'American Express': 'amex',
            'Discover': 'discover'
        };
        return mapping[type] || 'other';
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RentalBookkeeper();
});
