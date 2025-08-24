import HomePage from "../pages/Home/HomePage";
import UserHome from "../pages/Home/UserHome";
import Users from "../pages/Users/Users";
import Trainers from "../pages/Trainers/Trainers";
import Sections from "../pages/Sections/Sections";
import Tasks from "../pages/Tasks/Tasks";
import Inquiries from "../pages/Inquiries/Inquiries";
import Reports from "../pages/Reports/Reports";
import TrainerReports from "../pages/TrainerReports/TrainerReports";
import Favorite from "../pages/Favorite/Favorite";
import Unauthorized from "../pages/Unauthorized/Unauthorized";
import Categories from "../pages/Categories/Categories";
import Evaluations from "../pages/Evaluations/Evaluations";
import ReportsWrapper from "../pages/ReportsWrapper/ReportsWrapper";
import HomeWrapper from "../pages/HomeWrapper/HomeWrapper";
import UserLandingPage from "../pages/Landing/UserLandingPage";
import UserInquiryDetails from "../pages/Inquiries/UserInquiryDetails"
import UserAddInquery from "../pages/Inquiries/UserAddInquery"

const routes = [
  // home routes
  {
    path: '/',
    element: <HomeWrapper />,
    roles: [1, 2, 3, 4, 5], // الكل باستثناء المدرب
  },

  // users
  {
    path: '/users',
    element: <Users />,
    roles: [1, 2], // مدير، مشرف
  },

  // trainers
  {
    path: '/trainers',
    element: <Trainers />,
    roles: [1, 2], // مدير، مشرف
  },

  // sections
  {
    path: '/sections',
    element: <Sections />,
    roles: [1, 2], // مدير، مشرف
  },

  // categories
  {
    path: '/categories',
    element: <Categories />,
    roles: [1, 2], // مدير، مشرف
  },

  // evaluations
  {
    path: '/evaluations',
    element: <Evaluations />,
    roles: [1, 2], // مدير، مشرف
  },

  // tasks
  {
    path: '/tasks',
    element: <Tasks />,
    roles: [1, 2], // مدير، مشرف
  },

  // inquiries
  {
    path: '/inquiries',
    element: <Inquiries />,
    roles: [3], // مدرب فقط
  },

  // inquirey detail 
  {
    path: '/details/:id',
    element: <UserInquiryDetails />,
    roles: [4, 5],
  },
  // add inquirey 
  {
    path: '/add',
    element: <UserAddInquery />,
    roles: [4, 5],
  },
  // reports
  {
    path: '/reports',
    element: <ReportsWrapper />, // كومبوننت ذكي يعرض حسب الدور
    roles: [1, 2, 3], // كل من يملك حق الدخول
  },

  // favorite
  {
    path: '/favorite',
    element: <Favorite />,
    roles: [4, 5], // مستخدم، مساعد
  },

  // unauthorized (مسار مخصص لعرض رسالة في حال عدم وجود صلاحية)
  {
    path: '/unauthorized',
    element: <Unauthorized />,
    roles: [1, 2, 3, 4, 5], // الكل يمكنه رؤية هذه الصفحة
  },
];

export default routes;
