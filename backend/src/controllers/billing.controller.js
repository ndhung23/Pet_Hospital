const billingService = require('../services/billing.service');
const { successResponse } = require('../utils/response');

/* ---------------------------------------------------------------- UC-BILL-01 */

const buildInvoice = async (req, res, next) => {
  try {
    const { recordId, discount } = req.body;
    const result = await billingService.buildInvoice(req.user, { recordId, discount });
    return successResponse(
      res,
      result.created ? 201 : 200,
      result.created ? 'Invoice generated from encounter charges' : 'Existing invoice returned',
      result.invoice
    );
  } catch (error) {
    next(error);
  }
};

const listInvoices = async (req, res, next) => {
  try {
    const invoices = await billingService.listInvoices(req.query);
    return successResponse(res, 200, 'Invoice queue retrieved', invoices);
  } catch (error) {
    next(error);
  }
};

const getInvoiceDetail = async (req, res, next) => {
  try {
    const invoice = await billingService.getInvoiceDetail(req.params.invoiceId, req.user);
    return successResponse(res, 200, 'Invoice detail retrieved', invoice);
  } catch (error) {
    next(error);
  }
};

const payCash = async (req, res, next) => {
  try {
    const result = await billingService.payCash(
      req.user,
      req.params.invoiceId,
      req.body.amountReceived
    );
    return successResponse(res, 200, 'Cash payment recorded. Invoice settled.', result);
  } catch (error) {
    next(error);
  }
};

const initVnpayPayment = async (req, res, next) => {
  try {
    const ipAddr =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const result = await billingService.initVnpayPayment(req.user, req.params.invoiceId, ipAddr);
    return successResponse(res, 200, 'VNPay payment session created', result);
  } catch (error) {
    next(error);
  }
};

/**
 * VNPay IPN — public endpoint, no auth. Must answer with the VNPay RspCode
 * envelope rather than the app's normal response shape.
 */
const vnpayIpn = async (req, res) => {
  try {
    const result = await billingService.handleVnpayIpn(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

/**
 * VNPay browser return — public, display only.
 */
const vnpayReturn = async (req, res, next) => {
  try {
    const result = await billingService.handleVnpayReturn(req.query);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

/* ---------------------------------------------------------------- UC-BILL-02 */

const listMyInvoices = async (req, res, next) => {
  try {
    const invoices = await billingService.listMyInvoices(req.user.id);
    return successResponse(res, 200, 'Your invoices retrieved', invoices);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buildInvoice,
  listInvoices,
  getInvoiceDetail,
  payCash,
  initVnpayPayment,
  vnpayIpn,
  vnpayReturn,
  listMyInvoices,
};
