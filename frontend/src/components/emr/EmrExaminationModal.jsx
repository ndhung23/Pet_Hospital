import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Weight,
  Thermometer,
  HeartPulse,
  Plus,
  Trash2,
  FlaskConical,
  Pill,
  Save,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import emrService from '../../services/emrService';
import labService from '../../services/labService';
import Alert from '../ui/Alert';

const EmrExaminationModal = ({ pet, isOpen, onClose, onSuccess }) => {
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Diagnosis catalog
  const [catalog, setCatalog] = useState([]);
  const [labCatalog, setLabCatalog] = useState([]);

  // Inline lab orders (UC-LAB-01)
  const [labOrders, setLabOrders] = useState([]);

  // Inline prescriptions (UC-PRES-01)
  const [prescriptions, setPrescriptions] = useState([]);

  // Status & validation states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Pre-fill existing pet weight if available
      if (pet?.weight) {
        setWeight(pet.weight.toString());
      } else {
        setWeight('');
      }
      setTemperature('38.5');
      setHeartRate('110');
      setSymptoms('');
      setDiagnosis('');
      setTreatmentPlan('');
      setLabOrders([]);
      setPrescriptions([]);
      setErrorMessage('');
      setFieldErrors({});

      // Fetch catalogs
      emrService
        .getDiagnosisCatalog()
        .then((res) => setCatalog(res.data || []))
        .catch(() => {});

      labService
        .getLabCatalog()
        .then((res) => setLabCatalog(res.data || []))
        .catch(() => {});
    }
  }, [isOpen, pet]);

  if (!isOpen || !pet) return null;

  // Add a new lab order line
  const handleAddLabOrder = () => {
    const defaultTest = labCatalog[0]?.type || 'Complete Blood Count (CBC)';
    setLabOrders([
      ...labOrders,
      {
        testType: defaultTest,
        urgency: 'ROUTINE',
        requestNote: '',
      },
    ]);
  };

  const handleRemoveLabOrder = (index) => {
    setLabOrders(labOrders.filter((_, idx) => idx !== index));
  };

  const handleUpdateLabOrder = (index, field, value) => {
    const updated = [...labOrders];
    updated[index][field] = value;
    setLabOrders(updated);
  };

  // Add a new prescription line
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: '',
        dosage: '1 viên / 12 giờ',
        quantity: 1,
        unit: 'viên',
        duration: '5 ngày',
        instructions: 'Uống sau ăn 30 phút',
      },
    ]);
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handleUpdatePrescription = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  // Validate per Business Rule 3.0.E1: Weight and Diagnosis are strictly mandatory
  const validate = () => {
    const errors = {};
    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      errors.weight = 'Cân nặng là trường bắt buộc (BR 3.0.E1)';
    }
    if (!diagnosis || diagnosis.trim().length < 3) {
      errors.diagnosis = 'Chẩn đoán lâm sàng là trường bắt buộc (BR 3.0.E1)';
    }
    if (!treatmentPlan || treatmentPlan.trim().length < 3) {
      errors.treatmentPlan = 'Kế hoạch điều trị là trường bắt buộc';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      setErrorMessage(
        'Vui lòng điền đầy đủ các trường bắt buộc (Cân nặng, Chẩn đoán và Kế hoạch điều trị) theo quy định lâm sàng!'
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        petId: pet.id,
        weight: parseFloat(weight),
        temperature: temperature ? parseFloat(temperature) : null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        symptoms: symptoms.trim() || null,
        diagnosis: diagnosis.trim(),
        treatmentPlan: treatmentPlan.trim(),
        status: labOrders.length > 0 ? 'WAITING_LAB_RESULT' : 'EXAMINATION_COMPLETED',
        labOrders: labOrders.map((o) => ({
          testType: o.testType,
          urgency: o.urgency,
          requestNote: o.requestNote || null,
        })),
        prescriptions: prescriptions
          .filter((p) => p.medicineName.trim() !== '')
          .map((p) => ({
            medicineName: p.medicineName.trim(),
            dosage: p.dosage.trim(),
            quantity: parseInt(p.quantity, 10) || 1,
            unit: p.unit || 'viên',
            duration: p.duration || null,
            instructions: p.instructions || null,
          })),
      };

      const result = await emrService.conductExamination(payload);
      if (onSuccess) {
        onSuccess(result.data);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Không thể lưu hồ sơ bệnh án. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Thực hiện khám & Tạo bệnh án điện tử (EMR-01)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Bệnh nhân: <strong>{pet.name}</strong> ({pet.species} - {pet.breed || 'Chưa rõ giống'}) • Chủ nuôi:{' '}
                <strong>{pet.owner?.user?.fullName || 'Khách vãng lai'}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          {/* Section 1: Vital Signs (Chỉ số sinh hiệu bắt buộc) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                1. Đo chỉ số sinh hiệu (Vital Signs)
              </span>
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Cân nặng là trường bắt buộc (BR 3.0.E1)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {/* Weight */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cân nặng (kg) *</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="150"
                  placeholder="VD: 5.4"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.weight
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {fieldErrors.weight && (
                  <span className="text-[10px] text-rose-600 font-medium">
                    {fieldErrors.weight}
                  </span>
                )}
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Thân nhiệt (°C)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="32"
                  max="45"
                  placeholder="VD: 38.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">Thân nhiệt bình thường: 38.0 - 39.2 °C</span>
              </div>

              {/* Heart Rate */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  <span>Nhịp tim (bpm)</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  placeholder="VD: 110"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">Bình thường: 80 - 140 nhịp/phút</span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Findings & Diagnosis */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              2. Khám lâm sàng & Chẩn đoán bệnh
            </span>

            {/* Subjective/Objective Findings */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Triệu chứng lâm sàng & Ghi nhận khám thực thể (Subjective / Objective Findings)
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả triệu chứng bệnh, tình trạng lông, niêm mạc mắt, phản xạ đau, sờ nắn bụng, tiền sử gần đây..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Diagnosis (with ICD-Vet selector) */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-xs font-semibold text-slate-700">
                  Chẩn đoán xác định (Diagnosis - Bắt buộc *)
                </label>
                {catalog.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Chọn nhanh chuẩn ICD-Vet:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setDiagnosis(e.target.value);
                      }}
                      defaultValue=""
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                    >
                      <option value="">-- Danh mục chẩn đoán mẫu --</option>
                      {catalog.map((c) => (
                        <option key={c.code} value={`${c.code}: ${c.name}`}>
                          [{c.code}] {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="VD: K9-GE-01: Acute Canine Gastroenteritis hoặc Viêm đường hô hấp trên"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                  fieldErrors.diagnosis
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
                required
              />
              {fieldErrors.diagnosis && (
                <span className="text-[10px] text-rose-600 font-medium">
                  {fieldErrors.diagnosis}
                </span>
              )}
            </div>

            {/* Treatment Plan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Kế hoạch điều trị & Chế độ chăm sóc (Treatment Plan - Bắt buộc *)
              </label>
              <textarea
                rows={3}
                placeholder="Kế hoạch truyền dịch, tiêm hạ sốt, kháng viêm, hướng dẫn chế độ ăn uống, tái khám..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 leading-relaxed ${
                  fieldErrors.treatmentPlan
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
                required
              />
              {fieldErrors.treatmentPlan && (
                <span className="text-[10px] text-rose-600 font-medium">
                  {fieldErrors.treatmentPlan}
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Paraclinical Lab Orders (UC-LAB-01 Trigger) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  3. Chỉ định xét nghiệm cận lâm sàng (UC-LAB-01)
                </span>
                <p className="text-[11px] text-slate-400">
                  Nếu chỉ định xét nghiệm, hồ sơ sẽ chuyển trạng thái sang <strong>WAITING_LAB_RESULT</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddLabOrder}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm xét nghiệm</span>
              </button>
            </div>

            {labOrders.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Chưa có chỉ định xét nghiệm. Bấm "Thêm xét nghiệm" nếu cần thực hiện xét nghiệm máu, X-quang, siêu âm.
              </div>
            ) : (
              <div className="space-y-3">
                {labOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-900">
                        Chỉ định #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLabOrder(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Loại xét nghiệm / Kỹ thuật
                        </label>
                        <select
                          value={order.testType}
                          onChange={(e) =>
                            handleUpdateLabOrder(idx, 'testType', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {labCatalog.map((lc) => (
                            <option key={lc.type} value={lc.type}>
                              {lc.type} ({lc.category})
                            </option>
                          ))}
                          <option value="Custom Diagnostic Test">Xét nghiệm đặc biệt khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Mức độ ưu tiên (Urgency SLA)
                        </label>
                        <select
                          value={order.urgency}
                          onChange={(e) =>
                            handleUpdateLabOrder(idx, 'urgency', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="ROUTINE">Tiêu chuẩn (ROUTINE - SLA 24h)</option>
                          <option value="URGENT">Khẩn cấp (URGENT - Ưu tiên hàng đầu SLA 2h)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Ghi chú lâm sàng cho Kỹ thuật viên (VD: kiểm tra hồng cầu, nghi ngờ viêm tuỵ)..."
                        value={order.requestNote}
                        onChange={(e) =>
                          handleUpdateLabOrder(idx, 'requestNote', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Prescriptions (UC-PRES-01) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  4. Kê đơn thuốc điện tử (Prescription)
                </span>
                <p className="text-[11px] text-slate-400">
                  Kê đơn thuốc điều trị ngoại trú cho chủ nuôi theo dõi và điều trị tại nhà
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPrescription}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thuốc</span>
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Chưa có thuốc trong đơn. Bấm "Thêm thuốc" nếu chỉ định điều trị ngoại trú.
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        Thuốc #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Tên biệt dược / hoạt chất..."
                          value={p.medicineName}
                          onChange={(e) =>
                            handleUpdatePrescription(idx, 'medicineName', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Liều lượng (VD: 1 viên/lần)"
                          value={p.dosage}
                          onChange={(e) =>
                            handleUpdatePrescription(idx, 'dosage', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          min="1"
                          placeholder="SL"
                          value={p.quantity}
                          onChange={(e) =>
                            handleUpdatePrescription(idx, 'quantity', e.target.value)
                          }
                          className="w-16 px-2 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="viên/lọ"
                          value={p.unit}
                          onChange={(e) =>
                            handleUpdatePrescription(idx, 'unit', e.target.value)
                          }
                          className="flex-1 px-2 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Thời gian dùng (VD: 5 ngày, 7 ngày)"
                        value={p.duration}
                        onChange={(e) =>
                          handleUpdatePrescription(idx, 'duration', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Cách dùng (VD: Uống sau ăn 30 phút, sáng và tối)"
                        value={p.instructions}
                        onChange={(e) =>
                          handleUpdatePrescription(idx, 'instructions', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Khóa chỉnh sửa sau 24 giờ kể từ thời điểm hoàn tất khám (BR-EMR)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Đang lưu bệnh án...' : 'Lưu hồ sơ bệnh án (EMR)'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmrExaminationModal;
