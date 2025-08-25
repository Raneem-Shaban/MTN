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
import UserInquiryDetails from "../pages/Inquiries/UserInquiryDetails";
import UserAddInquery from "../pages/Inquiries/UserAddInquery";
import InquiriresWrapper from "../pages/Inquiries/InquiriresWrapper/InquiriresWrapper";
import Login from "../pages/Auth/Login";
import InquiryDetails from "../pages/Inquiries/InquiryDetails";
import TrainerDetails from "../pages/Trainers/TrainerDetails";
import SectionDetails from "../pages/Sections/SectionDetails";

const routes = [
  {
    path: '/login',
    element: <Login />,
    roles: [1, 2, 3, 4, 5],
  },
  {
    path: '/',
    element: <HomeWrapper />,
    roles: [1, 2, 4, 5],
  },
  {
    path: '/users',
    element: <Users />,
    roles: [1, 2],
  },
  {
    path: '/trainers',
    element: <Trainers />,
    roles: [1, 2],
  },
  {
    path: '/trainers/:id',
    element: <TrainerDetails/>,
    roles: [1, 2],
  },
  {
    path: '/sections',
    element: <Sections />,
    roles: [1, 2],
  },
  {
    path: '/sections/:id',
    element: <SectionDetails/>,
    roles: [1, 2],
  },
  {
    path: '/categories',
    element: <Categories />,
    roles: [1, 2],
  },
  {
    path: '/evaluations',
    element: <Evaluations />,
    roles: [1, 2],
  },
  {
    path: '/tasks',
    element: <Tasks />,
    roles: [1, 2],
  },
  {
    path: '/inquiries',
    element: <InquiriresWrapper />,
    roles: [1, 2, 3],
  },
  {
    path: '/details/:id',
    element: <InquiryDetails />,
    roles: [1, 2, 3],
  },
  {
    path: '/details/:id',
    element: <UserInquiryDetails />,
    roles: [4, 5],
  },
  {
    path: '/add',
    element: <UserAddInquery />,
    roles: [4, 5],
  },
  {
    path: '/reports',
    element: <ReportsWrapper />,
    roles: [1, 2, 3],
  },
  {
    path: '/favorite',
    element: <Favorite />,
    roles: [4, 5],
  },
];

export default routes;
