import React from "react";
import { FaEnvelope, FaBuilding, FaSitemap, FaAt } from "react-icons/fa";
import InfoCard from "./InfoCard";

const UserInfo = ({ profile, lightTheme }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
    <InfoCard
      icon={<FaEnvelope />}
      label="Email"
      value={profile.email}
      lightTheme={lightTheme}
    />
    <InfoCard
      icon={<FaSitemap />}
      label="Section"
      value={profile.section?.name}
      lightTheme={lightTheme}
    />
    <InfoCard
      icon={<FaBuilding />}
      label="Division"
      value={profile.section?.division}
      lightTheme={lightTheme}
    />
    <InfoCard
      icon={<FaAt />}
      label="Section Email"
      value={profile.section?.email}
      lightTheme={lightTheme}
    />
  </div>
);

export default UserInfo;
