import React from 'react'
import { useSelector } from 'react-redux';
import Inquiries from '../Inquiries/Inquiries';
import AdminInquiries from '../Inquiries/AdminInquiries';
import { Navigate } from 'react-router-dom';
import AssistantInquiries from '../Inquiries/AssistantInquiries';

const InquiriresWrapper = () => {
  const role = useSelector((state) => state.auth.user.role_id);

  if (role === 1 || role === 2) return <AdminInquiries />;
  if (role === 3) return <Inquiries />;
  if (role === 4) return <AssistantInquiries />;

  return <Navigate to="/landing" replace />;
}

export default InquiriresWrapper
