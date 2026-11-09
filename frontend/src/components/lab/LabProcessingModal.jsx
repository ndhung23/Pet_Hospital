import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  AlertTriangle,
  Save,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import labService from '../../services/labService';
import Alert from '../ui/Alert';

const LabProcessingModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [currentParameters, setCurrentParameters] = useState([]);
  const [measuredValues, setMeasuredValues] = useState({});
  const [resultSummary, setResultSummary] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [abnormalWarning, setAbnormalWarning] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      setErrorMessage('');
      setAbnormalWarning(false);
      setResultSummary(order.resultSummary || '');
      setResultImageUrl(order.resultImageUrl || '');

      labService.getLabCatalog().then((res) => {
        const cat = res.data || [];

        // Find parameters for the test type
        const match = cat.find(
          (c) => c.type.toLowerCase() === order.testType?.toLowerCase()
        );

        if (match && match.parameters) {
          setCurrentParameters(match.parameters);

          // Populate initial measured values from existing order or template
          const initial = {};
          match.parameters.forEach((param) => {
            if (order.resultValues && order.resultValues[param.name]) {
              const prev = order.resultValues[param.name];
              initial[param.name] = {
                value: typeof prev === 'object' ? prev.value : prev,
                unit: param.unit,
                refRange: param.refRange,
                flag: typeof prev === 'object' ? prev.flag : 'NORMAL',
              };
            } else {
              initial[param.name] = {
                value: '',
                unit: param.unit,
                refRange: param.refRange,
                flag: 'NORMAL',
              };
            }
          });
          setMeasuredValues(initial);
        } else if (order.resultValues) {
          setMeasuredValues(order.resultValues);
        } else {
          setCurrentParameters([]);
          setMeasuredValues({});
        }
      });
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  // Handle value change and check reference range
  const handleValueChange = (paramName, rawVal, refRange, unit) => {
    let flag = 'NORMAL';

    // Simple numeric range check if refRange format is "min - max"
    if (refRange && refRange.includes('-') && !isNaN(parseFloat(rawVal))) {
      const parts = refRange.split('-').map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const num = parseFloat(rawVal);
        if (num < parts[0]) flag = 'LOW';
        else if (num > parts[1]) flag = 'HIGH';
      }
    }

    const updated = {
      ...measuredValues,
      [paramName]: {
        value: rawVal,
        unit,
        refRange,
        flag,
      },
    };

    setMeasuredValues(updated);

    // Check if any abnormal flag
    const hasAbnormal = Object.values(updated).some(
      (v) => v.flag === 'HIGH' || v.flag === 'LOW'
    );
    setAbnormalWarning(hasAbnormal);
  };

  // Start test: change status to IN_PROGRESS
  const handleStartTest = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await labService.processLabOrder(order.id, {
        status: 'IN_PROGRESS',
        sampleTakenAt: new Date().toISOString(),
      });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save draft or submit completed results
  const handleSave = async (submitStatus = 'COMPLETED') => {
    if (submitStatus === 'COMPLETED' && !resultSummary.trim()) {
      setErrorMessage(
        'Vui lòng nhập kết luận và quan sát xét nghiệm trước khi hoàn tất (Submit Results)!'
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        status: submitStatus,
        resultValues: measuredValues,
        resultSummary: resultSummary.trim() || null,
        resultImageUrl: resultImageUrl.trim() || null,
      };

      const res = await labService.processLabOrder(order.id, payload);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Không thể lưu kết quả xét nghiệm.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Xử lý chỉ định xét nghiệm (LAB-02)
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.urgency === 'URGENT'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {order.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Mã phiếu: <strong>{order.orderCode}</strong> • Trạng thái: {order.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          {/* Abnormal Value Warning Banner (Alternative Flow 1.2) */}
          {abnormalWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cảnh báo chỉ số bất thường (Abnormal Value):</span>
                <p className="mt-0.5">
                  Phát hiện một hoặc nhiều chỉ số nằm ngoài khoảng tham chiếu bình thường (HIGH / LOW). Vui lòng xác nhận tính chính xác của dữ liệu trước khi gửi kết quả.
                </p>
              </div>
            </div>
          )}

          {/* Pet & Test Brief Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                Thông tin bệnh nhân & Xét nghiệm
              </span>
              <div className="font-bold text-slate-800">
                {order.pet?.name} ({order.pet?.species} • {order.pet?.breed || 'Chưa rõ giống'})
              </div>
              <div className="text-xs text-slate-600">
                Loại xét nghiệm: <strong className="text-indigo-900">{order.testType}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Chủ nuôi: {order.pet?.owner?.user?.fullName} ({order.pet?.owner?.user?.phone})
              </div>
            </div>

            <div className="space-y-1 md:border-l md:pl-4 border-indigo-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Chỉ định lâm sàng từ Bác sĩ
              </span>
              <div className="text-xs text-slate-700">
                Bác sĩ chỉ định: <strong>{order.vet?.fullName || 'Bác sĩ điều trị'}</strong>
              </div>
              <div className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-indigo-100">
                "{order.requestNote || 'Không có ghi chú thêm.'}"
              </div>
            </div>
          </div>

          {/* Action: Start test if status is PENDING */}
          {order.status === 'PENDING' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-blue-900 block">
                  Tiếp nhận mẫu bệnh phẩm
                </span>
                <span className="text-xs text-blue-700">
                  Bấm bắt đầu để chuyển trạng thái sang Đang xử lý (IN_PROGRESS) và ghi nhận thời gian nhận mẫu.
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartTest}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Tiếp nhận & Lấy mẫu
              </button>
            </div>
          )}

          {/* Parameters Input Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <span>Chỉ số đo đạc & Tham chiếu cận lâm sàng</span>
            </h3>

            {currentParameters.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 p-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold">
                      <th className="py-2 px-2">Thông số</th>
                      <th className="py-2 px-2">Giá trị đo</th>
                      <th className="py-2 px-2">Đơn vị</th>
                      <th className="py-2 px-2">Khoảng chuẩn</th>
                      <th className="py-2 px-2">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentParameters.map((param) => {
                      const cur = measuredValues[param.name] || {};
                      const isAbnormal = cur.flag === 'HIGH' || cur.flag === 'LOW';

                      return (
                        <tr key={param.name} className="hover:bg-slate-50">
                          <td className="py-2 px-2 font-semibold text-slate-800">
                            {param.name}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="Giá trị đo"
                              value={cur.value || ''}
                              onChange={(e) =>
                                handleValueChange(
                                  param.name,
                                  e.target.value,
                                  param.refRange,
                                  param.unit
                                )
                              }
                              className={`w-28 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-2 ${
                                isAbnormal
                                  ? 'border-rose-400 text-rose-700 bg-rose-50/50 font-bold focus:ring-rose-200'
                                  : 'border-slate-300 focus:ring-indigo-500'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-2 text-slate-500">{param.unit}</td>
                          <td className="py-2 px-2 text-slate-500 font-mono text-[11px]">
                            {param.refRange}
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cur.flag === 'HIGH'
                                  ? 'bg-rose-100 text-rose-700'
                                  : cur.flag === 'LOW'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {cur.flag || 'NORMAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                Nhập kết quả tự do hoặc quan sát cận lâm sàng dưới đây.
              </div>
            )}
          </div>

          {/* Diagnostic Summary / Observations */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Kết luận & Ghi nhận của Kỹ thuật viên (Observations / Diagnostic Conclusion) *
            </label>
            <textarea
              rows={3}
              placeholder="VD: Công thức máu ổn định, bạch cầu tăng nhẹ phản ứng viêm. Hồng cầu và tiểu cầu trong giới hạn bình thường..."
              value={resultSummary}
              onChange={(e) => setResultSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Image Evidence Attachment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Đường dẫn hình ảnh kết quả chẩn đoán (X-Ray / Siêu âm URL)</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com/images/xray-chest-001.jpg"
              value={resultImageUrl}
              onChange={(e) => setResultImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {resultImageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-48 flex items-center justify-center bg-black/5">
                <img
                  src={resultImageUrl}
                  alt="Preview"
                  className="max-h-48 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            SLA quy định: Routine 24 giờ • Urgent 2 giờ (BR-LAB-02)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>

            {/* Save Draft (Alternative flow 1.1) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('IN_PROGRESS')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu nháp (Draft)</span>
            </button>

            {/* Submit Results (Completed) */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('COMPLETED')}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang gửi...' : 'Gửi kết quả (Submit Results)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabProcessingModal;
