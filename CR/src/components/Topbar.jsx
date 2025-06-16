import { Share, UserRoundPen } from "lucide-react";
import {
  MdDarkMode,
  MdLightMode,
  MdOutlineDarkMode,
  MdOutlineLightMode,
} from "react-icons/md";

const Topbar = ({ toggleDarkMode, darkMode }) => {
  return (
    <div
      className="h-14 flex items-center px-4 border-b"
      style={{
        backgroundColor: "var(--topbar-bg)",
        color: "var(--text-main)",
        borderColor: "var(--topbar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="px-2 py-1 mt-1 -ml-2 rounded-sm"
        style={{ backgroundColor: "var(--logo-bg)" }}
      >
        <img src="/images/Logo-eSoft.svg" className="w-24" />
      </div>

      {/* Right-side icons */}
      <div className="ml-auto flex items-center gap-8">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1 rounded-md   cursor-pointer  transition-colors"
        >
          {darkMode ? (
            <>
              <MdDarkMode size={20} />
              <span>Dark</span>
            </>
          ) : (
            <>
              <MdLightMode size={20} />
              <span>Light</span>
            </>
          )}
        </button>
        <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
          <Share size={18} />
          <span className="text-sm">Share</span>
        </button>
        <div className="-mt-3 text-2xl cursor-pointer">...</div>
        <div className="cursor-pointer">
          <UserRoundPen size={20} />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
