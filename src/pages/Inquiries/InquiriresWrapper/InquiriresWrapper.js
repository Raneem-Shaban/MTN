import React from 'react'
import { useSelector } from 'react-redux';
import Inquiries from '../Inquiries';
import AdminInquiries from '../AdminInquiries';

const InquiriresWrapper = () => {
 const role = useSelector((state) => state.auth.user.role_id);

  if (role === 1 || role === 2) return <AdminInquiries/>;
  if (role ===3 ) return <Inquiries/>;

  return <div>لا تملك صلاحية الوصول للصفحة</div>;
}

export default InquiriresWrapper
