import React, { useEffect , useState} from "react";
import Header from "../components/Header/Header";
import FarmerInfo from "../components/FarmerInfo/FarmerInfo";
import ActionButtons from "../components/ActionButtons/ActionButtons";
import useProfileStore from "../src/store/profileStore";

import "./Dashboard.css";

const Dashboard = () => {
  const [language, setLanguage] = useState(
      localStorage.getItem("language") || "en"
  );
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
            <div>
              {language === "en"
                ? "Loading profile..."
                : "പ്രൊഫൈൽ ലോഡ് ചെയ്യുന്നു..."}
            </div>
          </div>
        ) : error ? (
          <div className="profile-error">
            {language === "en" ? `Error: ${error}` : `പിശക്: ${error}`}
          </div>
        ) : profile ? (
          <>
            <FarmerInfo farmer={profile} />
            <ActionButtons />
          </>
        ) : (
          <div className="no-profile">
            <p>
              {language === "en"
                ? "No profile found. Please create one."
                : "പ്രൊഫൈൽ കണ്ടെത്താനായില്ല. ദയവായി ഒരു പ്രൊഫൈൽ സൃഷ്ടിക്കുക."}
            </p>
            <ActionButtons />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
