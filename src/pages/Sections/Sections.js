import React, { useState, useEffect } from 'react';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import FilterTabs from '../../components/common/filters/FilterTabs';
import InquiryAnswer from '../../components/common/collabses/InquiryAnswer';
import RatingStars from '../../components/common/ratings/RatingStars';
import { UserCircle } from 'lucide-react';
import FloatingActionButton from '../../components/common/buttons/FloatingActionButton';
import SectionFormModal from '../../components/modals/SectionFormModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../constants/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setSections, addSection, removeSection } from '../../store/slices/sectionSlice';
import EditSectionModal from '../../components/modals/EditSectionModal';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';


const Sections = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTab, setFilterTab] = useState('Sections');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trashedSections, setTrashedSections] = useState([]);
  const sections = useSelector((state) => state.sections);
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSearchEvent = (e) => {
      const query = e.detail;
      handleSearch(query);
    };

    window.addEventListener("sectionSearch", handleSearchEvent);
    return () => {
      window.removeEventListener("sectionSearch", handleSearchEvent);
    };
  }, []);


  useEffect(() => {
    const fetchSections = async () => {

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const [activeRes, trashedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/sections`),
          axios.get(`${API_BASE_URL}/api/sections/trashed`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const format = (arr) =>
          arr.map((section) => ({
            id: section.id,
            name: section.name,
            division: section.division,
            usersCount: section.users_count,
            email: section.email,
          }));

        dispatch(setSections(format(activeRes.data)));
        setTrashedSections(format(trashedRes.data));
      } catch (err) {
        console.error('Error fetching sections:', err);
        toast.error('Failed to fetch sections');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const confirmDeleteSection = async () => {
    if (!selectedSectionId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/sections/${selectedSectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔹 اجلب القسم المحذوف
      const deletedSection = sections.find((sec) => sec.id === selectedSectionId);

      // 🔹 احذفه من القائمة الرئيسية
      dispatch(removeSection(selectedSectionId));

      // 🔹 ضيفه على قائمة trashed
      if (deletedSection) {
        setTrashedSections((prev) => [...prev, deletedSection]);
      }

      toast.success('Section moved to trash');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    } finally {
      setShowDeleteModal(false);
      setSelectedSectionId(null);
    }
  };


  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedSectionId(null);
  };


  const handleUntrash = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      await axios.get(`${API_BASE_URL}/api/sections/restore/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const restored = trashedSections.find((section) => section.id === id);
      setTrashedSections((prev) => prev.filter((section) => section.id !== id));
      dispatch(addSection(restored));

      toast.success('Section has been restored successfully!');
    } catch (error) {
      console.error(`Failed to restore section ${id}:`, error);
      toast.error('Failed to restore section');
    }
  };


  const handleAddSection = async (newSection) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/sections`, newSection, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const addedSection = {
        id: response.data.id,
        name: newSection.name,
        division: newSection.division,
        email: newSection.email,
        usersCount: 0,
      };

      dispatch(addSection(addedSection));
      setCurrentPage(1);

      toast.success('Section added successfully!');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  const handleUpdateSection = async (updatedSection) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/sections/${editingSection.id}`, updatedSection, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(setSections(
        sections.map((sec) =>
          sec.id === editingSection.id
            ? { ...sec, ...updatedSection }
            : sec
        )
      ));

      toast.success('Section updated successfully!');
    } catch (error) {
      console.error("Error updating section:", error.response || error);
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    } finally {
      setIsEditModalOpen(false);
      setEditingSection(null);
    }
  };

  const handleSearch = async (query) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/sections/search?query=${encodeURIComponent(query || "")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        if (data.length === 0) {
          toast.info("No matching results found.");
          dispatch(setSections([]));
        } else {
          const formatted = data.map((section) => ({
            id: section.id,
            name: section.name,
            division: section.division,
            usersCount: section.users_count,
            email: section.email,
          }));
          dispatch(setSections(formatted));
        }
      } else if (data && data.message) {
        toast.info(data.message);
        dispatch(setSections([]));
      } else {
        toast.info("No results found");
        dispatch(setSections([]));
      }
    } catch (error) {
      console.error("Error searching sections:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };



  const pageSize = 10;
  const filteredSections = filterTab === 'Sections' ? sections : trashedSections;
  const sectionPage = filteredSections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { header: 'Section', accessor: 'name' },
    { header: 'Division', accessor: 'division' },
    { header: 'Email', accessor: 'email' },
    { header: 'Users', accessor: 'usersCount' },
    {
      header: 'Show',
      accessor: 'show',
      cell: (_value, row) => (
        <OutlineButton
          title="Show"
          color="secondary"
          onClick={() => navigate(`/sections/${row.id}`)}
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (_value, row) =>
        filterTab === 'Sections' ? (
          <div className="flex gap-2">
            <OutlineButton
              title="Edit"
              color="primary"
              onClick={() => {
                setEditingSection(row);
                setIsEditModalOpen(true);
              }}
            />
            <OutlineButton
              title="Delete"
              color="danger"
              onClick={() => {
                setSelectedSectionId(row.id);
                setShowDeleteModal(true);
              }}
            />
          </div>
        ) : (
          <OutlineButton
            title="Untrash"
            color="secondary"
            onClick={() => handleUntrash(row.id)}
          />
        ),
    }
  ];


  return (
    <div className="px-6 py-20" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Sections
      </h1>

      <FilterTabs
        tabs={['Sections', 'Trashed Sections']}
        selected={filterTab}
        onChange={setFilterTab}
      />

      <div className="flex flex-col">
        {loading ? (
          <div className="flex min-h-screen items-center justify-center w-full">
            <div className="loader"></div>
          </div>
        ) : (
          <DynamicTable
            columns={columns}
            data={sectionPage}
            // onRowClick={(row) => navigate(`/sections/${row.id}`)} // ⬅️ أو النقر على السطر
            rowClassName="hover:bg-[var(--color-white)] cursor-pointer transition duration-200 rounded"
          />
        )}

        <div className="mt-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSections.length / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        label="Add Section"
      />

      <SectionFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddSection} />

      <EditSectionModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingSection(null); }} onSubmit={handleUpdateSection} initialData={editingSection} />

      {showDeleteModal && (<DeleteConfirmationModal onConfirm={confirmDeleteSection} onCancel={cancelDelete} message="Are you sure you want to delete this section? This action cannot be undone." />)}
    </div>
  );
};

export default Sections;

