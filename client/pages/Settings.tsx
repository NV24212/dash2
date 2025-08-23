import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDialog } from "@/contexts/DialogContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  CreditCard,
  Truck,
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  MessageSquare,
  Bell,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
  Wrench,
} from "lucide-react";
import SystemSettings from "@/components/SystemSettings";
import { diagnoseApiHealth } from "@/utils/apiDiagnostics";

interface StoreSettings {
  // Store Information
  storeName: string;
  storeDescription: string;
  currency: string;
  currencySymbol: string;

  // Contact Information
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;

  // Order Messages
  orderSuccessMessageEn: string;
  orderSuccessMessageAr: string;
  orderInstructionsEn: string;
  orderInstructionsAr: string;

  // Business Hours
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };

  // Delivery & Pickup Messages
  pickupMessageEn?: string;
  pickupMessageAr?: string;
  deliveryMessageEn?: string;
  deliveryMessageAr?: string;

  // Payment Settings
  cashOnDeliveryEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccountInfo: string;

  // Operational Settings
  autoOrderConfirmation: boolean;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  orderProcessingTime: string;
  deliveryConcerns: number;
  pickupOrderConfig: number;

  // Success Screen Controls
  successHeadlineEn?: string;
  successHeadlineAr?: string;
  successSubtextEn?: string;
  successSubtextAr?: string;
  displayOrderNumber?: boolean;
  displayOrderItems?: boolean;
  displayTotals?: boolean;
  displayNextSteps?: boolean;
  displayContact?: boolean;

  // UI Behavior
  enableDialogScroll?: boolean;
  autoScrollToSummary?: boolean;

  // Admin Settings
  adminPassword?: string;
  adminEmail?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;

  // New Advanced Settings
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableBackup?: boolean;
  maxImageSize?: number;
  enableImageCompression?: boolean;
  enableAutoSave?: boolean;
  enableDarkMode?: boolean;
  enableAccessibility?: boolean;
  enablePerformanceMode?: boolean;
  enableDebugMode?: boolean;

  // Delivery Settings
  deliveryFee?: number;
  freeDeliveryMinimum?: number;

  // Delivery Area Pricing
  deliveryAreaSitra?: number;
  deliveryAreaMuharraq?: number;
  deliveryAreaOther?: number;

  // Delivery Area Names
  deliveryAreaSitraNameEn?: string;
  deliveryAreaSitraNameAr?: string;
  deliveryAreaMuharraqlNameEn?: string;
  deliveryAreaMuharraqNameAr?: string;
  deliveryAreaOtherNameEn?: string;
  deliveryAreaOtherNameAr?: string;
}

export default function Settings() {
  const { t, language } = useLanguage();
  const { showConfirm, showAlert } = useDialog();
  const { products, orders, customers, refetchData } = useData();
  const { changePassword, updateEmail, adminInfo, fetchAdminInfo } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    storeDescription: "",
    currency: "BHD",
    currencySymbol: "BD",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    orderSuccessMessageEn:
      "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
    orderSuccessMessageAr:
      "شكراً لك على طلبك! سنقوم بمعالجته خلال 2-4 ساعات والتوصيل خلال 1-3 أيام عم��.",
    orderInstructionsEn:
      "For any changes or questions about your order, please contact us.",
    orderInstructionsAr: "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا.",
    businessHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "18:00", isOpen: true },
      sunday: { open: "09:00", close: "18:00", isOpen: true },
    },
    pickupMessageEn:
      "Please collect your order from our location during business hours.",
    pickupMessageAr: "يرجى استلام طلبك من موقعنا خلال ساعات العمل.",
    deliveryMessageEn:
      "Your order will be delivered to your address within 1-3 business days.",
    deliveryMessageAr: "سيتم توصيل طلبك إلى عنوانك خلال 1-3 أيام عمل.",
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: false,
    bankAccountInfo: "",
    autoOrderConfirmation: true,
    lowStockThreshold: 5,
    maxOrderQuantity: 10,
    orderProcessingTime: "2-4 hours",
    deliveryConcerns: 1.5,
    pickupOrderConfig: 0,
    successHeadlineEn: "Order Confirmed!",
    successHeadlineAr: "تم تأكيد الطلب!",
    successSubtextEn: "We'll share updates by phone as your order progresses.",
    successSubtextAr: "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك.",
    displayOrderNumber: true,
    displayOrderItems: true,
    displayTotals: true,
    displayNextSteps: true,
    displayContact: true,
    enableDialogScroll: true,
    autoScrollToSummary: true,
    adminPassword: "",
    adminEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    enableNotifications: true,
    enableAnalytics: true,
    enableBackup: true,
    maxImageSize: 5,
    enableImageCompression: true,
    enableAutoSave: true,
    enableDarkMode: false,
    enableAccessibility: true,
    enablePerformanceMode: false,
    enableDebugMode: false,
    deliveryFee: 1.5,
    freeDeliveryMinimum: 20,
    deliveryAreaSitra: 1.0,
    deliveryAreaMuharraq: 1.5,
    deliveryAreaOther: 2.0,
    deliveryAreaSitraNameEn: "Sitra",
    deliveryAreaSitraNameAr: "سترة",
    deliveryAreaMuharraqlNameEn: "Muharraq, Askar, Jao",
    deliveryAreaMuharraqNameAr: "المحرق، عسكر، جو",
    deliveryAreaOtherNameEn: "Other Cities",
    deliveryAreaOtherNameAr: "مدن أخرى",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isFixingCharacters, setIsFixingCharacters] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("storeSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings((prev) => ({ ...prev, ...parsed }));
    }
  }, []);

  useEffect(() => {
    // Load admin email from context
    if (adminInfo?.email) {
      setSettings((prev) => ({ ...prev, adminEmail: adminInfo.email }));
    }
  }, [adminInfo]);

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (
    day: string,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = async () => {
    if (
      !settings.currentPassword ||
      !settings.newPassword ||
      !settings.confirmPassword
    ) {
      showAlert({
        title: t("message.error"),
        message: "All password fields are required",
        type: "error",
      });
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      showAlert({
        title: t("message.error"),
        message: t("settings.passwordsDoNotMatch"),
        type: "error",
      });
      return;
    }

    if (settings.newPassword.length < 6) {
      showAlert({
        title: t("message.error"),
        message: "Password must be at least 6 characters long",
        type: "error",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await changePassword(
        settings.currentPassword,
        settings.newPassword,
      );

      if (success) {
        showAlert({
          title: t("common.success"),
          message: t("settings.passwordChanged"),
          type: "success",
        });

        // Clear password fields
        setSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showAlert({
          title: t("message.error"),
          message:
            "Failed to change password. Please check your current password.",
          type: "error",
        });
      }
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message: "An error occurred while changing password",
        type: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save regular settings to localStorage
      localStorage.setItem("storeSettings", JSON.stringify(settings));

      // Handle admin email update if it changed
      if (
        adminInfo?.email &&
        settings.adminEmail &&
        adminInfo.email !== settings.adminEmail
      ) {
        const emailUpdateSuccess = await updateEmail(settings.adminEmail);
        if (!emailUpdateSuccess) {
          showAlert({
            title: t("message.error"),
            message: "Failed to update admin email",
            type: "error",
          });
          setIsSaving(false);
          return;
        }
        // Refresh admin info
        await fetchAdminInfo();
      }

      setHasChanges(false);
      showAlert({
        title: t("settings.saveSuccess"),
        message: t("settings.saveSuccess"),
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: t("settings.saveError"),
        message: t("settings.saveError"),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmed = await showConfirm({
      title: t("settings.reset"),
      message: t("settings.resetConfirm"),
      type: "warning",
    });

    if (confirmed) {
      localStorage.removeItem("storeSettings");
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "store-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings((prev) => ({ ...prev, ...importedSettings }));
          setHasChanges(true);
          showAlert({
            title: t("checkout.settingsImported"),
            message: t("checkout.settingsImported"),
            type: "success",
          });
        } catch (error) {
          showAlert({
            title: t("checkout.importError"),
            message: t("checkout.importError"),
            type: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const fixCharacters = async () => {
    setIsFixingCharacters(true);
    try {
      const response = await fetch("/api/system/fix-characters", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        showAlert({
          title: "Character Fix Complete",
          message: `Successfully fixed ${result.totalFixes} corrupted characters across ${result.fixReport.length} files. The page will refresh to apply changes.`,
          type: "success",
        });

        // Refresh the page after a short delay to see the fixes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showAlert({
          title: "Character Fix Failed",
          message: result.error || "Failed to fix characters",
          type: "error",
        });
      }
    } catch (error) {
      showAlert({
        title: "Character Fix Error",
        message: "Network error while trying to fix characters",
        type: "error",
      });
    } finally {
      setIsFixingCharacters(false);
    }
  };

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const results = await diagnoseApiHealth();
      const successCount = results.filter((r) => r.success).length;
      const totalCount = results.length;

      showAlert({
        title: "API Diagnostics Complete",
        message: `${successCount}/${totalCount} endpoints working. Check console for details.`,
        type: successCount === totalCount ? "success" : "warning",
      });
    } catch (error) {
      showAlert({
        title: "Diagnostics Failed",
        message: "Failed to run API diagnostics",
        type: "error",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const tabs = [
    { id: "basic", label: t("settings.basicSettings"), icon: Store },
    { id: "delivery", label: t("settings.deliverySettings"), icon: Truck },
    { id: "admin", label: t("settings.adminSettings"), icon: Shield },
    { id: "system", label: t("settings.systemSettings"), icon: Monitor },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold auto-text">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground auto-text">
            {t("settings.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasChanges && (
            <Badge variant="destructive" className="auto-text">
              {t("settings.unsavedChanges")}
            </Badge>
          )}
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t("common.loading") : t("settings.save")}
          </Button>
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("settings.reset")}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="auto-text">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Settings */}
        {activeTab === "basic" && (
          <div className="max-w-2xl mx-auto">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {t("settings.storeInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="storeName" className="auto-text">
                    {t("settings.storeName")}
                  </Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) =>
                      handleInputChange("storeName", e.target.value)
                    }
                    placeholder={t("settings.storeName")}
                    className="auto-text"
                  />
                </div>
                <div>
                  <Label htmlFor="storeDescription" className="auto-text">
                    {t("settings.storeDescription")}
                  </Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.storeDescription}
                    onChange={(e) =>
                      handleInputChange("storeDescription", e.target.value)
                    }
                    placeholder={t("settings.storeDescription")}
                    className="auto-text"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency" className="auto-text">
                      {t("settings.currency")}
                    </Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        handleInputChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BHD">
                          {t("settings.bahrainiDinar")}
                        </SelectItem>
                        <SelectItem value="USD">
                          {t("settings.usDollar")}
                        </SelectItem>
                        <SelectItem value="EUR">
                          {t("settings.euro")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currencySymbol" className="auto-text">
                      {t("settings.currencySymbol")}
                    </Label>
                    <Input
                      id="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={(e) =>
                        handleInputChange("currencySymbol", e.target.value)
                      }
                      placeholder="BD"
                      className="ltr-text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delivery Settings */}
        {activeTab === "delivery" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t("settings.deliveryPricing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="freeDeliveryMinimum" className="auto-text">
                    {t("settings.freeDeliveryMinimum")}
                  </Label>
                  <Input
                    id="freeDeliveryMinimum"
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.freeDeliveryMinimum || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "freeDeliveryMinimum",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0" || e.target.value === "0.0") {
                        e.target.value = "";
                      }
                    }}
                    className="ltr-text"
                    placeholder="20"
                  />
                  <p className="text-sm text-muted-foreground auto-text mt-1">
                    {t("settings.freeDeliveryMinimumHint")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Area Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {language === "ar"
                    ? "أسعار التوصيل حسب المنطقة"
                    : "Delivery Area Pricing"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium auto-text">
                    {language === "ar" ? "المنطقة الأولى" : "Area 1"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="deliveryAreaSitraNameEn"
                        className="auto-text"
                      >
                        {language === "ar"
                          ? "الاسم بالإنجليزية"
                          : "Name (English)"}
                      </Label>
                      <Input
                        id="deliveryAreaSitraNameEn"
                        value={settings.deliveryAreaSitraNameEn || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaSitraNameEn",
                            e.target.value,
                          )
                        }
                        placeholder="Sitra"
                        className="auto-text"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="deliveryAreaSitraNameAr"
                        className="auto-text"
                      >
                        {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                      </Label>
                      <Input
                        id="deliveryAreaSitraNameAr"
                        value={settings.deliveryAreaSitraNameAr || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaSitraNameAr",
                            e.target.value,
                          )
                        }
                        placeholder="سترة"
                        className="auto-text"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryAreaSitra" className="auto-text">
                      {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                    </Label>
                    <Input
                      id="deliveryAreaSitra"
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.deliveryAreaSitra || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryAreaSitra",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0" || e.target.value === "0.0") {
                          e.target.value = "";
                        }
                      }}
                      className="ltr-text"
                      placeholder="1.0"
                    />
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium auto-text">
                    {language === "ar" ? "المنطقة الثانية" : "Area 2"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="deliveryAreaMuharraqlNameEn"
                        className="auto-text"
                      >
                        {language === "ar"
                          ? "الاسم بالإنجليزية"
                          : "Name (English)"}
                      </Label>
                      <Input
                        id="deliveryAreaMuharraqlNameEn"
                        value={settings.deliveryAreaMuharraqlNameEn || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaMuharraqlNameEn",
                            e.target.value,
                          )
                        }
                        placeholder="Muharraq, Askar, Jao"
                        className="auto-text"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="deliveryAreaMuharraqNameAr"
                        className="auto-text"
                      >
                        {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                      </Label>
                      <Input
                        id="deliveryAreaMuharraqNameAr"
                        value={settings.deliveryAreaMuharraqNameAr || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaMuharraqNameAr",
                            e.target.value,
                          )
                        }
                        placeholder="المحرق، عسكر، جو"
                        className="auto-text"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryAreaMuharraq" className="auto-text">
                      {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                    </Label>
                    <Input
                      id="deliveryAreaMuharraq"
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.deliveryAreaMuharraq || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryAreaMuharraq",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0" || e.target.value === "0.0") {
                          e.target.value = "";
                        }
                      }}
                      className="ltr-text"
                      placeholder="1.5"
                    />
                  </div>
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium auto-text">
                    {language === "ar" ? "المنطقة الثالثة" : "Area 3"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="deliveryAreaOtherNameEn"
                        className="auto-text"
                      >
                        {language === "ar"
                          ? "الاسم بالإنجليزية"
                          : "Name (English)"}
                      </Label>
                      <Input
                        id="deliveryAreaOtherNameEn"
                        value={settings.deliveryAreaOtherNameEn || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaOtherNameEn",
                            e.target.value,
                          )
                        }
                        placeholder="Other Cities"
                        className="auto-text"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="deliveryAreaOtherNameAr"
                        className="auto-text"
                      >
                        {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                      </Label>
                      <Input
                        id="deliveryAreaOtherNameAr"
                        value={settings.deliveryAreaOtherNameAr || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaOtherNameAr",
                            e.target.value,
                          )
                        }
                        placeholder="م��ن أخرى"
                        className="auto-text"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryAreaOther" className="auto-text">
                      {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                    </Label>
                    <Input
                      id="deliveryAreaOther"
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.deliveryAreaOther || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryAreaOther",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0" || e.target.value === "0.0") {
                          e.target.value = "";
                        }
                      }}
                      className="ltr-text"
                      placeholder="2.0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t("settings.pickupMessages")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pickupMessageEn" className="auto-text">
                    {t("settings.pickupMessageEn")}
                  </Label>
                  <Textarea
                    id="pickupMessageEn"
                    value={settings.pickupMessageEn || ""}
                    onChange={(e) =>
                      handleInputChange("pickupMessageEn", e.target.value)
                    }
                    className="auto-text"
                    rows={4}
                    placeholder="Enter pickup instructions in English..."
                  />
                </div>
                <div>
                  <Label htmlFor="pickupMessageAr" className="auto-text">
                    {t("settings.pickupMessageAr")}
                  </Label>
                  <Textarea
                    id="pickupMessageAr"
                    value={settings.pickupMessageAr || ""}
                    onChange={(e) =>
                      handleInputChange("pickupMessageAr", e.target.value)
                    }
                    className="auto-text"
                    rows={4}
                    placeholder="أدخل ت��ليمات الاستلام بالعربية..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t("settings.deliveryMessages")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryMessageEn" className="auto-text">
                    {t("settings.deliveryMessageEn")}
                  </Label>
                  <Textarea
                    id="deliveryMessageEn"
                    value={settings.deliveryMessageEn || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryMessageEn", e.target.value)
                    }
                    className="auto-text"
                    rows={4}
                    placeholder="Enter delivery instructions in English..."
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryMessageAr" className="auto-text">
                    {t("settings.deliveryMessageAr")}
                  </Label>
                  <Textarea
                    id="deliveryMessageAr"
                    value={settings.deliveryMessageAr || ""}
                    onChange={(e) =>
                      handleInputChange("deliveryMessageAr", e.target.value)
                    }
                    className="auto-text"
                    rows={4}
                    placeholder="أدخل تعليمات التوصيل بالعربية..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Settings */}
        {activeTab === "admin" && (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Admin Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("settings.adminInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail" className="auto-text">
                    {t("settings.adminEmail")}
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      handleInputChange("adminEmail", e.target.value)
                    }
                    placeholder="admin@example.com"
                    className="ltr-text"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t("settings.changePassword")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="auto-text">
                    {t("settings.currentPassword")}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={settings.currentPassword || ""}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="••���•••••"
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="auto-text">
                    {t("settings.newPassword")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={settings.newPassword || ""}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="ltr-text"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="auto-text">
                    {t("settings.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={settings.confirmPassword || ""}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="••••••••"
                    className="ltr-text"
                  />
                </div>
                {settings.newPassword &&
                  settings.confirmPassword &&
                  settings.newPassword !== settings.confirmPassword && (
                    <p className="text-sm text-red-600 auto-text">
                      {t("settings.passwordsDoNotMatch")}
                    </p>
                  )}
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    !settings.currentPassword ||
                    !settings.newPassword ||
                    !settings.confirmPassword ||
                    settings.newPassword !== settings.confirmPassword ||
                    isChangingPassword
                  }
                  className="w-full"
                >
                  {isChangingPassword
                    ? t("common.loading")
                    : t("settings.changePassword")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* Character Fixing Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Character Corruption Fix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        Automatic Character Fix
                      </h4>
                      <p className="text-sm text-blue-800">
                        This tool automatically detects and fixes corrupted
                        UTF-8 characters (like "�") that appear in Arabic text
                        throughout the application. Common issues include
                        corrupted characters in translations and text content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Fix Corrupted Characters</h4>
                    <p className="text-sm text-muted-foreground">
                      Scan and fix all corrupted UTF-8 characters in the
                      codebase
                    </p>
                  </div>
                  <Button
                    onClick={fixCharacters}
                    disabled={isFixingCharacters}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    {isFixingCharacters ? "Fixing..." : "Fix Characters"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Diagnostics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  API Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Network Connectivity Test
                      </h4>
                      <p className="text-sm text-gray-700">
                        Test all API endpoints to diagnose network connectivity
                        issues. Results will be logged to the browser console.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Run API Health Check</h4>
                    <p className="text-sm text-muted-foreground">
                      Test connectivity to all backend services
                    </p>
                  </div>
                  <Button
                    onClick={runDiagnostics}
                    disabled={isDiagnosing}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Monitor className="w-4 h-4" />
                    {isDiagnosing ? "Testing..." : "Run Diagnostics"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Settings Component */}
            <SystemSettings />
          </div>
        )}
      </div>
    </div>
  );
}
