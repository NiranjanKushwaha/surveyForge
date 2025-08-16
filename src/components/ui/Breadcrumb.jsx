import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";

const Breadcrumb = ({ items = [] }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split("/")?.filter(Boolean);
    const breadcrumbs = [
      { label: "Dashboard", path: "/survey-builder-dashboard" },
    ];

    if (location?.pathname === "/visual-survey-builder") {
      breadcrumbs?.push({
        label: "Visual Builder",
        path: "/visual-survey-builder",
      });
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items?.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-text-secondary mb-1"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems?.map((item, index) => {
          const isLast = index === breadcrumbItems?.length - 1;

          return (
            <li key={item?.path || index} className="flex items-center">
              {index > 0 && (
                <Icon
                  name="ChevronRight"
                  size={14}
                  className="mx-2 text-border"
                />
              )}
              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item?.label}
                </span>
              ) : (
                <Link
                  to={item?.path}
                  className="hover:text-foreground survey-transition"
                >
                  {item?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
