const appointmentRepository = require('../repositories/AppointmentRepository');
const emailService = require('./EmailService');
const scheduleService = require('./ScheduleService');
const AppError = require('../utils/AppError');

class AppointmentService {
  /**
   * Helper: Generate unique human-readable appointment code
   * Example: APT-20261108-4821
   */
  generateAppointmentCode() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    return `APT-${datePart}-${randPart}`;
  }

  /**
   * 5.1.1.1: validateBookingWindow(slot)
   * BR-02: Advance Booking Window
   * Appointments must be booked at least 2 hours in advance and no more than 30 calendar days ahead.
   * Past dates and current-hour slots are locked.
   */
  validateBookingWindow(slot) {
    if (!slot) {
      throw new AppError('Time slot is required', 400, null, 'INVALID_SLOT');
    }

    const slotDate = new Date(slot);
    if (isNaN(slotDate.getTime())) {
      throw new AppError('Invalid time slot format', 400, null, 'INVALID_SLOT_FORMAT');
    }

    const now = new Date();
    const diffMs = slotDate.getTime() - now.getTime();

    // Exception 1.0.E1: slot in the past or within 2 hours
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (diffMs < twoHoursMs) {
      throw new AppError(
        'Advance booking constraint violation: Bookings must be made at least 2 hours in advance (BR-02).',
        400,
        null,
        'BR02_MIN_ADVANCE_TIME'
      );
    }

    // Exception 1.0.E2: slot more than 30 days ahead
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (diffMs > thirtyDaysMs) {
      throw new AppError(
        'Booking date too far: Bookings cannot be made more than 30 days in advance (BR-02).',
        400,
        null,
        'BR02_MAX_ADVANCE_TIME'
      );
    }

    return true;
  }

  /**
   * 5.1.1.2: checkSlotAvailability(slot, vetId)
   * Checks whether the slot is unbooked
   */
  async checkSlotAvailability(slot, vetId = null) {
    return appointmentRepository.checkSlotAvailability(slot, vetId);
  }

  /**
   * 5.1.1.3: saveAppointment(appointmentData)
   * Saves new appointment with initial status PENDING_APPROVAL
   */
  async saveAppointment(appointmentData) {
    const payload = {
      ...appointmentData,
      status: 'PENDING_APPROVAL',
      type: appointmentData.type || 'ROUTINE',
    };

    if (!payload.appointmentCode) {
      payload.appointmentCode = this.generateAppointmentCode();
    }

    return appointmentRepository.insertAppointment(payload);
  }

  /**
   * UC-BOOK-01: Book Appointment Online
   * Normal Flow step 1-8 + Alt 1.1 + Exceptions E1, E2, E3
   */
  async createAppointment({ petId, serviceId, slot, visitNote, ownerId, vetId = null, user = null, ownerEmail = null }) {
    if (!petId) throw new AppError('petId is required', 400, null, 'MISSING_PET_ID');
    if (!serviceId) throw new AppError('serviceId is required', 400, null, 'MISSING_SERVICE_ID');
    if (!slot) throw new AppError('slot is required', 400, null, 'MISSING_SLOT');

    const targetOwnerId = user && user.role === 'PET_OWNER' ? user.id : ownerId;
    if (!targetOwnerId) {
      throw new AppError('ownerId is required', 400, null, 'MISSING_OWNER_ID');
    }

    // 5.1.1.1: validateBookingWindow(slot) -> E1/E2
    this.validateBookingWindow(slot);

    // If 'any' vet was selected (Alt 1.1), find an available doctor on duty
    let assignedVetId = vetId;
    if (!assignedVetId || assignedVetId === 'any' || assignedVetId === 'null') {
      const slotIso = new Date(slot).toISOString();
      const datePart = slotIso.split('T')[0];
      const available = await scheduleService.getAvailableSlots('any', datePart);
      const match = available.find((s) => s.dateTime === slotIso);
      if (match && match.vetId) {
        assignedVetId = match.vetId;
      } else {
        assignedVetId = null;
      }
    }

    // 5.1.1.2: checkSlotAvailability(slot)
    const isFree = await this.checkSlotAvailability(slot, assignedVetId);
    if (!isFree) {
      // Exception 1.0.E3: Slot conflict (concurrenly booked by another user)
      throw new AppError(
        'The requested time slot has been booked concurrently by another user. Please select another slot.',
        409,
        null,
        'SLOT_CONFLICT'
      );
    }

    // 5.1.1.3: saveAppointment(PENDING_APPROVAL)
    const savedAppointment = await this.saveAppointment({
      petId,
      serviceId,
      startTime: new Date(slot),
      visitNote: visitNote || '',
      ownerId: targetOwnerId,
      vetId: assignedVetId,
    });

    // 5.1.1.4: queueConfirmationEmail(ownerEmail, appointmentCode) [asynchronous fire-and-forget]
    emailService.queueConfirmationEmail(ownerEmail || user?.email, savedAppointment.appointmentCode);

    return {
      appointmentCode: savedAppointment.appointmentCode,
      appointment: savedAppointment,
    };
  }

  /**
   * 1.1.1.2: checkTimeConstraint(appointment)
   * BR-06: Appointment Cancellation Limit
   * Pet Owners can cancel only if the scheduled start time is at least 2 hours away.
   * Within 2 hours, changes must go through front-desk staff.
   */
  checkTimeConstraint(appointment) {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const diffMs = startTime.getTime() - now.getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    // Exception 2.0.E1: start time is less than 2 hours away
    if (diffMs < twoHoursMs) {
      throw new AppError(
        'Appointments scheduled to start in less than 2 hours cannot be cancelled online. Please contact the front desk staff (BR-06).',
        403,
        null,
        'BR06_CANCELLATION_TIME_LIMIT'
      );
    }

    return true;
  }

  /**
   * 1.1.1.3: updateStatus(appointmentId, CANCELLED)
   */
  async updateStatus(appointmentId, status) {
    return appointmentRepository.updateStatus(appointmentId, status);
  }

  /**
   * UC-BOOK-03: Cancel Appointment
   * Normal Flow step 1-4 + Exception 2.0.E1
   */
  async cancelAppointment(appointmentId, user = null) {
    // 1.1.1.1: findAppointment(appointmentId)
    const appointment = await appointmentRepository.findAppointment(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment record not found', 404, null, 'APPOINTMENT_NOT_FOUND');
    }

    // RBAC: Pet Owner can only cancel their own appointment
    if (user && user.role === 'PET_OWNER' && appointment.ownerId !== user.id) {
      throw new AppError('Access denied: You cannot cancel appointments of another user', 403, null, 'FORBIDDEN');
    }

    // State check: Only pending or confirmed appointments can be cancelled
    if (appointment.status === 'CANCELLED') {
      throw new AppError('Appointment is already cancelled', 400, null, 'ALREADY_CANCELLED');
    }

    if (!['PENDING_APPROVAL', 'CONFIRMED'].includes(appointment.status)) {
      throw new AppError(
        `Cannot cancel appointment with current status "${appointment.status}"`,
        400,
        null,
        'INVALID_STATUS_FOR_CANCELLATION'
      );
    }

    // 1.1.1.2: checkTimeConstraint(appointment) -> E1 (BR-06)
    // Front desk / Receptionist can override the 2h limit as per BR-06 specification
    if (!user || user.role !== 'RECEPTIONIST') {
      this.checkTimeConstraint(appointment);
    }

    // 1.1.1.3: updateStatus(appointmentId, CANCELLED)
    const updated = await this.updateStatus(appointmentId, 'CANCELLED');

    return {
      message: 'Appointment cancelled successfully',
      appointment: updated,
    };
  }

  /**
   * 1.1.1.2 (Reschedule): validateTimeConstraint(appointment)
   * BR-06: Rescheduling requires start time to be at least 2 hours away
   */
  validateTimeConstraint(appointment) {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const diffMs = startTime.getTime() - now.getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    // Exception 3.0.E1: within 2 hours
    if (diffMs < twoHoursMs) {
      throw new AppError(
        'Appointments scheduled to start in less than 2 hours cannot be rescheduled online. Please contact the front desk staff (BR-06).',
        403,
        null,
        'BR06_RESCHEDULE_TIME_LIMIT'
      );
    }

    return true;
  }

  /**
   * 2.1.1.3: updateAppointmentSlot(appointmentId, newSlot)
   */
  async updateAppointmentSlot(appointmentId, newSlot) {
    return appointmentRepository.updateAppointment(appointmentId, {
      startTime: new Date(newSlot),
    });
  }

  /**
   * 1.1: getRescheduleOptions(appointmentId)
   * Checks time constraint and returns available slots
   */
  async getRescheduleOptions(appointmentId, user = null) {
    const appointment = await appointmentRepository.findAppointment(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment record not found', 404, null, 'APPOINTMENT_NOT_FOUND');
    }

    if (user && user.role === 'PET_OWNER' && appointment.ownerId !== user.id) {
      throw new AppError('Access denied: You cannot reschedule appointments of another user', 403, null, 'FORBIDDEN');
    }

    // Check time constraint BR-06
    if (!user || user.role !== 'RECEPTIONIST') {
      this.validateTimeConstraint(appointment);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availableSlots = await scheduleService.getAvailableSlots(appointment.vetId?._id || 'any', dateStr);

    return {
      appointment,
      availableSlots,
    };
  }

  /**
   * UC-BOOK-04: Reschedule Appointment
   * Normal Flow step 1-5 + Exceptions 3.0.E1, 3.0.E2, 3.0.E3
   */
  async rescheduleAppointment(appointmentId, newSlot, user = null) {
    if (!newSlot) {
      throw new AppError('newSlot is required for rescheduling', 400, null, 'MISSING_NEW_SLOT');
    }

    // 1.1.1.1: findAppointment(appointmentId)
    const appointment = await appointmentRepository.findAppointment(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment record not found', 404, null, 'APPOINTMENT_NOT_FOUND');
    }

    // RBAC: Check ownership
    if (user && user.role === 'PET_OWNER' && appointment.ownerId !== user.id) {
      throw new AppError('Access denied: You cannot reschedule appointments of another user', 403, null, 'FORBIDDEN');
    }

    if (!['PENDING_APPROVAL', 'CONFIRMED'].includes(appointment.status)) {
      throw new AppError(
        `Cannot reschedule appointment with status "${appointment.status}"`,
        400,
        null,
        'INVALID_STATUS_FOR_RESCHEDULE'
      );
    }

    // 1.1.1.2: validateTimeConstraint(appointment) -> Exception 3.0.E1 (BR-06)
    if (!user || user.role !== 'RECEPTIONIST') {
      this.validateTimeConstraint(appointment);
    }

    // 2.1.1.1: validateBookingWindow(newSlot) -> Exception 3.0.E2 (BR-02)
    this.validateBookingWindow(newSlot);

    // 2.1.1.2: checkSlotAvailability(newSlot)
    const isFree = await this.checkSlotAvailability(newSlot, appointment.vetId?._id);
    if (!isFree) {
      // Exception 3.0.E3: Slot booked concurrently
      const newSlotDate = new Date(newSlot).toISOString().split('T')[0];
      const refreshedSlots = await scheduleService.getAvailableSlots(appointment.vetId?._id || 'any', newSlotDate);

      throw new AppError(
        'The requested new time slot has been booked concurrently by another user. Please select another slot.',
        409,
        { availableSlots: refreshedSlots },
        'SLOT_CONFLICT'
      );
    }

    // 2.1.1.3: updateAppointmentSlot(appointmentId, newSlot)
    const updated = await this.updateAppointmentSlot(appointmentId, newSlot);

    return {
      message: 'Appointment has been rescheduled successfully',
      appointment: updated,
    };
  }

  /**
   * UC-BOOK-05: View Appointment List
   */
  async getAppointments(ownerId, user = null) {
    if (user && user.role === 'PET_OWNER') {
      return appointmentRepository.findAppointmentsByOwner(user.id);
    }

    if (ownerId) {
      return appointmentRepository.findAppointmentsByOwner(ownerId);
    }

    // Receptionist viewing all appointments
    return appointmentRepository.findAllAppointments();
  }
}

module.exports = new AppointmentService();

