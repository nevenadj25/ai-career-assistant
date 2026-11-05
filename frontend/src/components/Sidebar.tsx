import {
  LayoutDashboard,
  FileText,
  Mail,
  Mic,
  History,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "../utils/auth";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      name: "Početna",
      path: "/index",
      icon: <LayoutDashboard size={22} />,
    },
    {
      name: "CV Generator",
      path: "/cv-builder",
      icon: <FileText size={22} />,
    },
    {
      name: "Motivaciono pismo",
      path: "/cover-letter",
      icon: <Mail size={22} />,
    },
    {
      name: "AI Intervju",
      path: "/interview",
      icon: <Mic size={22} />,
    },
    {
      name: "Istorija",
      path: "/history",
      icon: <History size={22} />,
    },
  ];

  return (
    <aside
      className="
      hidden
      min-h-screen
      w-72
      flex-col
      border-r
      border-white/30
      bg-white/70
      p-6
      shadow-xl
      backdrop-blur-md
      lg:flex
      "
    >
      <div className="mb-10 flex items-center gap-3">
        <div
          className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-r
          from-indigo-500
          to-purple-600
          text-2xl
          shadow-lg
          "
        >
          🤖
        </div>

        <div>
          <h1 className="font-bold text-gray-800">AI Career</h1>

          <p className="text-sm text-gray-500">Assistant</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3
                transition-all
                duration-300

                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                }

                `
            }
          >
            {item.icon}

            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t pt-5">
        <NavLink
          to="/profile"
          className="
          flex
          items-center
          gap-4
          rounded-xl
          px-4
          py-3
          text-gray-600
          transition
          hover:bg-indigo-50
          hover:text-indigo-600
          "
        >
          <User size={22} />
          Profil
        </NavLink>

        <NavLink
          to="/settings"
          className="
          flex
          items-center
          gap-4
          rounded-xl
          px-4
          py-3
          text-gray-600
          transition
          hover:bg-indigo-50
          hover:text-indigo-600
          "
        >
          <Settings size={22} />
          Podešavanja
        </NavLink>

        <button
          className="
          flex
          w-full
          items-center
          gap-4
          rounded-xl
          px-4
          py-3
          text-red-500
          transition
          hover:bg-red-50
          "
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut size={22} />
          Odjava
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
