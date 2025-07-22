import React, { useState, useEffect } from 'react';
import TrainerInTask from '../trainerInTask/TrainerInTask';
import CategoryContainer from '../categoryContainer/CategoryContainer';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';

const TrainersBoard = () => {
  const [trainers, setTrainers] = useState([]); // جلب trainers من API
  const [tasks, setTasks] = useState([]);       // جلب معلومات إضافية لكل trainer
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [allCategories, setAllCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [assignedCategories, setAssignedCategories] = useState({});

  useEffect(() => {
    const fetchTrainers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Token not found.");
        setLoadingTrainers(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/userRoles/3`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrainers(res.data);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      } finally {
        setLoadingTrainers(false);
      }
    };

    fetchTrainers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Token not found.");
        setLoadingTasks(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Token not found.");
        setLoadingCategories(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const categoriesFromApi = response.data.map(cat => ({
          name: cat.name,
          description: cat.description,
        }));

        setAllCategories(categoriesFromApi);
        setAvailableCategories(categoriesFromApi);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Reset handler
  const handleResetAll = () => {
    setIsResetting(true);

    setTimeout(() => {
      const allAssigned = Object.values(assignedCategories).flat();
      const newAvailable = Array.from(new Set([...availableCategories, ...allAssigned]));

      const newAssigned = {};
      trainers.forEach((trainer) => {
        newAssigned[trainer.name] = [];
      });

      setAvailableCategories(newAvailable);
      setAssignedCategories(newAssigned);
      setIsResetting(false);
    }, 500);
  };

  const hasAssignedCategories = Object.values(assignedCategories).some(arr => arr.length > 0);

  // تحميل؟
  if (loadingTrainers || loadingTasks || loadingCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <CategoryContainer
        categories={availableCategories}
        onResetAll={handleResetAll}
        hasAssignedCategories={hasAssignedCategories}
      />

      <div className="min-h-screen flex-1">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-4 justify-items-center">
          {trainers.map((trainer) => {
            // البحث عن task المرتبط بـ trainer حسب الاسم أو ID
            const matchingTask = tasks.find(
              (task) => task.owner?.id === trainer.id
            );

            const category = matchingTask?.category
              ? [{
                name: matchingTask.category.name,
                description: matchingTask.category.description,
              }]
              : [];

            const delegation = matchingTask?.delegation?.name || '';

            return (
              <TrainerInTask
                key={trainer.id}
                name={trainer.name}
                delegationName={delegation}
                categories={category}
                isResetting={isResetting}
                allTrainers={trainers}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainersBoard;