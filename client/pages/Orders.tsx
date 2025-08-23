import { useState } from "react";
import { useData, Order, OrderItem } from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Package,
  Minus,
  Eye,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Orders() {
  const {
    orders,
    customers,
    products,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getCustomerById,
    getProductById,
    getVariantById,
    getOrderNumber,
    refetchData,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    items: [] as OrderItem[],
    status: "processing" as Order["status"],
    deliveryType: "delivery" as Order["deliveryType"],
    notes: "",
  });

  const filteredOrders = orders
    .filter((order) => {
      const customer = getCustomerById(order.customerId);
      const orderNumber = getOrderNumber(order.id);
      return (
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `#${orderNumber}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer &&
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Sort by creation date, newest first for display
      const dateA = new Date(a.createdAt || a.created_at || "");
      const dateB = new Date(b.createdAt || b.created_at || "");
      return dateB.getTime() - dateA.getTime();
    });

  const resetForm = () => {
    setFormData({
      customerId: "",
      items: [],
      status: "processing",
      deliveryType: "delivery",
      notes: "",
    });
    setEditingOrder(null);
  };

  const openDialog = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customerId: order.customerId,
        items: [...order.items],
        status: order.status,
        deliveryType: order.deliveryType,
        notes: order.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const openViewDialog = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingOrder(null);
  };

  const addProductToOrder = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", variantId: "no-variant", quantity: 1, price: 0 },
      ],
    }));
  };

  const removeProductFromOrder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === "productId") {
            const product = getProductById(value as string);
            if (product) {
              updatedItem.price = product.price;
              updatedItem.variantId = "no-variant"; // Reset variant when product changes
            }
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.items.length === 0) {
      showAlert({
        title: "Validation Error",
        message:
          "Please select a customer and add at least one product to create an order.",
        type: "warning",
      });
      return;
    }

    try {
      const orderData = {
        ...formData,
        total: calculateTotal(),
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
      } else {
        await addOrder(orderData);
      }
      closeDialog();
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to save order. Please try again.",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: t("orders.delete"),
      message: t("message.deleteConfirm"),
      type: "danger",
      confirmText: t("orders.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteOrder(id);
        showAlert({
          title: t("message.success"),
          message: t("message.orderDeleted"),
          type: "success",
        });
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message: t("message.error"),
          type: "error",
        });
      }
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to update order status. Please try again.",
        type: "error",
      });
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-yellow-100 text-yellow-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "picked-up":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return t("orders.processing");
      case "ready":
        return t("orders.ready");
      case "delivered":
        return t("orders.delivered");
      case "picked-up":
        return t("orders.pickedUp");
      default:
        return status;
    }
  };

  const getAvailableVariants = (productId: string) => {
    const product = getProductById(productId);
    return product?.variants || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 [dir=rtl]:sm:flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("orders.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("orders.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openDialog()}
                className="bg-dashboard-primary hover:bg-dashboard-primary-light"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("orders.addNew")}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[92vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOrder ? t("orders.editOrder") : t("orders.addOrder")}
                </DialogTitle>
                <DialogDescription>
                  {editingOrder ? t("orders.editOrder") : t("orders.addOrder")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">{t("orders.customer")}</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, customerId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("orders.selectCustomer")} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>{t("nav.products")}</Label>
                    <div className="space-y-4">
                      {formData.items.map((item, index) => {
                        const product = getProductById(item.productId);
                        const availableVariants = getAvailableVariants(
                          item.productId,
                        );
                        const selectedVariant =
                          item.variantId && item.variantId !== "no-variant"
                            ? getVariantById(item.productId, item.variantId)
                            : null;

                        return (
                          <div
                            key={`form-${item.productId}-${item.variantId || "no-variant"}-${index}`}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <Label>{t("orders.product")}</Label>
                              <Select
                                value={item.productId}
                                onValueChange={(value) =>
                                  updateOrderItem(index, "productId", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("orders.selectProduct")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      <span
                                        className="auto-text inline-block"
                                        dir="auto"
                                      >
                                        {product.name}
                                      </span>
                                      <span className="ltr-text ml-2" dir="ltr">
                                        {" "}
                                        - {formatPrice(product.price, language)}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {availableVariants.length > 0 && (
                              <div className="flex-1">
                                <Label>{t("orders.variant")}</Label>
                                <Select
                                  value={item.variantId || "no-variant"}
                                  onValueChange={(value) =>
                                    updateOrderItem(index, "variantId", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t("orders.selectVariant")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="no-variant">
                                      {t("orders.variant")}
                                    </SelectItem>
                                    {availableVariants.map((variant) => (
                                      <SelectItem
                                        key={variant.id}
                                        value={variant.id}
                                      >
                                        {variant.name} ({t("products.stock")}:{" "}
                                        {variant.stock})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="w-24">
                              <Label>{t("orders.quantity")}</Label>
                              <Input
                                type="number"
                                min="1"
                                max={
                                  selectedVariant
                                    ? Math.min(selectedVariant.stock, 50)
                                    : Math.min(product?.total_stock || 50, 50)
                                }
                                value={item.quantity === 0 ? "" : item.quantity}
                                onChange={(e) =>
                                  updateOrderItem(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0" || e.target.value === "0.0") {
                                    e.target.value = "";
                                  }
                                  // Ensure input is visible on mobile
                                  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                className="touch-manipulation"
                              />
                            </div>
                            <div className="w-24">
                              <Label>{t("orders.price")}</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price === 0 ? "" : item.price}
                                onChange={(e) =>
                                  updateOrderItem(
                                    index,
                                    "price",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0" || e.target.value === "0.0") {
                                    e.target.value = "";
                                  }
                                  // Ensure input is visible on mobile
                                  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                className="touch-manipulation"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeProductFromOrder(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProductToOrder}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("orders.addItem")}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">{t("orders.status")}</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Order["status"]) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">
                            {t("orders.processing")}
                          </SelectItem>
                          <SelectItem value="ready">
                            {t("orders.ready")}
                          </SelectItem>
                          <SelectItem value="delivered">
                            {t("orders.delivered")}
                          </SelectItem>
                          <SelectItem value="picked-up">
                            {t("orders.pickedUp")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="deliveryType">
                        {t("orders.deliveryType")}
                      </Label>
                      <Select
                        value={formData.deliveryType}
                        onValueChange={(value: Order["deliveryType"]) =>
                          setFormData((prev) => ({
                            ...prev,
                            deliveryType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delivery">
                            {t("orders.delivery")}
                          </SelectItem>
                          <SelectItem value="pickup">
                            {t("orders.pickup")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">{t("orders.notes")}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder={t("orders.notesPlaceholder")}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total:</span>
                    <span
                      className="text-xl font-bold text-dashboard-primary ltr-text"
                      dir="ltr"
                    >
                      {formatPrice(calculateTotal(), language)}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-dashboard-primary hover:bg-dashboard-primary-light"
                  >
                    {editingOrder ? t("orders.save") : t("orders.addOrder")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={refetchData}>
            {t("orders.refresh")}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 [dir=rtl]:left-auto [dir=rtl]:right-3" />
            <Input
              placeholder={t("orders.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 [dir=rtl]:pl-3 [dir=rtl]:pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredOrders.map((order) => {
          const customer = getCustomerById(order.customerId);
          return (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-shadow border-l-4 border-dashboard-primary"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 [dir=rtl]:sm:flex-row-reverse">
                  <div className="flex items-start gap-3 flex-1 [dir=rtl]:flex-row-reverse">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-dashboard-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                        {t("orders.orderId")} #{getOrderNumber(order.id)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm sm:text-base [dir=rtl]:flex-row-reverse">
                        <User className="w-4 h-4" />
                        {customer?.name || t("orders.customer")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 sm:gap-2 mt-2 sm:mt-0">
                    <div
                      className="text-2xl sm:text-xl font-bold text-dashboard-primary ltr-text"
                      dir="ltr"
                    >
                      {formatPrice(order.total, language)}
                    </div>
                    <div className="w-full sm:w-auto min-w-[140px]">
                      <Select
                        value={order.status}
                        onValueChange={(value: Order["status"]) =>
                          handleStatusChange(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-auto min-w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">
                            {t("orders.processing")}
                          </SelectItem>
                          <SelectItem value="ready">
                            {t("orders.ready")}
                          </SelectItem>
                          <SelectItem value="delivered">
                            {t("orders.delivered")}
                          </SelectItem>
                          <SelectItem value="picked-up">
                            {t("orders.pickedUp")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 sm:space-y-3">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                      <Package className="w-4 h-4" />
                      {t("nav.products")} ({order.items.length})
                    </h4>
                    <div className="space-y-2 sm:space-y-1">
                      {order.items.slice(0, 2).map((item, index) => {
                        const product = getProductById(item.productId);
                        const variant =
                          item.variantId && item.variantId !== "no-variant"
                            ? getVariantById(item.productId, item.variantId)
                            : null;
                        return (
                          <div
                            key={`preview-${order.id}-${item.productId}-${item.variantId || "no-variant"}-${index}`}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {product?.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg object-cover border border-gray-200"
                                />
                              )}
                              <div className="flex-1">
                                <div
                                  className="font-medium text-gray-900 auto-text"
                                  dir="auto"
                                >
                                  {product?.name || t("products.title")}
                                </div>
                                {variant && (
                                  <div className="text-sm text-gray-500">
                                    {variant.name}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div
                              className="text-sm sm:text-right text-gray-600 font-medium ltr-text"
                              dir="ltr"
                            >
                              <div>
                                {item.quantity}x{" "}
                                {formatPrice(item.price, language)}
                              </div>
                              <div className="font-bold text-dashboard-primary">
                                {formatPrice(
                                  item.quantity * item.price,
                                  language,
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {order.items.length > 2 && (
                        <div className="text-sm text-gray-600 text-center py-2 bg-gray-100 rounded">
                          +{order.items.length - 2} {t("orders.items")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="capitalize font-medium text-dashboard-primary">
                        {order.deliveryType === "delivery"
                          ? t("orders.delivery")
                          : t("orders.pickup")}
                      </div>
                      <div className="text-xs sm:text-sm">
                        {t("orders.date")}:{" "}
                        {new Date(order.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewDialog(order)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t("orders.view")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(order)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {t("orders.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(order.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("orders.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View Order Dialog */}
        {viewingOrder && (
          <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
            <DialogContent className="w-[92vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Package className="w-5 h-5 text-primary" />
                  {t("orders.orderId")} #{getOrderNumber(viewingOrder.id)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 p-1">
                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("checkout.customerInfo")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">{t("checkout.customerName")}:</span>
                      <span className="text-blue-900 font-semibold">
                        {getCustomerById(viewingOrder.customerId)?.name || "Unknown Customer"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">{t("checkout.customerPhone")}:</span>
                      <span className="text-blue-900 font-semibold ltr-text" dir="ltr">
                        {getCustomerById(viewingOrder.customerId)?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-blue-800">{t("checkout.customerAddress")}:</span>
                      <span className="text-blue-900 font-semibold text-right max-w-[60%]">
                        {getCustomerById(viewingOrder.customerId)?.address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Status and Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("orders.status")}
                    </h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingOrder.status)}`}>
                      {getStatusText(viewingOrder.status)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      {viewingOrder.deliveryType === "delivery" ? (
                        <Truck className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {t("orders.deliveryType")}
                    </h4>
                    <span className="text-primary font-semibold capitalize">
                      {viewingOrder.deliveryType === "delivery" ? t("orders.delivery") : t("orders.pickup")}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      {t("checkout.orderItems")} ({viewingOrder.items.length})
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {viewingOrder.items.map((item, index) => {
                      const product = getProductById(item.productId);
                      const variant = item.variantId && item.variantId !== "no-variant" 
                        ? getVariantById(item.productId, item.variantId) 
                        : null;
                      
                      return (
                        <div 
                          key={`${item.productId}-${item.variantId || "no-variant"}-${index}`}
                          className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {product?.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 auto-text text-base leading-tight">
                                {product?.name || "Unknown Product"}
                              </h4>
                              {variant && (
                                <p className="text-sm text-primary font-medium mt-1">
                                  {variant.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatPrice(item.price, language)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary text-lg ltr-text" dir="ltr">
                              {formatPrice(item.price * item.quantity, language)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">{t("checkout.total")}:</span>
                    <span className="text-2xl font-bold text-primary ltr-text" dir="ltr">
                      {formatPrice(viewingOrder.total, language)}
                    </span>
                  </div>
                </div>

                {/* Order Notes */}
                {viewingOrder.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">{t("orders.notes")}:</h4>
                    <p className="text-yellow-800 text-sm">{viewingOrder.notes}</p>
                  </div>
                )}

                {/* Order Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("orders.createdAt")}:</span>
                    <span>{new Date(viewingOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("orders.updatedAt")}:</span>
                    <span>{new Date(viewingOrder.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={closeViewDialog} className="flex-1">
                  {t("common.close")}
                </Button>
                <Button onClick={() => { closeViewDialog(); openDialog(viewingOrder); }} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  {t("orders.edit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
                      