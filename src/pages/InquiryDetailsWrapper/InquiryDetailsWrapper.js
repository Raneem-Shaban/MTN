import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import UserInquiryDetails from '../Inquiries/UserInquiryDetails';
import TrainerInquiryDetails from '../Inquiries/TrainerInquiryDetails';
import InquiryDetails from "../Inquiries/InquiryDetails"
import AssistantInquiryDetails from '../Inquiries/AssistantInquiryDetails';

const InquiryDetailsWrapper = () => {
  const role = useSelector((state) => state.auth.user?.role_id);

  if (!role) return <Navigate to="/login" replace />;

  if (role === 1 || role === 2) return <InquiryDetails/>;
  if (role === 3) return <TrainerInquiryDetails/>;
  if (role === 4) return <AssistantInquiryDetails/>;
  if (role === 5) return <UserInquiryDetails/>;

  return <Navigate to="/login" replace />; 
};

export default InquiryDetailsWrapper;
