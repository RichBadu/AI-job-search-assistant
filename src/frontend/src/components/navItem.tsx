import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  indicator?: boolean;
}

function NavItem({ to, label, indicator }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-5 py-2 text-sm border-l-2 ${
          isActive
            ? "border-blue-600 bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white"
            : "border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`
      }
    >
      {label}
      {indicator && (
        <span className="relative flex h-2 w-2 ml-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      )}
    </NavLink>
  );
}

export default NavItem;
