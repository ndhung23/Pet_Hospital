const scheduleRepository = require('../repositories/ScheduleRepository');

class ScheduleService {
  /**
   * Generates standard 30-minute slots between shiftStart and shiftEnd (08:00 - 17:00)
   * Assumption: 30-minute consultation intervals
   */
  generateDailyTimeSlots(dateStr, shiftStart = '08:00', shiftEnd = '17:00') {
    const slots = [];
    const [startH, startM] = shiftStart.split(':').map(Number);
    const [endH, endM] = shiftEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let m = startMinutes; m < endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const hh = String(h).padStart(2, '0');
      const mm = String(min).padStart(2, '0');
      const slotTime = `${dateStr}T${hh}:${mm}:00.000Z`;
      slots.push({
        time: `${hh}:${mm}`,
        dateTime: slotTime,
      });
    }

    return slots;
  }

  /**
   * System presents the available veterinarians and dates
   * Sequence Diagram: getVeterinariansAndDates() -> findDutyRosters()
   */
  async getVeterinariansAndDates() {
    const rosters = await scheduleRepository.findDutyRosters();
    const veterinariansMap = new Map();
    const availableDatesSet = new Set();

    rosters.forEach((roster) => {
      const vetObj = roster.vet || roster.vetId;
      const vetIdStr = roster.vetId || (vetObj && (vetObj.id || vetObj._id));
      if (vetIdStr) {
        veterinariansMap.set(String(vetIdStr), {
          id: String(vetIdStr),
          name: vetObj?.fullName || vetObj?.name || 'Dr. Veterinarian',
          specialty: vetObj?.department || vetObj?.specialty || 'General Veterinary Medicine',
        });
      }
      if (roster.date) {
        availableDatesSet.add(roster.date);
      }
    });

    const veterinarians = Array.from(veterinariansMap.values());
    const dates = Array.from(availableDatesSet).sort();

    return {
      veterinarians,
      dates,
      rosters,
    };
  }

  /**
   * Retrieves available time slots for a veterinarian (or any) on a given date
   * Sequence Diagram: getAvailableSlots(vetId or any, date) -> findAvailableSlots -> queryBookedSlots
   * Alternative Flow 1.1: Any Available Veterinarian
   */
  async getAvailableSlots(vetId, date) {
    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }

    const isAnyVet = !vetId || vetId === 'any' || vetId === 'null';

    // 1. Find duty rosters for the date
    let rosters;
    if (isAnyVet) {
      rosters = await scheduleRepository.findRostersByDate(date);
    } else {
      const singleRoster = await scheduleRepository.findRosterByVetAndDate(vetId, date);
      rosters = singleRoster ? [singleRoster] : [];
    }

    if (rosters.length === 0) {
      return [];
    }

    // 2. Query already booked appointments for this date
    const booked = await scheduleRepository.queryBookedSlots(isAnyVet ? null : vetId, date);
    const bookedSet = new Set(
      booked.map((b) => `${new Date(b.startTime).toISOString()}_${b.vetId ? String(b.vetId) : 'any'}`)
    );

    // 3. Generate slots and filter
    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // BR-02: at least 2 hours

    const allSlots = this.generateDailyTimeSlots(date);
    const availableSlots = [];

    for (const slot of allSlots) {
      const slotDate = new Date(slot.dateTime);

      // Lock past slots or slots within 2 hours (BR-02)
      if (slotDate <= minAdvanceTime) {
        continue;
      }

      if (isAnyVet) {
        // Find if there is at least one rostered doctor whose slot is not booked
        const availableVetRoster = rosters.find((r) => {
          const vId = r.vetId || r.vet?.id;
          return !bookedSet.has(`${slot.dateTime}_${String(vId)}`);
        });

        if (availableVetRoster) {
          const vId = availableVetRoster.vetId || availableVetRoster.vet?.id;
          const vName = availableVetRoster.vet?.fullName || 'Available Veterinarian';
          availableSlots.push({
            dateTime: slot.dateTime,
            time: slot.time,
            vetId: String(vId),
            vetName: vName,
          });
        }
      } else {
        const isBooked = bookedSet.has(`${slot.dateTime}_${vetId}`);
        if (!isBooked) {
          availableSlots.push({
            dateTime: slot.dateTime,
            time: slot.time,
            vetId,
          });
        }
      }
    }

    return availableSlots;
  }
}

module.exports = new ScheduleService();
