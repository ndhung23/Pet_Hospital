import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  X,
  Banknote,
  QrCode,
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
} from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import { billingService } from '../../services/billingService';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const TYPE_STYLES = {
  CONSULTATION: 'bg-blue-100 text-blue-800',
  LAB: 'bg-purple-100 text-purple-800',
  DRUG: 'bg-emerald-100 text-emerald-800',
};

const STATUS_STYLES = {
  UNPAID: 'bg-amber-100 text-amber-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  REFUNDED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

/**
 * UC-BILL-01 + UC-BILL-02: reception desk billing queue and invoice detail.
 * Settles by cash, or hands off to VNPay when it is configured.
 */
const BillingQueue = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState('UNPAID');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [payModal, setPayModal] = useState(null); // { invoice, method }
  const [cashInput, setCashInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await billingService.getInvoices({ status, search: search || undefined });
      setInvoices(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the billing queue.');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (invoiceId) => {
    setDetailLoading(true);
    setError('');
    try {
      const data = await billingService.getInvoiceDetail(invoiceId);
      setDetail(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the invoice.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCash = async () => {
    const amount = Number(cashInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter the amount of cash received.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await billingService.payCash(payModal.invoice.id, amount);
      setNotice(
        `Invoice ${payModal.invoice.code} settled. Change to return: ${formatVND(
          result.changeAmount
        )}.`
      );
      setPayModal(null);
      setCashInput('');
      setDetail(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Cash payment failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleVnpay = async (invoice) => {
    setBusy(true);
    setError('');
    try {
      const result = await billingService.initVnpayPayment(invoice.id);
      setNotice('VNPay session created. Opening the payment page…');
      window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      setPayModal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the VNPay payment.');
    } finally {
      setBusy(false);
    }
  };

  const unpaidTotal = invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Billing & Payments</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {invoices.length} invoice{invoices.length === 1 ? '' : 's'} ·{' '}
              {formatVND(unpaidTotal)} outstanding
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice code, owner, pet…"
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 w-56 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {['UNPAID', 'PAID', 'ALL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                    status === s
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No invoices</p>
          <p className="text-xs text-slate-400 mt-1">
            Nothing matches this filter right now.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider bg-slate-50">
                  <th className="p-3 font-semibold">Invoice</th>
                  <th className="p-3 font-semibold">Pet / Owner</th>
                  <th className="p-3 font-semibold text-right">Total</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Created</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="p-3">
                      <p className="font-mono font-semibold text-slate-800 text-xs">
                        {invoice.code}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {invoice._count?.items ?? 0} line items
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{invoice.pet?.name}</p>
                      <span className="text-[10px] text-slate-400">
                        {invoice.owner?.fullName}
                        {invoice.owner?.phone ? ` · ${invoice.owner.phone}` : ''}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {formatVND(invoice.total)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {formatDateTime(invoice.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(invoice.id)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View
                        </button>
                        {invoice.status === 'UNPAID' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setPayModal({ invoice, method: 'CASH' });
                              setCashInput(String(invoice.total));
                              setError('');
                            }}
                            className="!px-2.5 !py-1 !text-[11px]"
                          >
                            <Banknote className="w-3 h-3 mr-1" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice detail (UC-BILL-02) */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between p-5 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span className="font-mono">{detail.code}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[detail.status]
                        }`}
                      >
                        {detail.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {detail.pet?.name} ({detail.pet?.species}) · {detail.owner?.fullName}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Clinical context */}
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Diagnosis
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{detail.record?.diagnosis}</p>
                    {detail.record?.veterinarian && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Treated by {detail.record.veterinarian.fullName}
                      </p>
                    )}
                  </div>

                  {/* Line items */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                      Charges
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr className="text-slate-400 text-[10px] uppercase tracking-wider">
                            <th className="p-2.5 text-left font-semibold">Type</th>
                            <th className="p-2.5 text-left font-semibold">Description</th>
                            <th className="p-2.5 text-right font-semibold">Qty</th>
                            <th className="p-2.5 text-right font-semibold">Unit</th>
                            <th className="p-2.5 text-right font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2.5">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    TYPE_STYLES[item.type]
                                  }`}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-700">{item.description}</td>
                              <td className="p-2.5 text-right text-slate-600">{item.quantity}</td>
                              <td className="p-2.5 text-right text-slate-600">
                                {formatVND(item.unitPrice)}
                              </td>
                              <td className="p-2.5 text-right font-semibold text-slate-800">
                                {formatVND(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatVND(detail.subtotal)}</span>
                    </div>
                    {detail.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>Discount</span>
                        <span>-{formatVND(detail.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-1.5 border-t border-slate-200">
                      <span>Total</span>
                      <span>{formatVND(detail.total)}</span>
                    </div>
                  </div>

                  {/* Payments */}
                  {detail.payments?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                        Payment history
                      </div>
                      <div className="space-y-1.5">
                        {detail.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <div>
                                <p className="text-[11px] font-semibold text-emerald-900">
                                  {payment.method} · {formatVND(payment.amount)}
                                </p>
                                <p className="text-[9px] text-emerald-700 font-mono">
                                  {payment.txnRef}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-700">
                              {formatDateTime(payment.paidAt || payment.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {detail.status === 'UNPAID' && (
                  <div className="flex justify-end gap-2 p-5 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVnpay(detail)}
                      isLoading={busy}
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1.5" />
                      Pay by VNPay
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setPayModal({ invoice: detail, method: 'CASH' });
                        setCashInput(String(detail.total));
                        setError('');
                      }}
                    >
                      <Banknote className="w-3.5 h-3.5 mr-1.5" />
                      Pay by cash
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Cash payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Cash payment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {payModal.invoice.code}
                </p>
              </div>
              <button
                onClick={() => setPayModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Amount due
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {formatVND(payModal.invoice.total)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cash received <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={payModal.invoice.total}
                  step={1000}
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                />
              </div>

              {Number(cashInput) >= payModal.invoice.total && (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <span className="text-xs font-semibold text-emerald-800">Change to return</span>
                  <span className="text-base font-bold text-emerald-900">
                    {formatVND(Number(cashInput) - payModal.invoice.total)}
                  </span>
                </div>
              )}

              {Number(cashInput) > 0 && payModal.invoice.total > Number(cashInput) && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                  <Clock className="w-3.5 h-3.5 text-rose-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-800 leading-snug">
                    Insufficient: {formatVND(payModal.invoice.total - Number(cashInput))} short.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setPayModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCash}
                isLoading={busy}
                disabled={payModal.invoice.total > Number(cashInput)}
              >
                Confirm payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingQueue;
