// MainDashboard.jsx
import React, { useState, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Mic2,
  FileText,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";
import { UserContext } from "../../Context/UserContext";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../Routes/paths";

/* =========================
   COMPONENT
========================= */
const MainDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isInterViewStarted } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const isActiveRoute = (navPath) => {
    if (navPath === "/user/startinterview") {
      return currentPath.startsWith("/user/startinterview");
    }
    return currentPath === navPath;
  };

  /* =========================
     NAV ITEMS (Memoized)
  ========================= */
  const navItems = useMemo(() => [
    { 
      id: "dashboard",
      path: ROUTE_PATHS.USER_DASHBOARD, 
      label: "Dashboard", 
      icon: LayoutDashboard,
      description: "Overview & progress"
    },
    { 
      id: "startinterview",
      path: ROUTE_PATHS.USER_START_INTERVIEW,
      label: "Start Interview", 
      icon: Mic2,
      description: "Begin new session"
    },
    { 
      id: "resume", 
      path: ROUTE_PATHS.USER_RESUME_MANAGER,
      label: "Resume Manager", 
      icon: FileText,
      description: "Manage your resumes"
    },
    { 
      id: "analytics", 
      path: ROUTE_PATHS.USER_ANALYTICS,
      label: "Analytics", 
      icon: BarChart3,
      description: "Performance insights"
    },
    { 
      id: "history", 
      path: ROUTE_PATHS.USER_SESSION_HISTORY,
      label: "Session History", 
      icon: History,
      description: "Past interviews"
    },
    { 
      id: "profile", 
      path: ROUTE_PATHS.USER_PROFILE,
      label: "Profile", 
      icon: User,
      description: "Your account & settings"
    },
  ], []);

  /* =========================
     LOGOUT HANDLER
  ========================= */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     ANIMATION VARIANTS
  ========================= */
  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" }
  };

  

  return (
    <div className="h-screen bg-[#F8F5F0] flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ================= Sidebar (Static) ================= */}
      {!isInterViewStarted && (
        <>
          {/* Mobile Sidebar */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-[#E5E7EB] z-50 lg:hidden flex flex-col"
              >
                {/* Mobile Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg shadow-sm" />
                    <span className="text-lg font-semibold text-[#1F2937]">IIP</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#F8F5F0] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>

                {/* Mobile Profile Section - Simplified */}
                <div className="p-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-medium text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{user?.name || 'User'}</p>
                      <p className="text-xs text-[#6B7280]">{user?.role || 'Student'}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 py-6 overflow-y-auto">
                  <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActiveRoute(item.path.split("?")[0]);
                      return (
                        <li key={item.id}>
                          <NavLink
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                              ${active
                                ? "bg-[#F5F3FF] text-[#4F46E5]"
                                : "text-[#6B7280] hover:bg-[#F8F5F0] hover:text-[#1F2937]"
                              }
                            `}
                          >
                            <Icon className={`w-5 h-5 ${active ? "stroke-2" : "stroke-1"}`} />
                            <div className="flex-1 text-left">
                              <p className={`text-sm font-medium ${active ? "text-[#4F46E5]" : "text-[#1F2937]"}`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">{item.description}</p>
                            </div>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Mobile Logout */}
                <div className="border-t border-[#E5E7EB] p-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#26282c] hover:bg-[#F8F5F0] hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar (Static) */}
          <motion.aside
            initial="expanded"
            animate={collapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:flex bg-white border-r border-[#E5E7EB] shadow-sm flex-col h-screen sticky top-0"
          >
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-[#E5E7EB]">
              <div className="w-8 h-8 bg-gradient-to-r from-[#4F46E5] to-[#1F2937] rounded-lg shadow-sm flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-lg font-semibold text-[#1F2937]">
                  InterviewPrep
                </span>
              )}
            </div>

            

            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="absolute -right-3 top-24 bg-white border border-[#E5E7EB] rounded-full p-1.5 shadow-sm hover:shadow transition-shadow z-10"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-[#5f6571]" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              )}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto">
              <ul className="space-y-1 px-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.path.split("?")[0]);
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${active
                            ? "bg-[#F8F5F0] text-[#1F2937]"
                            : "text-[#6B7280] hover:bg-[#eae9e8] hover:text-[#1F2937]"
                          }
                        `}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 ${active ? "stroke-2" : "stroke-1"}`} />
                        {!collapsed && (
                          <span className="text-sm font-medium flex-1 text-left">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                      {!collapsed && active && (
                        <p className="text-xs text-[#9CA3AF] mt-1 px-3 pl-11">{item.description}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="border-t border-[#E5E7EB] p-4">
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-[#2d2e32] hover:bg-[#F8F5F0] hover:text-red-500 transition-colors
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? "Logout" : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </motion.aside>
        </>
      )}

      {/* ================= Main Content (Scrollable) ================= */}
      <main className="flex-1 overflow-y-auto bg-[#F8F5F0]">
        {/* Simple Header - Only Mobile Menu Button */}
        {!isInterViewStarted && (
          <div className="sticky top-0 z-30 bg-[#F8F5F0] border-b border-[#E5E7EB] lg:hidden">
            <div className="flex items-center justify-between px-4 h-16">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-white text-[#6B7280]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-[#1F2937]">
                {navItems.find((item) => isActiveRoute(item.path.split("?")[0]))?.label || 'Dashboard'}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Full Width */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="border-t border-[#E5E7EB] mt-auto py-4 px-8 text-center text-xs text-[#9CA3AF]">
          <p>© 2024 Interview Preparation Platform. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainDashboard;