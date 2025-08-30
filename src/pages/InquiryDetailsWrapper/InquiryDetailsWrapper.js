import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import UserInquiryDetails from '../Inquiries/UserInquiryDetails';
import TrainerInquiryDetails from '../Inquiries/TrainerInquiryDetails';
import InquiryDetails from "../Inquiries/InquiryDetails"

const InquiryDetailsWrapper = () => {
  const role = useSelector((state) => state.auth.user?.role_id);

  if (!role) return <Navigate to="/landing" replace />;

  if (role === 1 || role === 2) return <InquiryDetails/>;
  if (role === 5) return <UserInquiryDetails/>;
  if (role === 3 || role === 4) return <TrainerInquiryDetails/>;

  return <Navigate to="/landing" replace />; 
};

export default InquiryDetailsWrapper;
