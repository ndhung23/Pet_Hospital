/**
 * File: appointment.service.test.js
 * Module: AppointmentService Unit Tests
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Jest automated tests verifying UC-BOOK-01, 03, 04, 05 and business rule exceptions (BR-02, BR-06).
 */

const appointmentService = require('../src/services/AppointmentService');
const appointmentRepository = require('../src/repositories/AppointmentRepository');
const emailService = require('../src/services/EmailService');
const scheduleService = require('../src/services/ScheduleService');

jest.mock('../src/repositories/AppointmentRepository');
jest.mock('../src/services/EmailService');
jest.mock('../src/services/ScheduleService');

describe('AppointmentService Unit Tests (UC-BOOK-01, 03, 04, 05)', () => {
  const mockOwnerId = 'owner-uuid-1111';
  const mockUser = { id: mockOwnerId, role: 'PET_OWNER', email: 'owner@phms.local' };
  const mockPetId = 'pet-uuid-2222';
  const mockServiceId = 'service-uuid-3333';
  const mockVetId = 'vet-uuid-4444';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UC-BOOK-01: Book Appointment Online', () => {
    test('Normal Flow: books appointment with status PENDING_APPROVAL, returns code, and queues confirmation email', async () => {
      // Slot 24 hours in future (valid BR-02)
      const validSlot = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      appointmentRepository.checkSlotAvailability.mockResolvedValue(true);
      appointmentRepository.insertAppointment.mockImplementation(async (data) => ({
        id: 'appt-1',
        ...data,
      }));

      const result = await appointmentService.createAppointment({
        petId: mockPetId,
        serviceId: mockServiceId,
        slot: validSlot,
        visitNote: 'Checkup',
        vetId: mockVetId,
        ownerId: mockOwnerId,
        user: mockUser,
      });

      expect(result.appointmentCode).toBeDefined();
      expect(result.appointment.status).toBe('PENDING_APPROVAL');
      expect(result.appointment.type).toBe('ROUTINE');
      expect(emailService.queueConfirmationEmail).toHaveBeenCalledWith(
        mockUser.email,
        result.appointmentCode
      );
    });

    test('Exception 1.0.E1: rejects slot less than 2 hours away (BR-02)', async () => {
      // 1 hour in future (< 2h)
      const invalidSlot = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await expect(
        appointmentService.createAppointment({
          petId: mockPetId,
          serviceId: mockServiceId,
          slot: invalidSlot,
          user: mockUser,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'BR02_MIN_ADVANCE_TIME',
      });
    });

    test('Exception 1.0.E1: rejects past slot (BR-02)', async () => {
      const pastSlot = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      await expect(
        appointmentService.createAppointment({
          petId: mockPetId,
          serviceId: mockServiceId,
          slot: pastSlot,
          user: mockUser,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'BR02_MIN_ADVANCE_TIME',
      });
    });

    test('Exception 1.0.E2: rejects slot more than 30 days ahead (BR-02)', async () => {
      // 35 days in future
      const farSlot = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

      await expect(
        appointmentService.createAppointment({
          petId: mockPetId,
          serviceId: mockServiceId,
          slot: farSlot,
          user: mockUser,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'BR02_MAX_ADVANCE_TIME',
      });
    });

    test('Exception 1.0.E3: rejects concurrent slot conflict with 409', async () => {
      const validSlot = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      appointmentRepository.checkSlotAvailability.mockResolvedValue(false); // slot taken

      await expect(
        appointmentService.createAppointment({
          petId: mockPetId,
          serviceId: mockServiceId,
          slot: validSlot,
          vetId: mockVetId,
          user: mockUser,
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'SLOT_CONFLICT',
      });
    });
  });

  describe('UC-BOOK-03: Cancel Appointment', () => {
    test('Normal Flow: cancels appointment when start time is >= 2 hours away', async () => {
      const appointmentId = 'appt-1';
      const futureStartTime = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5h away

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: futureStartTime,
        status: 'PENDING_APPROVAL',
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);
      appointmentRepository.updateStatus.mockResolvedValue({
        ...existing,
        status: 'CANCELLED',
      });

      const result = await appointmentService.cancelAppointment(appointmentId, mockUser);

      expect(result.appointment.status).toBe('CANCELLED');
      expect(appointmentRepository.updateStatus).toHaveBeenCalledWith(appointmentId, 'CANCELLED');
    });

    test('Exception 2.0.E1: rejects cancellation if scheduled start time is less than 2 hours away (BR-06)', async () => {
      const appointmentId = 'appt-near';
      const nearStartTime = new Date(Date.now() + 45 * 60 * 1000); // 45 mins away

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: nearStartTime,
        status: 'CONFIRMED',
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);

      await expect(
        appointmentService.cancelAppointment(appointmentId, mockUser)
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'BR06_CANCELLATION_TIME_LIMIT',
      });
    });

    test('Rejects cancellation if appointment is already CANCELLED', async () => {
      const appointmentId = 'appt-cancelled';
      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        status: 'CANCELLED',
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);

      await expect(
        appointmentService.cancelAppointment(appointmentId, mockUser)
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'ALREADY_CANCELLED',
      });
    });
  });

  describe('UC-BOOK-04: Reschedule Appointment', () => {
    test('Normal Flow: reschedules appointment to a new available slot', async () => {
      const appointmentId = 'appt-1';
      const currentStartTime = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5h away
      const newSlot = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h away

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: currentStartTime,
        status: 'PENDING_APPROVAL',
        vetId: { _id: mockVetId },
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);
      appointmentRepository.checkSlotAvailability.mockResolvedValue(true);
      appointmentRepository.updateAppointment.mockResolvedValue({
        ...existing,
        startTime: new Date(newSlot),
      });

      const result = await appointmentService.rescheduleAppointment(
        appointmentId,
        newSlot,
        mockUser
      );

      expect(appointmentRepository.updateAppointment).toHaveBeenCalledWith(
        appointmentId,
        { startTime: new Date(newSlot) }
      );
      expect(result.appointment.startTime).toEqual(new Date(newSlot));
    });

    test('Exception 3.0.E1: rejects rescheduling if current start time is less than 2 hours away (BR-06)', async () => {
      const appointmentId = 'appt-near';
      const nearStartTime = new Date(Date.now() + 30 * 60 * 1000); // 30m away
      const newSlot = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: nearStartTime,
        status: 'CONFIRMED',
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, newSlot, mockUser)
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'BR06_RESCHEDULE_TIME_LIMIT',
      });
    });

    test('Exception 3.0.E2: rejects if new slot violates BR-02 (< 2 hours)', async () => {
      const appointmentId = 'appt-1';
      const currentStartTime = new Date(Date.now() + 10 * 60 * 60 * 1000);
      const invalidNewSlot = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h away

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: currentStartTime,
        status: 'PENDING_APPROVAL',
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, invalidNewSlot, mockUser)
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'BR02_MIN_ADVANCE_TIME',
      });
    });

    test('Exception 3.0.E3: rejects concurrent new slot conflict with 409', async () => {
      const appointmentId = 'appt-1';
      const currentStartTime = new Date(Date.now() + 10 * 60 * 60 * 1000);
      const takenNewSlot = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const existing = {
        id: appointmentId,
        ownerId: mockOwnerId,
        startTime: currentStartTime,
        status: 'PENDING_APPROVAL',
        vetId: { _id: mockVetId },
      };
      appointmentRepository.findAppointment.mockResolvedValue(existing);
      appointmentRepository.checkSlotAvailability.mockResolvedValue(false); // Taken!
      scheduleService.getAvailableSlots.mockResolvedValue([]);

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, takenNewSlot, mockUser)
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'SLOT_CONFLICT',
      });
    });
  });

  describe('UC-BOOK-05: View Appointment List', () => {
    test('Normal Flow: returns appointments for the owner', async () => {
      const mockList = [
        { id: 'appt-1', appointmentCode: 'APT-1', ownerId: mockOwnerId },
        { id: 'appt-2', appointmentCode: 'APT-2', ownerId: mockOwnerId },
      ];
      appointmentRepository.findAppointmentsByOwner.mockResolvedValue(mockList);

      const result = await appointmentService.getAppointments(mockOwnerId, mockUser);

      expect(appointmentRepository.findAppointmentsByOwner).toHaveBeenCalledWith(mockOwnerId);
      expect(result).toHaveLength(2);
    });
  });
});

