import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { UserPlus2 } from 'lucide-react';
import Input from '../common/inputs/Input';
import Select from '../common/inputs/Select';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi';
import { API_BASE_URL } from '../../constants/constants';

const UserFormModal = ({ isOpen, onClose, onSubmit }) => {
  const token = useSelector((state) => state.auth.user.token);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    section: '',
    position: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  const selectedRole = roles.find((r) => r.name === form.role);
  const role_id = selectedRole ? selectedRole.id : null;

  useEffect(() => {
    if (!isOpen) return;

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data);
      } catch {
        toast.error('Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(res.data);
      } catch {
        toast.error('Failed to load sections');
      } finally {
        setLoadingSections(false);
      }
    };

    fetchRoles();
    fetchSections();
  }, [isOpen, token]);

  const validateField = (field, value) => {
    if (!value) return 'Required';
    if (field === 'password_confirmation' && value !== form.password)
      return 'Passwords do not match';
    return '';
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (touched[field]) {
      setErrors({ ...errors, [field]: validateField(field, value) });
    }
    if (field === 'password' && touched.password_confirmation) {
      setErrors({
        ...errors,
        password_confirmation: validateField(
          'password_confirmation',
          form.password_confirmation
        ),
      });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors({ ...errors, [field]: validateField(field, form[field]) });
  };

  const getSectionId = (sectionLabel) => {
    const sectionObj = sections.find(
      (s) => `${s.name} (${s.division})` === sectionLabel
    );
    return sectionObj ? sectionObj.id : null;
  };


  const handleSubmit = async () => {
    const newErrors = {};
    const newTouched = {};
    for (const field in form) {
      newErrors[field] = validateField(field, form[field]);
      newTouched[field] = true;
    }
    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.values(newErrors).every((e) => !e)) {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/add_user`,
          {
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation,
            role_id,
            section_id: getSectionId(form.section),
            position: form.position,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('User added successfully!');
        onSubmit && onSubmit(res.data.user);
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add user.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--color-bg)] rounded-lg w-full max-w-md md:max-w-lg lg:max-w-xl relative max-h-[90vh] flex flex-col">
        <div className="flex justify-center mt-5">
          <div className="bg-[var(--color-trainer-task)] p-4 rounded-full border-4 border-white shadow-md -mt-12">
            <UserPlus2 size={24} className="text-[var(--color-secondary)]" />
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
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email && errors.email}
          />

          {/* Password Field */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && errors.password}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={(e) =>
                handleChange('password_confirmation', e.target.value)
              }
              onBlur={() => handleBlur('password_confirmation')}
              error={touched.password_confirmation && errors.password_confirmation}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-gray-500"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Input
            label="Position"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            error={touched.position && errors.position}
          />


          {/* Role & Section */}
          <div className="relative">
            <Select
              label="Role"
              options={roles.filter((r) => r.id !== 1).map((r) => r.name)}
              value={form.role}
              onChange={(value) => handleChange('role', value)}
              onBlur={() => handleBlur('role')}
              error={touched.role && errors.role}
            />
            <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          <div className="relative">
            <Select
              label="Section"
              options={sections.map((s) => `${s.name} (${s.division})`)}
              value={form.section}
              onChange={(value) => handleChange('section', value)}
              onBlur={() => handleBlur('section')}
              error={touched.section && errors.section}
            />
            <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
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

export default UserFormModal;
