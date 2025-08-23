import { useState } from "react";
import {
  useData,
  Product,
  ProductVariant,
  Category,
} from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Search, Edit, Trash2, Package, X } from "lucide-react";

export default function Products() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategoryById,
    uploadImage,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, translateCategory } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    images: [] as string[],
    variants: [] as ProductVariant[],
    total_stock: 1,
    category_id: "",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const generateVariantId = () => "v" + Date.now().toString();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      images: [],
      variants: [],
      total_stock: 1,
      category_id: "",
    });
    setEditingProduct(null);
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        images: [...product.images],
        variants: [...product.variants],
        total_stock: product.total_stock || 0,
        category_id: product.category_id || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: generateVariantId(), name: "", stock: 1, image: "" },
      ],
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const getTotalStock = () => {
    if (formData.variants.length > 0) {
      return formData.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    return formData.total_stock;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        total_stock: getTotalStock(),
        // Convert empty category_id to null
        category_id:
          formData.category_id?.trim() === "" ? null : formData.category_id,
      };

      console.log("Submitting product data:", productData);

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      closeDialog();
    } catch (error) {
      console.error("Product save error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("message.productSaveError");
      showAlert({
        title: t("message.error"),
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await showConfirm({
      title: t("products.delete"),
      message: t("message.deleteConfirm"),
      type: "danger",
      confirmText: t("products.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteProduct(id);
        showAlert({
          title: t("message.success"),
          message: t("message.productDeleted"),
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

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { text: t("products.stock"), color: "bg-red-100 text-red-700" };
    if (stock < 10)
      return {
        text: t("products.stock"),
        color: "bg-yellow-100 text-yellow-700",
      };
    return { text: t("products.stock"), color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("products.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("products.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              className="bg-dashboard-primary hover:bg-dashboard-primary-light"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("products.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg sm:rounded-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? t("products.editProduct")
                  : t("products.addProduct")}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? t("products.editProduct")
                  : t("products.addProduct")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">
                    {t("products.productName")}
                  </TabsTrigger>
                  <TabsTrigger value="images">
                    {t("products.productImages")}
                  </TabsTrigger>
                  <TabsTrigger value="variants">
                    {t("products.variants")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t("products.productName")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder={t("products.productName")}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        {t("products.productDescription")}
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={t("products.productDescription")}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">
                        {t("products.productPrice")} (BD)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === ".") {
                            setFormData((prev) => ({
                              ...prev,
                              price: value === "." ? "0." : 0,
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              price: parseFloat(value) || 0,
                            }));
                          }
                        }}
                        onFocus={(e) => {
                          if (e.target.value === "0" || e.target.value === "0.00") {
                            e.target.value = "";
                          }
                        }}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">{t("products.category")}</Label>
                      <select
                        id="category"
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: e.target.value,
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">{t("products.selectCategory")}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {translateCategory(category.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.variants.length === 0 && (
                      <div className="grid gap-2">
                        <Label htmlFor="stock">{t("products.stock")}</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.total_stock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              total_stock: parseInt(e.target.value) || 0,
                            }))
                          }
                          onFocus={(e) => {
                            if (e.target.value === "0" || e.target.value === "0.0") {
                              e.target.value = "";
                            }
                          }}
                          placeholder="0"
                          required
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      {t("products.productImages")}
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("products.productImages")}
                    </p>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) =>
                        setFormData((prev) => ({ ...prev, images }))
                      }
                      maxImages={10}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-base font-medium">
                          {t("products.variants")}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {t("products.variants")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addVariant}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("products.addVariant")}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.variants.map((variant, index) => (
                        <Card key={variant.id || index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                <Label htmlFor={`variant-name-${index}`}>
                                  {t("products.variantName")}
                                </Label>
                                <Input
                                  id={`variant-name-${index}`}
                                  value={variant.name}
                                  onChange={(e) =>
                                    updateVariant(index, "name", e.target.value)
                                  }
                                  placeholder={t("products.variantName")}
                                  required
                                />
                              </div>
                              <div className="w-32">
                                <Label htmlFor={`variant-stock-${index}`}>
                                  {t("products.variantStock")}
                                </Label>
                                <Input
                                  id={`variant-stock-${index}`}
                                  type="number"
                                  min="0"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    updateVariant(
                                      index,
                                      "stock",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  onFocus={(e) => {
                                    if (e.target.value === "0" || e.target.value === "0.0") {
                                      e.target.value = "";
                                    }
                                  }}
                                  placeholder="0"
                                  required
                                />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Variant Image Upload */}
                            <div>
                              <Label className="text-sm font-medium">
                                {t("products.variantImageOptional")}
                              </Label>
                              <div className="mt-2">
                                {variant.image ? (
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={variant.image}
                                      alt={variant.name}
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateVariant(index, "image", "")
                                      }
                                    >
                                      {t("products.removeImage")}
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const imageUrl =
                                              await uploadImage(file);
                                            updateVariant(
                                              index,
                                              "image",
                                              imageUrl,
                                            );
                                          } catch (error) {
                                            console.error(
                                              "Failed to upload variant image:",
                                              error,
                                            );
                                          }
                                        }
                                      }}
                                      className="hidden"
                                      id={`variant-image-${index}`}
                                    />
                                    <label
                                      htmlFor={`variant-image-${index}`}
                                      className="cursor-pointer flex flex-col items-center justify-center text-sm text-gray-600 hover:text-gray-800"
                                    >
                                      <Plus className="w-6 h-6 mb-1" />
                                      {t("products.uploadImage")}
                                    </label>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {formData.variants.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>{t("products.variants")}</p>
                          <p className="text-sm">{t("products.addVariant")}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mt-4">
                      <span className="font-medium">
                        {t("products.stock")}:
                      </span>
                      <span className="text-xl font-bold text-dashboard-primary">
                        {getTotalStock()}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {t("products.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-dashboard-primary hover:bg-dashboard-primary-light"
                >
                  {editingProduct ? t("common.save") : t("products.addProduct")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={t("products.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full sm:w-72 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const category = getCategoryById(product.category_id || "");
          const stockStatus = getStockStatus(product.total_stock || 0);

          return (
            <Card
              key={product.id}
              className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <CardHeader className="p-0 relative">
                <div className="aspect-square w-full bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => openDialog(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                  {category && (
                    <Badge variant="secondary" className="mb-2">
                      {translateCategory(category.name)}
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 h-10 overflow-hidden">
                    {product.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-xl font-bold text-dashboard-primary">
                    {product.price.toFixed(2)} BD
                  </span>
                  <Badge className={`${stockStatus.color} px-2 py-1`}>
                    {product.total_stock} {stockStatus.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold">
            {t("empty.noProductsFound")}
          </h3>
          <p className="mt-2">
            {searchTerm ? t("empty.adjustSearch") : t("empty.addFirstProduct")}
          </p>
        </div>
      )}
    </div>
  );
}