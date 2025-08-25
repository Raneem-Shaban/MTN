import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { LayoutDashboard } from 'lucide-react';
import Input from '../common/inputs/Input';
import { FiPlusCircle } from 'react-icons/fi';

const CategoryFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    weight: '', // تم إضافة حقل الوزن
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    if (!value || value.trim() === '') {
      return 'Required';
    }
    if (field === 'weight' && isNaN(value)) {
      return 'Weight must be a number';
    }
    return '';
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    const newTouched = {};

    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, form[field]);
      newTouched[field] = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.values(newErrors).every((e) => !e)) {
      onSubmit(form);
      onClose();
      setForm({ name: '', description: '', weight: '' }); // إعادة تعيين الحقول
      setErrors({});
      setTouched({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--color-bg)] rounded-lg w-full max-w-md md:max-w-lg lg:max-w-xl relative max-h-[90vh] flex flex-col">
        <div className="flex justify-center mt-5">
          <div className="bg-[var(--color-trainer-task)] p-4 rounded-full border-4 border-white shadow-md -mt-12">
            <LayoutDashboard size={24} className="text-[var(--color-secondary)]" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-2xl"
          >
            <IoClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-4 pb-2 space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name && errors.name}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            error={touched.description && errors.description}
          />
          <Input
            label="Weight"
            type="number"
            value={form.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            onBlur={() => handleBlur('weight')}
            error={touched.weight && errors.weight}
          />
        </div>

        <div className="px-6 py-4 mt-auto border-t bg-[var(--color-bg)] rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 border border-[var(--color-text-muted)] text-[var(--color-text-main)] py-2 rounded hover:bg-[var(--color-text-muted)] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-1/2 bg-[var(--color-secondary)] text-[var(--color-bg)] py-2 rounded hover:bg-[var(--color-secondary-hover)] transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
