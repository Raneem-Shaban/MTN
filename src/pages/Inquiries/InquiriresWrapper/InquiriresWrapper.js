import React from 'react'
import { useSelector } from 'react-redux';
import Inquiries from '../Inquiries';
import AdminInquiries from '../AdminInquiries';
import { Navigate } from 'react-router-dom';

const InquiriresWrapper = () => {
 const role = useSelector((state) => state.auth.user.role_id);

  if (role === 1 || role === 2) return <AdminInquiries/>;
  if (role ===3 ) return <Inquiries/>;

  return <Navigate to="/login" replace />; 
}

export default InquiriresWrapper
