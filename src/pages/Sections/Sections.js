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

const dummyInquiries = [
  { id: 1, question: 'How to submit reports?', answer: 'Use the reporting tool in your dashboard.', rating: 4, status: 'Open' },
  { id: 2, question: 'What is the design guideline?', answer: 'Check the design system documentation.', rating: 3, status: 'Closed' },
];

const dummyUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'John' },
  { id: 3, name: 'Sara' },
];

const Sections = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filterTab, setFilterTab] = useState('Sections');
  const [detailTab, setDetailTab] = useState('Inquiries'); 
  const [inquiryRatings, setInquiryRatings] = useState(
    Object.fromEntries(dummyInquiries.map((inq) => [inq.id, inq.rating]))
  );
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trashedSections, setTrashedSections] = useState([]);
  const sections = useSelector((state) => state.sections);
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

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


  const handleRatingChange = (id, newRating) => {
    setInquiryRatings((prev) => ({ ...prev, [id]: newRating }));
  };

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMoveToTrash = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to undo this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/sections/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(removeSection(id));


      toast.success('Section deleted immediately');
    } catch (error) {
      console.error(`Failed to delete section ${id}:`, error);
      toast.error('Something went wrong while deleting section');
    }
  };

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

      dispatch(removeSection(selectedSectionId));
      toast.success('Section deleted successfully!');
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



  const pageSize = 5;
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
    <div className="px-6 pt-6 overflow-hidden" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Sections Overview
      </h1>

      <FilterTabs
        tabs={['Sections', 'Trashed Sections']}
        selected={filterTab}
        onChange={setFilterTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col max-h-[calc(100vh-180px)] overflow-auto rounded-2xl">
          {loading ? (
            <div className="flex min-h-screen items-center justify-center w-full">
              <div className="loader"></div>
            </div>
          ) : (
            <DynamicTable
              columns={columns}
              data={sectionPage}
              onRowClick={setSelectedSection}
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

        <div className="bg-[var(--color-white)] rounded-2xl shadow-md flex flex-col max-h-[calc(100vh-240px)]">
          {selectedSection ? (
            <>
              <div className="sticky top-0 z-10 bg-[var(--color-white)] px-6 pt-4 border-b rounded-t-2xl border-[var(--color-border)]">
                <h2 className="text-xl font-semibold text-[var(--color-text-main)]">
                  {selectedSection.name}'s Details
                </h2>
                <FilterTabs
                  tabs={['Inquiries', 'Users']}
                  selected={detailTab}
                  onChange={setDetailTab}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {detailTab === 'Inquiries' ? (
                  (filterTab === 'Sections' ? dummyInquiries : dummyInquiries).length > 0 ? (
                    (filterTab === 'Sections' ? dummyInquiries : dummyInquiries).map((inquiry) => (

                      <div
                        key={inquiry.id}
                        className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg)]"
                      >
                        <InquiryAnswer
                          question={inquiry.question}
                          answer={inquiry.answer}
                          status={inquiry.status}
                          expanded={expandedAnswers[inquiry.id]}
                          onToggle={() => toggleAnswer(inquiry.id)}
                        />
                        {expandedAnswers[inquiry.id] && (
                          <div className="mt-2">
                            <span className="text-[var(--color-text-muted)] mr-2">
                              Rate this answer:
                            </span>
                            <RatingStars
                              value={inquiryRatings[inquiry.id]}
                              onChange={(val) => handleRatingChange(inquiry.id, val)}
                              color="var(--color-primary)"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--color-text-secondary)]">
                      No inquiries for this section yet.
                    </p>
                  )
                ) : (
                  <>
                    <ul className="space-y-2">
                      {dummyUsers.map((user) => (
                        <li
                          key={user.id}
                          className="px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]"
                        >
                          {user.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-[var(--color-text-muted)] py-12 flex flex-col items-center justify-center h-full">
              <UserCircle size={42} className="mb-2 text-[var(--color-text-muted)]" />
              <p className="text-lg">Select a section to view details</p>
              <p className="text-sm mt-1">Click on any section row</p>
            </div>
          )}
        </div>
      </div>

      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        label="Add Section"
      />

      <SectionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSection}
      />
      <EditSectionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSection(null);
        }}
        onSubmit={handleUpdateSection}
        initialData={editingSection}
      />

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={confirmDeleteSection}
          onCancel={cancelDelete}
          message="Are you sure you want to delete this section? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default Sections;

