import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Stethoscope,
  Users,
  FileText,
  FlaskConical,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import emrService from '../../services/emrService';
import labService from '../../services/labService';
import EmrExaminationModal from '../../components/emr/EmrExaminationModal';
import EmrRecordList from '../../components/emr/EmrRecordList';
import LabOrderModal from '../../components/lab/LabOrderModal';
import EmrDetailModal from '../../components/emr/EmrDetailModal';

export const VetDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');

  // State for patients queue
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // State for medical records
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // State for lab orders
  const [labOrders, setLabOrders] = useState([]);
  const [labOrdersLoading, setLabOrdersLoading] = useState(false);

  // Modals state
  const [examiningPet, setExaminingPet] = useState(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  // Toast / notification state
  const [feedback, setFeedback] = useState(null);

  const fetchPatients = async (searchTerm = '') => {
    setPatientsLoading(true);
    try {
      const res = await emrService.getPatients(searchTerm);
      setPatients(res.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  };

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await emrService.getMedicalRecords();
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching EMR records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const fetchLabOrders = async () => {
    setLabOrdersLoading(true);
    try {
      const res = await labService.getLabOrders();
      setLabOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching lab orders:', err);
    } finally {
      setLabOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchRecords();
    fetchLabOrders();
  }, []);

  const handlePatientSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(patientSearch);
  };

  const handleExamSuccess = (newRecord) => {
    setFeedback({
      type: 'success',
      message: `Đã lưu hồ sơ bệnh án thành công cho bệnh nhân ${newRecord?.pet?.name || 'thú cưng'}!`,
    });
    fetchRecords();
    fetchPatients(patientSearch);
    fetchLabOrders();
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleLabOrderSuccess = (newOrder) => {
    setFeedback({
      type: 'success',
      message: `Đã phát hành chỉ định xét nghiệm mã ${newOrder?.orderCode || ''} thành công!`,
    });
    fetchLabOrders();
    fetchRecords();
    setTimeout(() => setFeedback(null), 5000);
  };

  // Metrics
  const completedToday = records.filter(
    (r) =>
      r.status === 'COMPLETED' || r.status === 'EXAMINATION_COMPLETED'
  ).length;

  const waitingLabCount = records.filter(
    (r) => r.status === 'WAITING_LAB_RESULT'
  ).length;

  const pendingLabCount = labOrders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Bàn khám Bác sĩ Thú y
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              Phòng khám lâm sàng • {user?.fullName || 'Bác sĩ điều trị'}
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý khám chữa bệnh (EMR-01), tra cứu bệnh án (EMR-02, EMR-03) và chỉ định cận lâm sàng (LAB-01).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsLabModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Chỉ định xét nghiệm (LAB-01)</span>
          </button>
        </div>
      </div>

      {/* Success / Info Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Bệnh nhân đã đăng ký</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">{patients.length}</div>
            <span className="text-[11px] text-blue-600 font-medium">Sẵn sàng tiếp nhận</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Đã hoàn thành khám</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{completedToday}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Bệnh án hoàn tất</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Chờ kết quả xét nghiệm</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{waitingLabCount}</div>
            <span className="text-[11px] text-amber-600 font-medium">WAITING_LAB_RESULT</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Chỉ định cận lâm sàng</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{labOrders.length}</div>
            <span className="text-[11px] text-indigo-600 font-medium">
              {pendingLabCount} đang chờ xử lý
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('patients')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'patients'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tiếp nhận & Khám bệnh (EMR-01)</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'records'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sổ bệnh án điện tử (EMR-02 / EMR-03)</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'records' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lab-orders')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'lab-orders'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Xét nghiệm đã chỉ định (LAB-01)</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'lab-orders' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {labOrders.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Patients Queue (EMR-01 Trigger) */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Danh sách thú cưng tiếp nhận khám lâm sàng
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn thú cưng và nhấn "Bắt đầu khám (EMR-01)" để ghi nhận sinh hiệu, chẩn đoán và chỉ định điều trị.
              </p>
            </div>

            <form onSubmit={handlePatientSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tên thú cưng, chủ nuôi, SĐT..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 sm:w-64"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Tìm
              </button>
            </form>
          </div>

          {/* Table */}
          {patientsLoading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Đang tải danh sách bệnh nhân...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Chưa có thú cưng nào được tìm thấy</p>
              <p className="text-xs text-slate-400">Vui lòng thay đổi từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Tên thú cưng</th>
                      <th className="py-3 px-3">Loài & Giống</th>
                      <th className="py-3 px-3">Chủ nuôi & SĐT</th>
                      <th className="py-3 px-3">Cân nặng gần nhất</th>
                      <th className="py-3 px-3">Lịch sử khám</th>
                      <th className="py-3 px-4 text-right">Thao tác lâm sàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((pet) => (
                      <tr key={pet.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{pet.name}</p>
                          <span className="text-[11px] text-slate-400">
                            Giới tính: {pet.gender || 'Chưa rõ'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-700 block">{pet.species}</span>
                          <span className="text-xs text-slate-400">{pet.breed || 'Chưa rõ giống'}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-slate-800">
                            {pet.owner?.user?.fullName || 'Khách vãng lai'}
                          </p>
                          <span className="text-xs text-slate-400">{pet.owner?.user?.phone || 'N/A'}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-700">
                            {pet.weight ? `${pet.weight} kg` : 'Chưa đo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            {pet._count?.medicalRecords || 0} bệnh án
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setExaminingPet(pet)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Bắt đầu khám (EMR-01)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Medical Records List (EMR-02 / EMR-03) */}
      {activeTab === 'records' && (
        <EmrRecordList
          records={records}
          loading={recordsLoading}
          onRefresh={fetchRecords}
          title="Sổ bệnh án điện tử bệnh viện (EMR-02 / EMR-03)"
          description="Hồ sơ bệnh án điện tử lưu trữ bất biến sau 24 giờ kể từ thời điểm chẩn đoán."
        />
      )}

      {/* Tab 3: Ordered Lab Tests (LAB-01 review) */}
      {activeTab === 'lab-orders' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Theo dõi xét nghiệm cận lâm sàng (Paraclinical Lab Tracking)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Các xét nghiệm đã phát hành cho Kỹ thuật viên / Điều dưỡng thực hiện.
              </p>
            </div>
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo chỉ định mới (LAB-01)</span>
            </button>
          </div>

          {labOrdersLoading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Đang tải danh sách xét nghiệm...</p>
            </div>
          ) : labOrders.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Chưa có chỉ định xét nghiệm nào</p>
              <p className="text-xs text-slate-400">Bấm "Tạo chỉ định mới" để gửi yêu cầu xét nghiệm đến Lab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {order.testType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.urgency === 'URGENT'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.urgency}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Mã: {order.orderCode} • Bệnh nhân: {order.pet?.name} ({order.pet?.species})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {order.requestNote && (
                    <p className="text-xs text-slate-600 italic">
                      Chỉ định bác sĩ: "{order.requestNote}"
                    </p>
                  )}

                  {order.resultSummary && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-1">
                      <span className="font-bold text-emerald-900 block">
                        Kết quả từ Điều dưỡng / Kỹ thuật viên ({order.nurse?.fullName || 'Lab Staff'}):
                      </span>
                      <p className="text-slate-700">{order.resultSummary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Conduct Examination & EMR (EMR-01) */}
      <EmrExaminationModal
        pet={examiningPet}
        isOpen={!!examiningPet}
        onClose={() => setExaminingPet(null)}
        onSuccess={handleExamSuccess}
      />

      {/* Modal: Issue Lab Order (LAB-01) */}
      <LabOrderModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onSuccess={handleLabOrderSuccess}
      />

      {/* Modal: View Record Detail (EMR-03) */}
      <EmrDetailModal
        record={viewingRecord}
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
      />
    </div>
  );
};

export default VetDashboard;
