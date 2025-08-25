import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { Pencil } from 'lucide-react';
import Input from '../common/inputs/Input';
import Select from '../common/inputs/Select';
import { FiChevronDown } from 'react-icons/fi';

const UserEditModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    section: '',
    position: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        section: user.section || '',
        position: user.position || '',
      });
    }
  }, [user]);

  const validateField = (field, value) => {
    if (!value) return 'Required';
    return '';
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, form[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = () => {
    const newErrors = {};
    const newTouched = {};

    for (const field in form) {
      newErrors[field] = validateField(field, form[field]);
      newTouched[field] = true;
    }

    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.values(newErrors).every((e) => !e)) {
      onSubmit(form);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--color-bg)] p-6 rounded-lg w-full max-w-md md:max-w-lg lg:max-w-xl relative">
        <div className="flex justify-center -mt-16 mb-6">
          <div className="bg-blue-100 p-4 rounded-full border-4 border-[var(--color-bg)] shadow-md">
            <Pencil className="text-[var(--color-secondary)] text-2xl" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-2xl"
        >
          <IoClose />
        </button>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto px-3 pb-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name && errors.name}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email && errors.email}
          />
          <div className="relative">
            <Select
              className="w-full border border-[var(--color-text-muted)] p-3 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              label="Role"
              options={['Supervisor', 'Trainer', 'User']}
              value={form.role}
              onChange={(value) => handleChange('role', value)}
              onBlur={() => handleBlur('role')}
              error={touched.role && errors.role}
            />
            <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          <div className="relative">
            <Select
              className="w-full border border-[var(--color-text-muted)] p-3 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              label="Section"
              options={['Training', 'Support', 'Sales']}
              value={form.section}
              onChange={(value) => handleChange('section', value)}
              onBlur={() => handleBlur('section')}
              error={touched.section && errors.section}
            />
            <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          <Input
            label="Position"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            error={touched.position && errors.position}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 border border-[var(--color-text-muted)] text-[var(--color-text-main)] hover:bg-[var(--color-text-muted)] py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-1/2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
