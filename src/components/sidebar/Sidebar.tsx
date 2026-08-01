import { Link } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";

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

const Sidebar: React.FC<SidebarProps> = ({ collapsed, menuItems }) => {
  return (
    <div
      style={{
        width: collapsed ? 80 : 220,
        minHeight: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #dee2e6",
        transition: "width 0.2s ease",
      }}
    >
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 1rem",
          borderBottom: "1px solid #e9ecef",
          fontWeight: 700,
          color: "#0d6efd",
          fontSize: 22,
        }}
      >
        {collapsed ? "WP" : "WorkPro"}
      </div>
      <ListGroup variant="flush">
        {menuItems.map((item) => (
          <ListGroup.Item
            action
            as={Link}
            to={item.path}
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0.85rem 1rem",
              whiteSpace: "nowrap",
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;

