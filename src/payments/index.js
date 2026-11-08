// src/payments/index.js
// Payments: deposits and whether they were paid.
// Public contract: PaymentStatus and PaymentService.

export const PaymentStatus = Object.freeze({
  PAID: 'Paid',
  DECLINED: 'Declined',
});
