import type React from "react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

interface ContextMenuOption {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuOption[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  options: ContextMenuOption[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  options,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuDirection, setSubmenuDirection] = useState<"right" | "left">(
    "right"
  );

  const handleSubmenuOpen = useCallback((index: number) => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // 如果右边空间不足（小于200px），则向左展开
      if (menuRect.right + 200 > windowWidth) {
        setSubmenuDirection("left");
      } else {
        setSubmenuDirection("right");
      }
    }
    setActiveSubmenu(index);
  }, []);

  const handleSubmenuClose = useCallback(() => {
    setActiveSubmenu(null);
  }, []);

  const handleMenuItemClick = useCallback(
    (option: ContextMenuOption) => {
      if (!option.disabled && option.action && !option.submenu) {
        option.action();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".context-menu")) {
        onClose();
        setActiveSubmenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      className="absolute bg-white shadow-lg rounded-md overflow-hidden z-50 context-menu"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ top: y, left: x }}
    >
      <ul className="py-1">
        {options.map((option, index) => (
          <li key={index}>
            {option.divider ? (
              <div className="border-t border-gray-200 my-1" />
            ) : (
              <motion.div
                onMouseEnter={() => option.submenu && handleSubmenuOpen(index)}
                onMouseLeave={() => option.submenu && handleSubmenuClose()}
                className="relative"
              >
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-4 
                    ${
                      option.disabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => handleMenuItemClick(option)}
                  disabled={option.disabled}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {option.shortcut && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {option.shortcut}
                      </span>
                    )}
                    {option.submenu && <span className="text-gray-400">▶</span>}
                  </div>
                </button>
                {option.submenu && activeSubmenu === index && (
                  <div
                    className={`absolute top-0 bg-white shadow-lg rounded-md overflow-hidden
                      ${
                        submenuDirection === "right"
                          ? "left-full"
                          : "right-full"
                      }`}
                    style={{
                      minWidth: "150px",
                      transform: `translateX(${
                        submenuDirection === "right" ? "2px" : "-2px"
                      })`,
                    }}
                  >
                    <ul className="py-1">
                      {option.submenu.map((subOption, subIndex) => (
                        <li key={subIndex}>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-4
                              ${
                                subOption.disabled
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            onClick={() => handleMenuItemClick(subOption)}
                            disabled={subOption.disabled}
                          >
                            <span className="flex items-center gap-2">
                              {subOption.icon}
                              {subOption.label}
                            </span>
                            {subOption.shortcut && (
                              <span className="text-xs text-gray-400">
                                {subOption.shortcut}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ContextMenu;
