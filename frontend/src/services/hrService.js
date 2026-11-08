import apiClient from './apiClient';

/**
 * UC-HR-01 / UC-HR-02 / UC-HR-03 — roster and leave management.
 */
export const hrService = {
  /* ---------------------------------------------------------- UC-HR-01 */

  // Clinical personnel available for rostering
  getAssignableStaff: async () => {
    const { data } = await apiClient.get('/hr/staff');
    return data.data;
  },

  // Weekly roster grid: week meta, shifts, approved leave, staff list
  getWeeklyRoster: async (weekStart) => {
    const url = weekStart ? `/hr/roster?weekStart=${weekStart}` : '/hr/roster';
    const { data } = await apiClient.get(url);
    return data.data;
  },

  assignShift: async (payload) => {
    const { data } = await apiClient.post('/hr/roster/shifts', payload);
    return data.data;
  },

  removeShift: async (shiftId) => {
    const { data } = await apiClient.delete(`/hr/roster/shifts/${shiftId}`);
    return data.data;
  },

  clonePreviousWeek: async (weekStart) => {
    const { data } = await apiClient.post('/hr/roster/clone', { weekStart });
    return data.data;
  },

  publishRoster: async (weekStart) => {
    const { data } = await apiClient.post('/hr/roster/publish', { weekStart });
    return data.data;
  },

  unpublishRoster: async (weekStart) => {
    const { data } = await apiClient.post('/hr/roster/unpublish', { weekStart });
    return data.data;
  },

  // Staff view of their own duty shifts
  getMyShifts: async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    const { data } = await apiClient.get(query ? `/hr/my-shifts?${query}` : '/hr/my-shifts');
    return data.data;
  },

  /* ---------------------------------------------------------- UC-HR-02 */

  submitLeaveRequest: async (payload) => {
    const { data } = await apiClient.post('/hr/leave-requests', payload);
    return data.data;
  },

  getMyLeaveRequests: async () => {
    const { data } = await apiClient.get('/hr/leave-requests/mine');
    return data.data;
  },

  cancelLeaveRequest: async (leaveId) => {
    const { data } = await apiClient.patch(`/hr/leave-requests/${leaveId}/cancel`);
    return data.data;
  },

  /* ---------------------------------------------------------- UC-HR-03 */

  // Manager review queue, enriched with shift + appointment impact
  getLeaveRequests: async (status = 'PENDING') => {
    const { data } = await apiClient.get(`/hr/leave-requests?status=${status}`);
    return data.data;
  },

  approveLeaveRequest: async (leaveId) => {
    const { data } = await apiClient.patch(`/hr/leave-requests/${leaveId}/approve`);
    return data.data;
  },

  rejectLeaveRequest: async (leaveId, rejectionReason) => {
    const { data } = await apiClient.patch(`/hr/leave-requests/${leaveId}/reject`, {
      rejectionReason,
    });
    return data.data;
  },
};

export default hrService;
