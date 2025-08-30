import React, { useState, useEffect } from 'react';
import TrainerInTask from '../trainerInTask/TrainerInTask';
import CategoryContainer from '../categoryContainer/CategoryContainer';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from "react-toastify";
const TrainersBoard = () => {
  const [trainers, setTrainers] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const loading = loadingCategories || isResetting;
  const [selectedCategories, setSelectedCategories] = useState([]);

  const availableCategories = allCategories.filter(c => !c.ownerId);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Token not found.");
        setLoadingCategories(false);
        return;
      }

      try {
        const [categoriesResponse, trainersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/userRoles/3`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // معالجة الفئات كما كانت سابقًا
        const categoriesFromApi = categoriesResponse.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          ownerId: cat.owner_id,
          owner: cat.owner,
          weight: cat.weight || 0,
        }));
        setAllCategories(categoriesFromApi);

        // معالجة المدربين بناءً على الشكل الجديد للـ API
        const trainersFromApi = trainersResponse.data.map(item => {
          const t = item["0"];
          const categories = t.categories || [];
          const totalWeight = categories.reduce((sum, cat) => sum + (cat.weight || 0), 0);

          return {
            id: t.id,
            name: t.name,
            delegation_id: t.delegation_id,
            categories: t.categories || [],
            totalWeight
          };
        });

        setTrainers(trainersFromApi);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);


  const handleResetAll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token not found');
      return;
    }

    setIsResetting(true);
    try {
      await axios.get(`${API_BASE_URL}/api/tasks/reset`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('All categories reset successfully');

      setAllCategories(prev => prev.map(cat => ({ ...cat, ownerId: null })));
    } catch (error) {
      console.error('Error resetting all categories:', error);
      toast.error('Failed to reset all categories');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCategoryAssigned = (categoryId, trainerId) => {
    setAllCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, ownerId: trainerId } : cat
      )
    );
  };

  const handleRandomAssign = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Token not found");
      return;
    }

    try {
      // إجراء التوزيع العشوائي
      await axios.get(`${API_BASE_URL}/api/random-assign`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // إعادة جلب جميع الفئات المحدثة
      const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const categoriesFromApi = categoriesResponse.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        ownerId: cat.owner_id,
        owner: cat.owner,
        weight: cat.weight || 0,
      }));

      setAllCategories(categoriesFromApi);
      toast.success('Random assignment completed successfully');
    } catch (error) {
      console.error("Error in random assignment:", error);
      toast.error('Failed to complete random assignment');
    }
  };


  const handleCategoryReset = async (categoryId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.get(`${API_BASE_URL}/api/tasks/reset/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Category reset successfully');

      setAllCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, ownerId: null } : cat
        )
      );
    } catch (error) {
      console.error('Error resetting category:', error);
      toast.error('Failed to reset category');
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row">

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader"></div>
        </div>
      )}
      <CategoryContainer
        categories={availableCategories}
        onCategoryDrop={handleCategoryReset}
        onResetAll={handleResetAll}
        isResetting={isResetting}
        onRandomAssign={handleRandomAssign}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      <div className="min-h-screen flex-1 p-4">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-4 justify-items-center">
          {trainers.map((trainer) => {
            const trainerCategories = allCategories.filter(
              (cat) => cat.ownerId === trainer.id
            );

            const delegationTrainer = trainers.find(t => t.id === trainer.delegation_id);

            return (
              <TrainerInTask
                key={trainer.id}
                name={trainer.name}
                delegationName={delegationTrainer?.name || ''}
                tasks={trainerCategories}
                totalWeight={trainer.totalWeight}
                isResetting={isResetting}
                allTrainers={trainers}
                trainerId={trainer.id}
                onCategoryAssigned={handleCategoryAssigned}
                setSelectedCategories={setSelectedCategories} // Add this
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainersBoard;
