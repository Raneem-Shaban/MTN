import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Tasks from '../Tasks/Tasks';
import TrainerTask from '../Tasks/TrainerTask';

const TaskWrapper = () => {
    const role = useSelector((state) => state.auth.user.role_id);

    if (role === 1 || role === 2) return <Tasks />;
    if (role === 3) return <TrainerTask />;
    return <Navigate to="/login" replace />;
};

export default TaskWrapper;
