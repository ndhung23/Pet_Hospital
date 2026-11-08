import apiClient from './apiClient';

/**
 * UC-BILL-01 (consolidate & settle) and UC-BILL-02 (invoice detail).
 */
export const billingService = {
  // Build the consolidated invoice from a medical record (idempotent)
  buildInvoice: async (recordId, discount = 0) => {
    const { data } = await apiClient.post('/billing/invoices', { recordId, discount });
    return data.data;
  },

  // Billing queue. status: UNPAID | PAID | REFUNDED | CANCELLED | ALL
  getInvoices: async ({ status = 'UNPAID', search, ownerId } = {}) => {
    const params = new URLSearchParams();
    params.set('status', status);
    if (search) params.set('search', search);
    if (ownerId) params.set('ownerId', ownerId);
    const { data } = await apiClient.get(`/billing/invoices?${params.toString()}`);
    return data.data;
  },

  getInvoiceDetail: async (invoiceId) => {
    const { data } = await apiClient.get(`/billing/invoices/${invoiceId}`);
    return data.data;
  },

  // UC-BILL-02: Pet Owner's own invoice history
  getMyInvoices: async () => {
    const { data } = await apiClient.get('/billing/invoices/mine');
    return data.data;
  },

  // UC-BILL-01: cash settlement
  payCash: async (invoiceId, amountReceived) => {
    const { data } = await apiClient.post(`/billing/invoices/${invoiceId}/pay-cash`, {
      amountReceived,
    });
    return data.data;
  },

  // UC-BILL-01: VNPay — returns { paymentUrl, txnRef, amount }
  initVnpayPayment: async (invoiceId) => {
    const { data } = await apiClient.post(`/billing/invoices/${invoiceId}/pay-vnpay`);
    return data.data;
  },
};

export default billingService;
