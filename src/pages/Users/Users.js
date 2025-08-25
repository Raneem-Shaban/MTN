import React, { useState, useEffect } from 'react';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import FloatingActionButton from '../../components/common/buttons/FloatingActionButton';
import UserFormModal from '../../components/modals/UserFormModal';
import UserEditModal from '../../components/modals/UserEditModal';
import { API_BASE_URL } from '../../constants/constants';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const tabs = ['All users', 'SuperAdmin', 'Admin', 'Trainer', 'User', 'Assistant', 'Blocked Users'];

const userStatusColors = {
  Active: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  Suspended: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  Inactive: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  Pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },

};

const roleMap = {
  1: 'SuperAdmin',
  2: 'Admin',
  3: 'Trainer',
  4: 'Assistant',
  5: 'User',
};

const UsersPage = () => {
  const [selectedTab, setSelectedTab] = useState('All users');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);




  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        const formatted = data.map((user) => {
          let displayStatus = 'Blocked';

          if (user.status === 1) {
            displayStatus = user.email_verified_at ? 'Active' : 'Pending';
          }

          return {
            ...user,
            role: roleMap[user.role_id] || 'Unknown',
            status: displayStatus,
          };
        });

        setUsers(formatted);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);



  const handleAddUser = (formData) => {
    console.log('New User:', formData);

  };

  const filtered =
    selectedTab === 'All users'
      ? users
      : selectedTab === 'Blocked Users'
        ? users.filter((u) => u.status === 'Blocked')
        : users.filter((u) => u.role === selectedTab.slice(0, -1));

  const pageSize = 10;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRowClick = (row) => {
  };

  const handleEdit = (row) => {
    console.log('Edit user:', row);
    setSelectedUser(row);
    setIsEditOpen(true);
  };

  const handleUpdateUser = (updatedUserData) => {
    console.log('Updated user:', updatedUserData);
    setIsEditOpen(false);
  };

  const handleBlockToggle = (row) => {
    console.log(
      `${row.name} is now ${row.status === 'Inactive' ? 'Active' : 'Inactive'}`
    );
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      accessor: 'role',
      cell: (val) => (
        <span
          style={{
            color:
              val === 'SuperAdmin' || val === 'Admin'
                ? 'var(--color-secondary)'
                : val === 'Trainer'
                  ? 'var(--color-danger)'
                  : val === 'User' || val === 'Assistant'
                    ? 'var(--color-primary)'
                    : 'var(--color-warning)',
          }}
          className="font-medium"
        >
          {val}
        </span>
      ),
    },
    { header: 'Position', accessor: 'position' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (val) => <StatusBadge value={val} colorMap={userStatusColors} />,
    },
    {
      header: 'Edit',
      accessor: 'edit',
      cell: (_, row) => (
        <OutlineButton
          title="Edit"
          color="secondary"
          onClick={() => handleEdit(row)}
        />
      ),
    },
    {
      header: 'Block/Unblock',
      accessor: 'block',
      cell: (_, row) => (
        <OutlineButton
          title={
            row.status === 'Inactive' || row.status === 'Suspended'
              ? 'Unblock'
              : 'Block'
          }
          color="danger"
          onClick={() => handleBlockToggle(row)}
        />
      ),
    },
  ];

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">Users</h1>

      <FilterTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={(tab) => {
          setSelectedTab(tab);
          setCurrentPage(1);
        }}
      />
      <DynamicTable
        columns={columns}
        data={paginated}
        onRowClick={handleRowClick}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / pageSize)}
        onPageChange={setCurrentPage}
      />

      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        label="Add User"
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <UserEditModal
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
};

export default UsersPage;
