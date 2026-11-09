// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  Play,
} from 'lucide-react';
import labService from '../../services/labService';
import LabProcessingModal from '../../components/lab/LabProcessingModal';

export const LabDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [activeProcessingOrder, setActiveProcessingOrder] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await labService.getLabOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching lab queue orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcessSuccess = (updatedOrder) => {
    setFeedback({
      type: 'success',
      message: `Đã cập nhật kết quả xét nghiệm mã ${updatedOrder?.orderCode || ''} thành công!`,
    });
    fetchOrders();
    setTimeout(() => setFeedback(null), 5000);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      o.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'PENDING') return o.status === 'PENDING';
    if (selectedFilter === 'IN_PROGRESS') return o.status === 'IN_PROGRESS';
    if (selectedFilter === 'COMPLETED') return o.status === 'COMPLETED';
    if (selectedFilter === 'URGENT') return o.urgency === 'URGENT';

    return true;
  });

  // KPI Metrics
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const urgentCount = orders.filter((o) => o.urgency === 'URGENT' && o.status !== 'COMPLETED').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                Hàng đợi Xét nghiệm & Cận lâm sàng (LAB-02)
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
              Phòng Xét nghiệm & Chẩn đoán hình ảnh • {user?.fullName || 'Điều dưỡng / KTV'}
            </h1>
            <p className="text-xs text-slate-500">
              Tiếp nhận mẫu bệnh phẩm, thực hiện phân tích định lượng/định tính, tải ảnh chẩn đoán và chuyển kết quả đến Bác sĩ.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới hàng đợi</span>
        </button>
      </div>

      {/* Success Notification */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Chờ nhận mẫu (Pending)</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-amber-600 font-medium">Cần xử lý ngay</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-rose-800">Khẩn cấp (Urgent Priority)</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{urgentCount}</div>
            <span className="text-[11px] text-rose-600 font-bold">SLA 2 giờ (Top #1)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Đang phân tích</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</div>
            <span className="text-[11px] text-blue-600 font-medium">In Progress (Lưu nháp)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Play className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Đã trả kết quả</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Đã cập nhật vào EMR</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tất cả phiếu' },
              { id: 'PENDING', label: 'Chờ lấy mẫu', count: pendingCount },
              { id: 'IN_PROGRESS', label: 'Đang đo', count: inProgressCount },
              { id: 'COMPLETED', label: 'Đã hoàn tất', count: completedCount },
              { id: 'URGENT', label: 'Khẩn cấp', count: urgentCount, isUrgent: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === tab.id
                    ? tab.isUrgent
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedFilter === tab.id
                        ? 'bg-white text-indigo-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, thú cưng, loại xét nghiệm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Lab Queue Orders List */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải danh sách chỉ định cận lâm sàng...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Hàng đợi xét nghiệm trống</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không có yêu cầu xét nghiệm nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isUrgent = order.urgency === 'URGENT';
            return (
              <div
                key={order.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm transition-all space-y-3 ${
                  isUrgent && order.status !== 'COMPLETED'
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-gradient-to-r from-rose-50/40 via-white to-white'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      <FlaskConical className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm sm:text-base">
                          {order.testType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.urgency}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          #{order.orderCode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Bệnh nhân: <strong>{order.pet?.name}</strong> ({order.pet?.species})</span>
                        <span>•</span>
                        <span>Bác sĩ chỉ định: <strong>{order.vet?.fullName || 'Bác sĩ trực'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {order.status === 'IN_PROGRESS' && <Clock className="w-3.5 h-3.5" />}
                      {order.status === 'PENDING' && <AlertCircle className="w-3.5 h-3.5" />}
                      {order.status === 'COMPLETED'
                        ? 'Đã hoàn thành'
                        : order.status === 'IN_PROGRESS'
                        ? 'Đang đo chỉ số'
                        : 'Chờ lấy mẫu'}
                    </span>

                    {/* Action Button */}
                    <button
                      onClick={() => setActiveProcessingOrder(order)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-colors ${
                        order.status === 'COMPLETED'
                          ? 'bg-slate-700 hover:bg-slate-800'
                          : isUrgent
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {order.status === 'COMPLETED'
                          ? 'Xem / Sửa kết quả'
                          : order.status === 'IN_PROGRESS'
                          ? 'Nhập & Gửi kết quả'
                          : 'Tiếp nhận & Đo'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Clinical Notes & Result Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {order.requestNote && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Chỉ định lâm sàng từ Bác sĩ
                      </span>
                      <p className="text-slate-700 italic">"{order.requestNote}"</p>
                    </div>
                  )}

                  {order.resultSummary && (
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Kết luận cận lâm sàng
                      </span>
                      <p className="font-semibold text-emerald-950 truncate">
                        {order.resultSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Process Lab Order & Return Results (LAB-02) */}
      <LabProcessingModal
        order={activeProcessingOrder}
        isOpen={!!activeProcessingOrder}
        onClose={() => setActiveProcessingOrder(null)}
        onSuccess={handleProcessSuccess}
      />
    </div>
  );
};

export default LabDashboard;
