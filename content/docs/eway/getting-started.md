---
title: Getting Started with eWAY
description: eWAY is Australia's leading payment gateway, providing secure online payment processing for businesses of all sizes
icon: CreditCard
order: 1
lastUpdated: 2025-01-15
category: eway
tags:
  - payments
  - gateway
  - integration
  - security
---

# Getting Started with eWAY

eWAY is Australia's leading payment gateway, providing secure online payment processing for businesses of all sizes. This documentation will guide you through integration, configuration, and management of eWAY payment solutions.

## Overview

eWAY offers comprehensive payment processing services including:

- **Credit Card Processing** - Visa, Mastercard, American Express, and more
- **Direct Debit** - Bank account payments via BECS
- **Digital Wallets** - Apple Pay, Google Pay, PayPal
- **International Payments** - Multi-currency support
- **Recurring Billing** - Subscription and installment payments

## Key Features

### Security & Compliance

- PCI DSS Level 1 compliant
- 3D Secure authentication
- Tokenization for secure card storage
- Fraud prevention tools

### Integration Options

- **Responsive Shared Page** - Quick setup with hosted payment forms
- **Transparent Redirect** - Custom forms with secure processing
- **Direct Connection** - Full API integration for complete control
- **Mobile SDKs** - Native iOS and Android libraries

### Reporting & Analytics

- Real-time transaction monitoring
- Comprehensive reporting dashboard
- Settlement and reconciliation tools
- Chargeback management

## Quick Start

1. **Create eWAY Account** - Sign up at [eway.com.au](https://eway.com.au)
2. **Get API Credentials** - Obtain your Customer ID and API Key
3. **Choose Integration Method** - Select the best option for your needs
4. **Test Integration** - Use sandbox environment for testing
5. **Go Live** - Switch to production environment

## Integration Methods

### Responsive Shared Page

The fastest way to integrate eWAY:

- Hosted payment form on eWAY's servers
- Mobile-responsive design
- Minimal PCI compliance requirements
- Customizable branding

### Transparent Redirect

Balance control and security:

- Custom payment form on your site
- Secure redirect to eWAY for processing
- Enhanced user experience
- Moderate PCI compliance requirements

### Direct Connection

Full API control:

- Complete customization
- Direct API communication
- Advanced features and workflows
- Full PCI compliance requirements

## Security Features

### PCI DSS Compliance

eWAY maintains PCI DSS Level 1 certification, the highest level of payment security:

- Secure data transmission
- Encrypted card storage
- Regular security audits
- Compliance assistance

### 3D Secure

Additional layer of authentication:

- Reduces fraud liability
- Enhanced customer verification
- Visa Secure and Mastercard Identity Check
- Configurable rules and thresholds

### Tokenization

Secure card storage for future use:

- Replace sensitive card data with tokens
- Reduce PCI scope
- Enable recurring payments
- Customer convenience

## Payment Types

### One-Time Payments

Standard transaction processing:

- Immediate authorization
- Automatic settlement
- Receipt generation
- Refund capabilities

### Recurring Payments

Automated subscription billing:

- Flexible billing cycles
- Automatic retries
- Dunning management
- Customer portal

### Pre-Authorization

Hold funds before capture:

- Verify card validity
- Reserve funds
- Capture later (up to 7 days)
- Partial captures supported

## Testing Environment

### Sandbox Access

Free testing environment:

- Full API functionality
- Test card numbers
- Simulated responses
- No real transactions

### Test Cards

Use these cards in sandbox:

```
Visa Success: 4444333322221111
Mastercard Success: 5105105105105100
Amex Success: 340000000000009

Test Decline: 4444333322221111 (amount < $1)
```

### Testing Scenarios

- Successful payments
- Declined transactions
- 3D Secure authentication
- Recurring billing
- Refunds and voids

## Next Steps

- [API Integration Guide](/docs/eway/api-integration)
- [Security Configuration](/docs/eway/security-setup)
- [Testing & Sandbox](/docs/eway/testing-guide)
- [Go Live Checklist](/docs/eway/go-live)
- [Troubleshooting](/docs/eway/troubleshooting)
