class EmailService {
  /**
   * Queue confirmation email (stub)
   * Asynchronous, fire-and-forget, does not throw or block HTTP response
   * Sequence Diagram: AS-)ES: queueConfirmationEmail(ownerEmail, appointmentCode)
   */
  queueConfirmationEmail(ownerEmail, appointmentCode) {
    setImmediate(() => {
      try {
        console.log(
          `[EmailService] [ASYNC STUB] Automated confirmation email queued for recipient "${ownerEmail || 'client@phms.local'}" with appointment code: ${appointmentCode}`
        );
      } catch (err) {
        console.error(`[EmailService] Failed to queue confirmation email:`, err.message);
      }
    });
  }
}

module.exports = new EmailService();

