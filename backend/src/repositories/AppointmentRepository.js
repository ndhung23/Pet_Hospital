const prisma = require('../config/prisma');

class AppointmentRepository {
  /**
   * Find appointment by ID with associated pet, service, and veterinarian
   * Corresponds to Sequence Diagram: findAppointment(appointmentId) -> queryAppointment(appointmentId)
   */
  async findAppointment(appointmentId) {
    return prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Query appointments at a specific slot/time to check availability
   * Corresponds to Sequence Diagram: checkSlotAvailability(slot) -> queryAppointments(slot)
   */
  async queryAppointments(slot, vetId = null) {
    const slotDate = new Date(slot);
    const where = {
      startTime: slotDate,
      status: {
        notIn: ['CANCELLED', 'REJECTED'],
      },
    };

    if (vetId && vetId !== 'any' && vetId !== 'null') {
      where.vetId = vetId;
    }

    return prisma.appointment.findMany({ where });
  }

  /**
   * Check if slot is available
   */
  async checkSlotAvailability(slot, vetId = null) {
    const existing = await this.queryAppointments(slot, vetId);
    return existing.length === 0;
  }

  /**
   * Insert new appointment record
   * Corresponds to Sequence Diagram: saveAppointment(PENDING_APPROVAL) -> insertAppointment(appointment)
   */
  async insertAppointment(appointmentData) {
    return prisma.appointment.create({
      data: appointmentData,
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Update appointment data (e.g. rescheduling slot)
   * Corresponds to Sequence Diagram: updateAppointmentSlot(appointmentId, newSlot) -> updateAppointment(...)
   */
  async updateAppointment(appointmentId, updateData) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Update appointment status (e.g. CANCELLED)
   * Corresponds to Sequence Diagram: updateStatus(appointmentId, CANCELLED) -> updateAppointment(...)
   */
  async updateStatus(appointmentId, status) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find appointments by ownerId
   */
  async findAppointmentsByOwner(ownerId) {
    return prisma.appointment.findMany({
      where: { ownerId },
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Find all appointments (for Receptionist)
   */
  async findAllAppointments(where = {}) {
    return prisma.appointment.findMany({
      where,
      include: {
        pet: true,
        service: true,
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }
}

module.exports = new AppointmentRepository();
