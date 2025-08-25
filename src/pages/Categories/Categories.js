import React, { useState, useEffect } from 'react';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import FloatingActionButton from '../../components/common/buttons/FloatingActionButton';
import CategoryFormModal from '../../components/modals/CategoryFormModal';
import EditCategoryModal from '../../components/modals/EditCategoryModal';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import axios from 'axios';

const tabs = ['Categories', 'Trashed Categories'];

const Categories = () => {
  const [selectedTab, setSelectedTab] = useState('Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);


  useEffect(() => {
    if (selectedTab === 'Trashed Categories') {
      fetchTrashedCategories();
    } else {
      fetchCategories();
    }
  }, [selectedTab]);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
  try {
    setLoading(true);
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setCategories(response.data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    setLoading(false);
  }
};


  const fetchTrashedCategories = async () => {
    const token = localStorage.getItem('token');
  try {
    setLoading(true);
    const response = await axios.get(`${API_BASE_URL}/api/categories/trashed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setCategories(response.data);
  } catch (error) {
    console.error('Failed to fetch trashed categories:', error);
  } finally {
    setLoading(false);
  }
};


 const handleUntrashCategory = async (categoryId) => {
  const token = localStorage.getItem('token');
  try {
    await axios.get(`${API_BASE_URL}/api/categories/restore/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('Category restored successfully!');
    fetchTrashedCategories();
  } catch (error) {
    console.error('Failed to untrash category:', error);
    
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }
};

  const handleMoveToTrash = async (category) => {
    const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/categories/${category.id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


    const result = response.data;

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    toast.success(result.message || 'Category moved to trash');
  } catch (error) {
    console.error('Failed to delete category:', error);
    const message = error.response?.data?.message || 'Something went wrong while deleting.';
    toast.error(message);
  }
};


  const handleAddCategory = async (formData) => {
    const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/categories`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    fetchCategories();
    toast.success('Category added successfully!');
  } catch (error) {
    console.error('Error while adding category:', error);
    const message = error.response?.data?.message || 'Failed to add category';
    toast.error(message);
  }
};

 const handleUpdateCategory = async (formData) => {
  const token = localStorage.getItem('token');
  try {
    const payload = {
      description: formData.description,
      weight: formData.weight,
    };

    // نضيف الاسم فقط لو اتغير عن الاسم الأصلي
    if (formData.name !== selectedCategory.name) {
      payload.name = formData.name;
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/categories/${formData.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 200) {
      fetchCategories();
      toast.success('Category updated successfully!');
    } else {
      toast.error(response.data.message || 'Failed to update category');
    }
  } catch (error) {
    console.error('Error while updating category:', error);
    const message = error.response?.data?.message || 'Something went wrong while updating category.';
    toast.error(message);
  }
};



  const pageSize = 5;
  const paginated = categories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Weight', accessor: 'weight' }, // عمود الوزن
  { 
    header: 'Owner', 
    accessor: 'owner', 
    cell: (_, row) => row.owner ? row.owner.name : '—' // إذا لم يوجد مالك يظهر "-"
  },
    ...(selectedTab === 'Categories'
      ? [
        {
          header: 'Update',
          accessor: 'update',
          cell: (_, row) => (
            <OutlineButton
              title="Update"
              color="primary"
              onClick={() => {
                setSelectedCategory(row);
                setEditModalOpen(true);
              }}
            />
          ),
        },
      ]
      : []),
    {
      header: selectedTab === 'Trashed Categories' ? 'Untrash' : 'Move to Trash',
      accessor: 'trashOrUntrash',
      cell: (_, row) =>
        selectedTab === 'Trashed Categories' ? (
          <OutlineButton
            title="Untrash"
            color="success"
            onClick={() => handleUntrashCategory(row.id)}
          />
        ) : (
          <OutlineButton
            title="Move to Trash"
            color="danger"
            onClick={() => handleMoveToTrash(row)}
          />
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center w-full">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6">
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-text-main)]">
        Categories
      </h1>

      <FilterTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={(tab) => {
          setSelectedTab(tab);
          setCurrentPage(1);
        }}
      />

      <DynamicTable columns={columns} data={paginated} />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(categories.length / pageSize)}
        onPageChange={setCurrentPage}
      />

      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        label="Add Category"
      />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <EditCategoryModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateCategory}
        initialData={selectedCategory}
      />
    </div>
  );
};

export default Categories;
