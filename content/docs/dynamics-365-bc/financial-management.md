---
title: Financial Management
description: Master the financial capabilities of Dynamics 365 Business Central with comprehensive accounting, budgeting, and reporting features
icon: DollarSign
order: 1
lastUpdated: 2025-01-15
category: dynamics-365-bc
tags:
  - finance
  - accounting
  - general-ledger
  - budgeting
---

# Financial Management

Master the financial capabilities of Dynamics 365 Business Central with comprehensive accounting, budgeting, and reporting features.

## Chart of Accounts

### Account Structure

Business Central uses a flexible chart of accounts structure:

```
Account Type: Posting | Heading | Total | Begin-Total | End-Total
Account Category: Assets | Liabilities | Equity | Income | COGS | Expense
```

### Standard Account Categories

#### Assets
- **Cash & Bank Accounts** - 1000-1999
- **Accounts Receivable** - 2000-2999
- **Inventory** - 3000-3999
- **Fixed Assets** - 4000-4999
- **Other Assets** - 5000-5999

#### Liabilities & Equity
- **Accounts Payable** - 6000-6999
- **Short-term Liabilities** - 7000-7999
- **Long-term Liabilities** - 8000-8999
- **Equity** - 9000-9999

## General Ledger Operations

### Journal Processing

#### General Journal Types
- **General** - Miscellaneous transactions
- **Sales** - Customer transactions
- **Purchases** - Vendor transactions
- **Cash Receipts** - Payment collections
- **Payments** - Vendor payments

### Posting Setup

#### General Posting Setup
Configure posting rules for different business combinations:

```
Gen. Bus. Posting Group: DOMESTIC | EXPORT | EU
Gen. Prod. Posting Group: SERVICES | RETAIL | RAW MAT
```

#### VAT Posting Setup
- **VAT Business Posting Group**: DOMESTIC, EXPORT, EU
- **VAT Product Posting Group**: STANDARD, REDUCED, ZERO
- **VAT Calculation Type**: Normal VAT, Reverse Charge

## Accounts Receivable

### Customer Management

#### Customer Posting Groups
- **DOMESTIC** - Local customers with standard terms
- **EXPORT** - International customers
- **CASH** - Cash-only customers
- **GOVERNMENT** - Public sector clients

#### Payment Terms
- **CASH** - Payment on delivery
- **7 DAYS** - Payment within 7 days
- **30 DAYS** - Standard 30-day terms
- **60 DAYS** - Extended payment terms

### Sales Invoice Processing

#### Invoice Workflow
1. **Sales Quote** - Initial pricing and terms
2. **Sales Order** - Confirmed customer order
3. **Shipment** - Goods delivery processing
4. **Sales Invoice** - Billing generation
5. **Payment Application** - Customer payment processing

#### Credit Management
- **Credit Limits** - Customer spending controls
- **Overdue Analysis** - Aging report monitoring
- **Collection Activities** - Follow-up procedures
- **Credit Hold** - Automatic order blocking

## Accounts Payable

### Vendor Management

#### Vendor Categories
- **TRADE** - Inventory suppliers
- **SERVICES** - Service providers
- **UTILITIES** - Utility companies
- **GOVERNMENT** - Tax and regulatory payments

### Purchase Processing

#### Purchase-to-Pay Cycle
1. **Purchase Requisition** - Department requests
2. **Purchase Order** - Vendor order placement
3. **Goods Receipt** - Delivery confirmation
4. **Purchase Invoice** - Vendor billing
5. **Payment Processing** - Vendor payment

#### Three-Way Matching
- **Purchase Order** vs **Receipt** vs **Invoice**
- **Quantity Verification** - Received vs. ordered
- **Price Validation** - Invoice vs. contract pricing
- **Approval Workflow** - Management authorization

## Banking & Cash Management

### Bank Account Setup

#### Bank Account Types
- **Operating Account** - Daily transaction processing
- **Payroll Account** - Employee payment processing
- **Savings Account** - Cash reserve management
- **Foreign Currency** - Multi-currency operations

### Bank Reconciliation

#### Reconciliation Process
1. **Import Bank Statement** - Electronic or manual entry
2. **Match Transactions** - Automatic and manual matching
3. **Create Adjustments** - Bank fees and corrections
4. **Post Reconciliation** - Finalize bank balance

#### Electronic Banking
- **Bank Data Conversion** - Multiple format support
- **Electronic Payments** - ACH and wire transfers
- **Positive Pay** - Check fraud prevention
- **Cash Position** - Real-time balance monitoring

## Financial Reporting

### Standard Reports

#### Financial Statements
- **Trial Balance** - Account balance summary
- **Balance Sheet** - Financial position statement
- **Income Statement** - Profit and loss summary
- **Cash Flow Statement** - Cash movement analysis

#### Analytical Reports
- **Budget vs. Actual** - Performance comparison
- **Aged Receivables** - Customer aging analysis
- **Aged Payables** - Vendor aging summary
- **G/L Detail** - Account transaction history

### Account Schedules

#### Custom Report Design
```
Row Definition:
- Description: Sales Revenue
- Totaling: 40000..49999
- Row Type: Posting Accounts
- Amount Type: Net Amount

Column Definition:
- Column Header: Current Year
- Column Type: Formula
- Ledger Entry Type: G/L Entry
- Amount Type: Net Amount
```

## Budgeting & Planning

### Budget Creation

#### Budget Types
- **Operating Budget** - Revenue and expense planning
- **Capital Budget** - Asset investment planning
- **Cash Flow Budget** - Liquidity management
- **Department Budget** - Cost center planning

#### Budget Dimensions
- **Department** - Organizational units
- **Project** - Specific initiatives
- **Cost Center** - Responsibility centers
- **Campaign** - Marketing activities

### Budget Monitoring

#### Variance Analysis
- **Budget vs. Actual** - Performance tracking
- **Forecast Updates** - Rolling forecast adjustments
- **Exception Reporting** - Significant variance alerts
- **Budget Revisions** - Approved budget changes

## Period Management

### Financial Periods

#### Period Setup
- **Fiscal Year** - Company financial year definition
- **Accounting Periods** - Monthly or weekly periods
- **Period Status** - Open, Closed, Locked
- **Year-End Closing** - Annual closure procedures

#### Period-End Procedures
1. **Journal Posting** - Complete all transactions
2. **Reconciliations** - Verify account balances
3. **Adjusting Entries** - Accruals and deferrals
4. **Close Period** - Lock period for changes
5. **Financial Reports** - Generate period statements

## Multi-Currency Operations

### Currency Setup

#### Exchange Rates
- **Currency Codes** - ISO standard codes
- **Exchange Rate Tables** - Historical rate tracking
- **Rate Adjustment** - Periodic revaluation
- **Realized/Unrealized Gains** - Currency impact tracking

#### Currency Processing
- **Foreign Invoicing** - Multi-currency billing
- **Payment Application** - Currency conversion
- **Bank Reconciliation** - Foreign currency accounts
- **Financial Reporting** - Consolidated currency reporting

## Next Steps

- [Advanced Analytics](/docs/dynamics-365-bc/advanced-features)
- [Integration Setup](/docs/dynamics-365-bc/integrations)
- [Multi-Company Setup](/docs/dynamics-365-bc/multi-company)
- [Audit & Compliance](/docs/dynamics-365-bc/compliance)
