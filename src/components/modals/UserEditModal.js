import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { Pencil } from 'lucide-react';
import Input from '../common/inputs/Input';
import Select from '../common/inputs/Select';
import { FiChevronDown } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';

const UserEditModal = ({ isOpen, onClose, onSubmit, user }) => {
  const token = useSelector((state) => state.auth.user.token);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role_id: '',
    section_id: '',
    position: '',
    password: '',
    password_confirmation: '',
    delegation_id: '',
  });

  const [roles, setRoles] = useState([]);
  const [sections, setSections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // تحديث form عند تغيير المستخدم المحدد
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role_id: user.role_id || '',
        section_id: user.section_id || '',
        position: user.position || '',
        password: '',
        password_confirmation: '',
        delegation_id: user.delegation_id || '',
      });
    }
  }, [user]);

  // جلب roles, sections, users عند فتح المودال
  useEffect(() => {
    if (!isOpen) return;

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data);
      } catch (err) {
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
      } catch (err) {
        toast.error('Failed to load sections');
      } finally {
        setLoadingSections(false);
      }
    };

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchRoles();
    fetchSections();
    fetchUsers();
  }, [isOpen, token]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const cleanObject = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  };

  const handleSubmit = () => {
    const cleanedForm = cleanObject(form);
    onSubmit(form);
    onClose();
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
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => handleChange('password_confirmation', e.target.value)}
          />

          <Input
            label="Position"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
          />

          <div className="relative">
            <Select
              label="Role"
              options={roles.map((role) => role.name)}
              value={roles.find(r => r.id === form.role_id)?.name || ''}
              onChange={(value) => {
                const selectedRole = roles.find(r => r.name === value);
                handleChange('role_id', selectedRole?.id || '');
              }}
            />
            <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          {form.role_id === 3 && (
            <div className="relative">
              <Select
                label="Delegation"
                options={users.map((u) => u.name)}
                value={users.find(u => u.id === form.delegation_id)?.name || ''}
                onChange={(value) => {
                  const selectedUser = users.find(u => u.name === value);
                  handleChange('delegation_id', selectedUser?.id || '');
                }}
              />
              <FiChevronDown className="absolute right-3 top-9 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          )}
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
