import React from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  collapsed: boolean;
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  menuItems,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    if (path === "/owner") {
      return location.pathname === "/owner";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <aside
      style={{
        width: collapsed ? 78 : 250,
        minWidth: collapsed ? 78 : 250,
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        transition:
          "width 0.25s ease, min-width 0.25s ease",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow:
          "4px 0 20px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* ================================= */}
      {/* LOGO */}
      {/* ================================= */}

      <div
        style={{
          height: 76,
          minHeight: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed
            ? "center"
            : "flex-start",
          padding: collapsed
            ? 0
            : "0 22px",
          borderBottom:
            "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Logo icon */}

          <div
            style={{
              width: 40,
              height: 40,
              minWidth: 40,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 800,
              boxShadow:
                "0 6px 16px rgba(79, 70, 229, 0.25)",
            }}
          >
            W
          </div>

          {/* Logo text */}

          {!collapsed && (
            <div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.1,
                  letterSpacing: -0.3,
                }}
              >
                WorkPro
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontWeight: 600,
                  marginTop: 3,
                  letterSpacing: 0.5,
                }}
              >
                MANAGEMENT SYSTEM
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* MENU */}
      {/* ================================= */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed
            ? "20px 10px"
            : "20px 12px",
        }}
      >
        {/* MENU TITLE */}

        {!collapsed && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: 0.8,
              padding:
                "0 12px 10px",
              textTransform: "uppercase",
            }}
          >
            Menu
          </div>
        )}

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {menuItems.map((item) => {
            const active = isActive(
              item.path
            );

            return (
              <Link
                key={item.key}
                to={item.path}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed
                    ? "center"
                    : "flex-start",
                  gap: 13,
                  minHeight: 48,
                  padding: collapsed
                    ? "0 10px"
                    : "0 14px",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: active
                    ? "#4f46e5"
                    : "#64748b",
                  background: active
                    ? "#eef2ff"
                    : "transparent",
                  fontSize: 14,
                  fontWeight: active
                    ? 700
                    : 500,
                  transition:
                    "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      "#f8fafc";

                    e.currentTarget.style.color =
                      "#334155";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      "transparent";

                    e.currentTarget.style.color =
                      "#64748b";
                  }
                }}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: 3,
                      height: 24,
                      borderRadius:
                        "0 4px 4px 0",
                      background:
                        "#4f46e5",
                    }}
                  />
                )}

                {/* ICON */}

                {item.icon && (
                  <span
                    style={{
                      width: 22,
                      minWidth: 22,
                      height: 22,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: 18,
                      color: active
                        ? "#4f46e5"
                        : "#64748b",
                      transition:
                        "color 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </span>
                )}

                {/* LABEL */}

                {!collapsed && (
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <div
        style={{
          borderTop:
            "1px solid #f1f5f9",
          padding: collapsed
            ? "16px 10px"
            : "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed
              ? "center"
              : "flex-start",
            gap: 10,
            padding: collapsed
              ? 0
              : "10px 12px",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        >
          {/* User avatar */}

          <div
            style={{
              width: 34,
              height: 34,
              minWidth: 34,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            U
          </div>

          {!collapsed && (
            <div
              style={{
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                WorkPro User
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 2,
                }}
              >
                Management
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;