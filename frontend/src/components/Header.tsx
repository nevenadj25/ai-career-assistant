import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRequest } from "../api/ApiFunctions";
import { getUser, logout } from "../utils/auth";

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  jobTitle: string;
  profilePhoto: string;
}

const Header = () => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const user = getUser();

  const loadProfile = async () => {
    try {
      const data = await getRequest<ProfileData>("/profile");

      setProfile(data);
    } catch (error) {
      console.error("Header profile load error:", error);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);
  const firstName = profile?.firstName || user?.firstName || "Korisnik";

  const lastName = profile?.lastName || user?.lastName || "";

  const profilePhoto = profile?.profilePhoto || "";

  const jobTitle = profile?.jobTitle || "Career Assistant";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const handleProfile = () => {
    setShowMenu(false);

    navigate("/profile");
  };

  const handleSettings = () => {
    setShowMenu(false);

    navigate("/settings");
  };

  const handleLogout = () => {
    logout();

    setShowMenu(false);

    navigate("/login", {
      replace: true,
    });
  };  

  return (
    <header className="relative z-[50] flex h-20 items-center justify-between border-b border-white/30 bg-white/70 px-6 shadow-sm backdrop-blur-md">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          AI Career Assistant
        </h2>

        <p className="text-sm text-gray-500">Your personal career companion</p>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu((previous) => !previous)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-indigo-50"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profilna slika"
              className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-indigo-100"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-md">
              {initials || "U"}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="font-semibold text-gray-800">
              {firstName} {lastName}
            </p>

            <p className="max-w-40 truncate text-xs text-gray-500">
              {jobTitle}
            </p>
          </div>
          <span
            className={`text-xs text-gray-400 transition-transform duration-200 ${
              showMenu ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
        {showMenu && (
          <div className="absolute right-0 top-14 z-[999] w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={handleProfile}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              👤 Moj profil
            </button>
            <button
              type="button"
              onClick={handleSettings}
              className="w-full rounded-lg px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              ⚙️ Podešavanja
            </button>
            <div className="my-2 border-t border-gray-100" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              🚪 Odjavi se
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
