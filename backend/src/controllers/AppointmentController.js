/**
 * File: AppointmentController.js
 * Module: Appointment Management (UC-BOOK-01, UC-BOOK-03, UC-BOOK-04, UC-BOOK-05)
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Controller handling HTTP requests and responses for appointment operations (create, cancel, reschedule, list).
 */

const appointmentService = require('../services/AppointmentService');

class AppointmentController {
  /**
   * POST /api/appointments
   * Sequence Diagram 1: 5.1: createAppointment(petId, serviceId, slot, visitNote)
   * UC-BOOK-01: Book Appointment Online
   */
  async createAppointment(req, res, next) {
    try {
      const { petId, serviceId, slot, visitNote, vetId, ownerId } = req.body;
      const result = await appointmentService.createAppointment({
        petId,
        serviceId,
        slot,
        visitNote,
        vetId,
        ownerId: ownerId || req.user?.id,
        user: req.user,
        ownerEmail: req.user?.email || req.body.ownerEmail,
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointmentCode: result.appointmentCode,
        data: result.appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/appointments/:id/cancel
   * Sequence Diagram 2: 1.1: cancelAppointment(appointmentId)
   * UC-BOOK-03: Cancel Appointment
   */
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await appointmentService.cancelAppointment(id, req.user);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/:id/reschedule-options
   * Sequence Diagram 3: 1.1: getRescheduleOptions(appointmentId)
   * UC-BOOK-04 step 1
   */
  async getRescheduleOptions(req, res, next) {
    try {
      const { id } = req.params;
      const result = await appointmentService.getRescheduleOptions(id, req.user);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/appointments/:id/reschedule
   * Sequence Diagram 3: 2.1: rescheduleAppointment(appointmentId, newSlot)
   * UC-BOOK-04 step 2
   */
  async rescheduleAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { newSlot } = req.body;
      const result = await appointmentService.rescheduleAppointment(id, newSlot, req.user);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments
   * UC-BOOK-05: View Appointment List
   */
  async getAppointments(req, res, next) {
    try {
      const ownerId = req.query.ownerId || (req.user?.role === 'PET_OWNER' ? req.user.id : null);
      const appointments = await appointmentService.getAppointments(ownerId, req.user);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();

