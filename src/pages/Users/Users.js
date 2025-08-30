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
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import HighlightedText from '../../components/common/highlight/HighlightedText';

const tabs = ['All users', 'Admin', 'Trainer', 'User', 'Assistant', 'Blocked Users'];

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
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All users');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [delegations, setDelegations] = useState({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');


  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const [usersRes, sectionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/sections`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setSections(sectionsRes.data);

        // جلب delegations لكل role_id
        const roleIds = [...new Set(usersRes.data.map(u => u.role_id))];
        const delegationData = {};
        await Promise.all(
          roleIds.map(async (roleId) => {
            const res = await axios.get(`${API_BASE_URL}/api/userRoles/${roleId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const map = new Map();
            res.data.forEach(u => map.set(u.id, u.delegation_id || 'None'));
            delegationData[roleId] = map;
          })
        );
        setDelegations(delegationData);

        // تنسيق المستخدمين مع section و delegation
        const formattedUsers = usersRes.data.map((user) => {
          let displayStatus = 'Blocked';
          if (user.status === 1) displayStatus = user.email_verified_at ? 'Active' : 'Pending';

          const sectionObj = sectionsRes.data.find((s) => s.id === user.section_id);
          const sectionName = sectionObj?.name || 'Unknown';
          const divisionName = sectionObj?.division || 'Unknown';
          const delegationName = delegationData[user.role_id]?.get(user.id) || 'None';

          return {
            ...user,
            role: roleMap[user.role_id] || 'Unknown',
            status: displayStatus,
            rawStatus: user.status,
            section: sectionName,
            division: divisionName,
            delegation: delegationName,
          };
        });

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to fetch users or delegations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleSearch = async (query) => {
      setSearchQuery(query);
      const token = localStorage.getItem('token');

      if (!query) {
        // إذا خانة البحث فارغة، جلب كل المستخدمين
        fetchAllUsers();
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // تهيئة المستخدمين كما في fetchAllUsers
        const formattedUsers = Array.isArray(res.data)
          ? res.data.map((user) => {
            let displayStatus = 'Blocked';
            if (user.status === 1) displayStatus = user.email_verified_at ? 'Active' : 'Pending';

            const sectionObj = sections.find((s) => s.id === user.section_id);
            const sectionName = sectionObj?.name || 'Unknown';
            const divisionName = sectionObj?.division || 'Unknown';
            const delegationName = delegations[user.role_id]?.get(user.id) || 'None';

            return {
              ...user,
              role: roleMap[user.role_id] || 'Unknown',
              status: displayStatus,
              rawStatus: user.status,
              section: sectionName,
              division: divisionName,
              delegation: delegationName,
            };
          })
          : [];


        setUsers(formattedUsers);
        setCurrentPage(1); // إعادة الصفحة للأولى عند البحث
      } catch (error) {
        console.error('Search failed:', error);
        toast.error(error.response?.data?.message || 'Search failed');
      }
    };

    window.addEventListener('sectionSearch', (e) => handleSearch(e.detail));

    return () => window.removeEventListener('sectionSearch', (e) => handleSearch(e.detail));
  }, [sections, delegations]);

  const fetchAllUsers = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const [usersRes, sectionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/sections`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setSections(sectionsRes.data);

      const roleIds = [...new Set(usersRes.data.map(u => u.role_id))];
      const delegationData = {};
      await Promise.all(
        roleIds.map(async (roleId) => {
          const res = await axios.get(`${API_BASE_URL}/api/userRoles/${roleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const map = new Map();
          res.data.forEach(u => map.set(u.id, u.delegation_id || 'None'));
          delegationData[roleId] = map;
        })
      );
      setDelegations(delegationData);

      // تنسيق المستخدمين مع section و delegation
      const formattedUsers = usersRes.data.map((user) => {
        let displayStatus = 'Blocked';
        if (user.status === 1) displayStatus = user.email_verified_at ? 'Active' : 'Pending';

        const sectionObj = sectionsRes.data.find((s) => s.id === user.section_id);
        const sectionName = sectionObj?.name || 'Unknown';
        const divisionName = sectionObj?.division || 'Unknown';
        const delegationName = delegationData[user.role_id]?.get(user.id) || 'None';

        return {
          ...user,
          role: roleMap[user.role_id] || 'Unknown',
          status: displayStatus,
          rawStatus: user.status,
          section: sectionName,
          division: divisionName,
          delegation: delegationName,
        };
      });
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch users or delegations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);



  const handleAddUser = (newUser) => {
    let displayStatus = 'Blocked';
    if (newUser.status === 1) displayStatus = newUser.email_verified_at ? 'Active' : 'Pending';

    const sectionName = sections.find((s) => s.id === newUser.section_id)?.name || 'Unknown';
    const divisionName = newUser.section?.division || sections.find((s) => s.id === newUser.section_id)?.division || 'Unknown';
    const delegationName = delegations[newUser.role_id]?.get(newUser.id) || 'None';

    const formatted = {
      ...newUser,
      role: roleMap[newUser.role_id] || 'Unknown',
      status: displayStatus,
      rawStatus: newUser.status,
      position: newUser.position || '',
      section: sectionName,
      division: divisionName,
      delegation: delegationName,
    };

    setUsers((prev) => [formatted, ...prev]);
  };

  const handleEdit = (row) => {
    setSelectedUser(row);
    setIsEditOpen(true);
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


  const handleUpdateUser = async (updatedUserData) => {
    if (!selectedUser) return;

    const token = localStorage.getItem('token');

    const payload = cleanObject(updatedUserData);
    try {
      await axios.post(
        `${API_BASE_URL}/api/updateProfile/${selectedUser.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = { ...selectedUser, ...updatedUserData };

      // حافظ على rawStatus كما هو
      const displayStatus =
        updated.rawStatus === 1
          ? updated.email_verified_at
            ? 'Active'
            : 'Pending'
          : 'Blocked'; // محظور

      const sectionName = sections.find((s) => s.id === updated.section_id)?.name || 'Unknown';
      const delegationName = delegations[updated.role_id]?.get(updated.id) || 'None';

      const formatted = {
        ...updated,
        role: roleMap[updated.role_id] || 'Unknown',
        status: displayStatus,
        rawStatus: updated.rawStatus, // ← لا تغيّره
        section: sectionName,
        delegation: delegationName,
      };

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? formatted : u)));
      toast.success(`${updated.name} updated successfully!`);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsEditOpen(false);
    }
  };


  const filtered =
    selectedTab === 'All users'
      ? users
      : selectedTab === 'Blocked Users'
        ? users.filter((u) => u.rawStatus === 0) // فقط المحظورين
        : users.filter((u) => u.role === selectedTab);


  const pageSize = 10;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRowClick = (row) => {
  };

  const handleBlockToggle = async (row) => {
    const token = localStorage.getItem('token');

    // تحديد الحالة الجديدة بناءً على rawStatus (0 = blocked, 1 = active)
    const newRawStatus = row.rawStatus === 1 ? 0 : 1;

    try {
      await axios.post(
        `${API_BASE_URL}/api/block`,
        {
          user_id: row.id,
          status: newRawStatus, // نرسل 0 أو 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // تحديث المستخدم محلياً
      const displayStatus = newRawStatus === 1 ? 'Active' : 'Inactive';
      setUsers((prev) =>
        prev.map((user) =>
          user.id === row.id
            ? { ...user, status: displayStatus, rawStatus: newRawStatus }
            : user
        )
      );

      toast.success(
        `${row.name} has been ${newRawStatus === 1 ? 'unblocked' : 'blocked'} successfully!`
      );
    } catch (error) {
      console.error('Failed to block/unblock user:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };




  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (val) => <HighlightedText text={val} query={searchQuery} />
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (val) => <HighlightedText text={val} query={searchQuery} />
    },
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
      header: 'Section',
      accessor: 'section',
      cell: (val) => <HighlightedText text={val} query={searchQuery} />
    },
    { header: 'Division', accessor: 'division' },
    {
      header: 'Division',
      accessor: 'division',
      cell: (val) => <HighlightedText text={val} query={searchQuery} />
    },
    {
      header: 'Show Details', // ← العمود الجديد
      accessor: 'details',
      cell: (_, row) => (
        <OutlineButton
          title="Show Details"
          color="primary"
          onClick={() => navigate(`/users/${row.id}`)}
        />
      ),
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
          title={row.rawStatus === 0 ? 'Unblock' : 'Block'}
          color="danger"
          onClick={() => handleBlockToggle(row)}
        />

      ),
    },
  ];


  return (
    <div className="px-6 py-20">
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">Users</h1>

      <FilterTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={(tab) => {
          setSelectedTab(tab);
          setCurrentPage(1);
        }}
      />
      <div className="flex flex-col h-[calc(100vh-120px)] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader"></div>
          </div>
        )}

        <DynamicTable
          columns={columns}
          data={paginated}
          onRowClick={handleRowClick}
        />
      </div>


      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / pageSize)}
        onPageChange={setCurrentPage}
      />

      {currentUser.role_id !== 2 && (
        <FloatingActionButton
          onClick={() => setIsModalOpen(true)}
          label="Add User"
        />
      )}

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
