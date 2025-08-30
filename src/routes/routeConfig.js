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
import ReportsWrapper from "../pages/ReportsWrapper/ReportsWrapper";
import HomeWrapper from "../pages/HomeWrapper/HomeWrapper";
import UserAddInquery from "../pages/Inquiries/UserAddInquery";
import InquiriresWrapper from "../pages/InquiriresWrapper/InquiriresWrapper"
import Login from "../pages/Auth/Login";
import TrainerDetails from "../pages/Trainers/TrainerDetails";
import SectionDetails from "../pages/Sections/SectionDetails";
import InquiryDetailsWrapper from "../pages/InquiryDetailsWrapper/InquiryDetailsWrapper";
import Profile from "../pages/Auth/Profile";
import UserDetails from "../pages/Users/UserDetails";
import GuestInquiries from "../pages/Guest/GuestInquiries";
import UserMyInquiries from "../pages/Inquiries/UserMyInquiries";
import TaskWrapper from "../pages/TaskWrapper/TaskWrapper";

const routes = [
  {
    path: '/login',
    element: <Login />,
    roles: [1, 2, 3, 4, 5],
  },
  {
    path: '/home',
    element: <HomeWrapper />,
    roles: [1, 2, 3, 4, 5],
  },
  {
    path: '/profile',
    element: <Profile />,
    roles: [1, 2, 3, 4, 5],
  },
  {
    path: '/users',
    element: <Users />,
    roles: [1, 2],
  },
  {
    path: '/users/:userId',
    element: <UserDetails />,
    roles: [1, 2],
  },
  {
    path: '/trainers',
    element: <Trainers />,
    roles: [1, 2],
  },
  {
    path: '/trainers/:id',
    element: <TrainerDetails />,
    roles: [1, 2],
  },
  {
    path: '/sections',
    element: <Sections />,
    roles: [1, 2],
  },
  {
    path: '/sections/:id',
    element: <SectionDetails />,
    roles: [1, 2],
  },
  {
    path: '/categories',
    element: <Categories />,
    roles: [1, 2],
  },
  {
    path: '/tasks',
    element: <TaskWrapper/>,
    roles: [1, 2, 3],
  },
  {
    path: '/inquiries',
    element: <InquiriresWrapper />,
    roles: [1, 2, 3, 4],
  },
  {
    path: '/myInquiries',
    element: <UserMyInquiries />,
    roles: [5],
  },
  {
    path: '/details/:id',
    element: <InquiryDetailsWrapper />,
    roles: [1, 2, 3, 4, 5],
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
