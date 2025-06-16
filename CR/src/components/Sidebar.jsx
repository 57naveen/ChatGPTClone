import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`
        relative h-screen
        ${collapsed ? "w-[40px]" : "w-[260px]"}
        p-4 hidden sm:block
        transition-all duration-300 ease-in-out
      `}
      style={{
        backgroundColor: "var(--sidebar-bg)",
        color: "var(--sidebar-text)",
      }}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-3 hover:opacity-75"
        aria-label="Toggle Sidebar"
        style={{ color: "var(--sidebar-text)" }}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Sidebar Content */}
      {!collapsed && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Chats</h2>
          <ul className="space-y-2">
            <li
              className="p-2 rounded-xl cursor-pointer flex gap-3 items-center"
              style={{ backgroundColor: "var(--sidebar-active)" }}
            >
              <span><FaEdit size={20} /></span>New CR
            </li>
            <li
              className="p-2 rounded-xl cursor-pointer flex gap-3 items-center hover:opacity-85"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--sidebar-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <span><MdLibraryBooks size={20} /></span>Library
            </li>
            <li
              className="p-2 rounded-xl cursor-pointer hover:opacity-85"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--sidebar-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Placeholder
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
