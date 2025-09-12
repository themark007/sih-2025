import React, { useEffect } from "react";
import Header from "../components/Header/Header";
import FarmerInfo from "../components/FarmerInfo/FarmerInfo";
import ActionButtons from "../components/ActionButtons/ActionButtons";
import useProfileStore from "../src/store/profileStore";

import "./Dashboard.css";

const Dashboard = () => {
  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const error = useProfileStore((s) => s.error);
  const loadProfileFromPhone = useProfileStore((s) => s.loadProfileFromPhone);

   

  useEffect(() => {
    const phone = localStorage.getItem("phone");
    if (!profile && phone) {
      loadProfileFromPhone(phone);
    }
  }, [profile, loadProfileFromPhone]);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        {loading ? (
          <div className="loader-container">
            <div className="loader" />
            <div>Loading profile...</div>
          </div>
        ) : error ? (
          <div className="profile-error">Error: {error}</div>
        ) : profile ? (
          <>
            <FarmerInfo farmer={profile} />
            <ActionButtons />
          </>
        ) : (
          <div className="no-profile">
            <p>No profile found. Please create one.</p>
            <ActionButtons />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
