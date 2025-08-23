import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  LogOut,
  Menu,
  X,
  Languages,
  FolderOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getNavigation = (t: (key: string) => string) => [
  { name: t("nav.dashboard"), href: "/admin/", icon: LayoutDashboard },
  { name: t("nav.products"), href: "/admin/products", icon: Package },
  {
    name: t("nav.categories") as any,
    href: "/admin/categories",
    icon: FolderOpen,
  },
  { name: t("nav.orders"), href: "/admin/orders", icon: ShoppingCart },
  { name: t("nav.customers"), href: "/admin/customers", icon: Users },
  { name: t("nav.revenue"), href: "/admin/revenue", icon: TrendingUp },
  { name: t("nav.analytics"), href: "/admin/analytics", icon: BarChart3 },
  { name: t("nav.settings"), href: "/admin/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const location = useLocation();

  // Force sidebar to close when language changes to prevent RTL/LTR positioning issues
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [isRTL]);

  const navigation = getNavigation(t);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleCloseSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close button clicked, current sidebarOpen:", sidebarOpen);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - use key to force re-render on language change */}
      <div
        key={`sidebar-${language}`}
        className={cn(
          "fixed inset-y-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out",
          // For RTL: position on right, for LTR: position on left
          isRTL ? "right-0" : "left-0",
          // Transform logic based on direction and state (works on all screen sizes)
          sidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full",
        )}
        style={{
          // Force positioning with style as backup
          [isRTL ? "right" : "left"]: "0",
        }}
        data-sidebar-open={sidebarOpen}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 [dir=rtl]:flex-row-reverse">
          <div className="flex items-center gap-3 [dir=rtl]:flex-row-reverse">
            <img
              src={
                language === "ar"
                  ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                  : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
              }
              alt="أزهار ستور - azharstore"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-bold text-dashboard-primary [dir=rtl]:text-right [dir=ltr]:text-left">
              {t("nav.adminPanel")}
            </h1>
          </div>
          <button
            onClick={handleCloseSidebar}
            onTouchEnd={(e) => handleCloseSidebar(e as any)}
            className="lg:hidden text-gray-400 hover:text-gray-600 touch-manipulation z-10 p-2 -m-2 relative"
            type="button"
            aria-label={t("common.close")}
            style={{ pointerEvents: "auto" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors [dir=rtl]:flex-row-reverse [dir=rtl]:text-right [dir=ltr]:text-left",
                      isActive
                        ? "bg-dashboard-primary text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon
                      className={cn("w-5 h-5", isRTL ? "ml-3" : "mr-3")}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          <Button
            onClick={toggleLanguage}
            variant="outline"
            className="w-full justify-start [dir=rtl]:justify-end [dir=rtl]:flex-row-reverse"
          >
            <Languages className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t("language.switch")}
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start [dir=rtl]:justify-end [dir=rtl]:flex-row-reverse"
          >
            <LogOut className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t("nav.logout")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 [dir=rtl]:flex-row-reverse">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 [dir=rtl]:text-right [dir=ltr]:text-left">
              {t("dashboard.title")}
            </h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
