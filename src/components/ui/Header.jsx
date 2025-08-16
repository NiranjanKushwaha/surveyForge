import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/survey-builder-dashboard",
      icon: "LayoutDashboard",
    },
    { label: "Builder", path: "/visual-survey-builder", icon: "Wrench" },
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-background border-b border-border survey-shadow">
      <div className="flex items-center justify-between h-12 px-6">
        {/* Logo */}
        <Link
          to="/survey-builder-dashboard"
          className="flex items-center space-x-2"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <Icon name="FileText" size={20} color="white" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            SurveyForge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium survey-transition ${
                isActivePath(item?.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Auto-save Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Check" size={14} color="var(--color-success)" />
            <span>Auto-saved</span>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="px-4 py-2 space-y-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium survey-transition ${
                  isActivePath(item?.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-999"
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
