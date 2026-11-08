const prisma = require('../config/prisma');

class ScheduleRepository {
  /**
   * Find upcoming duty rosters with populated veterinarian details
   * Corresponds to Sequence Diagram: findDutyRosters() -> queryDutyRosters()
   */
  async findDutyRosters() {
    return prisma.dutyRoster.findMany({
      include: {
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Find all active veterinarians
   */
  async findActiveVeterinarians() {
    return prisma.user.findMany({
      where: {
        role: 'VETERINARIAN',
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  /**
   * Query booked slots for a veterinarian or all duty veterinarians on a date
   * Corresponds to Sequence Diagram: queryBookedSlots(vetId, date)
   */
  async queryBookedSlots(vetId, date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const where = {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED', 'REJECTED'],
      },
    };

    if (vetId && vetId !== 'any' && vetId !== 'null') {
      where.vetId = vetId;
    }

    return prisma.appointment.findMany({
      where,
      select: {
        startTime: true,
        vetId: true,
        status: true,
      },
    });
  }

  /**
   * Find roster for a specific veterinarian and date
   */
  async findRosterByVetAndDate(vetId, date) {
    return prisma.dutyRoster.findFirst({
      where: { vetId, date },
      include: {
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
   * Find all rosters for a given date
   */
  async findRostersByDate(date) {
    return prisma.dutyRoster.findMany({
      where: { date },
      include: {
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
}

module.exports = new ScheduleRepository();
