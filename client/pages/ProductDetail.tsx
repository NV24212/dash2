import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { getProducts } from "../services/api";
import { formatPrice } from "@/lib/formatters";
import { Button } from "../components/ui/button";
import { LoadingScreen } from "../components/ui/loading";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Globe,
  Store as StoreIcon,
  Instagram,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import AddToCartDialog from "../components/AddToCartDialog";
import CartSidebar from "../components/CartSidebar";

interface DataContextProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    stock: number;
    image?: string; // Added image field for variants
  }>;
  total_stock?: number; // Made total_stock optional
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    stock: number;
    image?: string; // Added image field for variants
  }>;
  total_stock: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { getTotalItems, setIsCartOpen, isCartOpen } = useCart();

  // Instagram link handler
  const openInstagram = () => {
    window.open(
      "https://www.instagram.com/azharstore/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const [product, setProduct] = useState<DataContextProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);

  const cartItemsCount = getTotalItems();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          setProduct(null);
          setLoading(false);
          return;
        }

        // Try direct API call first
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const product = await response.json();
          const normalized = {
            ...product,
          };
          setProduct(normalized);
        } else if (response.status === 404) {
          setProduct(null);
        } else {
          // Fallback to getting all products
          const products = await getProducts();
          const foundProduct = products.find((p) => p.id === id);
          const normalized = foundProduct ? foundProduct : null;
          setProduct(normalized || null);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      setIsAddToCartOpen(true);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-center">{t("empty.noProductsFound")}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            {t("store.continueShopping")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="h-24 sm:h-28 flex items-center">
              <img
                src={
                  language === "ar"
                    ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                    : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
                }
                alt="أزهار ستور - azharstore"
                className="h-24 sm:h-28 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Instagram Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openInstagram}
              className="h-10 px-3 touch-manipulation hover:bg-primary/5 hover:border-primary transition-colors"
            >
              <Instagram className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline ml-2">Instagram</span>
            </Button>

            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  {language === "ar"
                    ? t("common.languageAr")
                    : t("common.language")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Button */}
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(true)}
              className="relative hover:bg-primary/5 hover:border-primary transition-colors"
            >
              <ShoppingCart className="h-5 w-5 [dir=rtl]:ml-2 [dir=ltr]:mr-2" />
              {t("store.cart")}
              {cartItemsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Product Detail Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("store.continueShopping")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {(() => {
                // Create combined image array with product images and variant images
                const allImages = [
                  ...product.images,
                  ...product.variants
                    .filter((v) => v.image)
                    .map((v) => v.image as string),
                ];

                return allImages.length > 0 ? (
                  <img
                    src={allImages[selectedImageIndex] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span>{t("products.noImages")}</span>
                  </div>
                );
              })()}
            </div>

            {/* Image Thumbnails incl. variant images */}
            {(() => {
              const allImages = [
                ...product.images,
                ...product.variants
                  .filter((v) => v.image)
                  .map((v) => v.image as string),
              ];

              return (
                allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )
              );
            })()}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {product.description}
              </p>

              <div
                className="text-3xl font-bold text-primary mb-4 ltr-text"
                dir="ltr"
              >
                {formatPrice(product.price, language)}
              </div>

              {product.total_stock > 0 ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {product.total_stock} {t("products.stock")}
                </Badge>
              ) : (
                <Badge variant="secondary">{t("store.outOfStock")}</Badge>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">
                    {t("products.variants")}:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant, variantIndex) => {
                      const isSelected = selectedVariantId === variant.id;
                      const allImages = [
                        ...product.images,
                        ...product.variants
                          .filter((v) => v.image)
                          .map((v) => v.image as string),
                      ];
                      const variantImageIndex = variant.image
                        ? product.images.length +
                          product.variants.filter(
                            (v, i) => i < variantIndex && v.image,
                          ).length
                        : null;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariantId(
                              isSelected ? null : variant.id,
                            );
                            if (variant.image && variantImageIndex !== null) {
                              setSelectedImageIndex(variantImageIndex);
                            }
                          }}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.stock} {t("products.stock")}
                          </div>
                          {variant.image && (
                            <div className="mt-2">
                              <img
                                src={variant.image}
                                alt={variant.name}
                                className="w-12 h-12 object-cover rounded mx-auto"
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.total_stock === 0}
              size="lg"
              className="w-full"
            >
              <Plus className="h-5 w-5 [dir=rtl]:ml-2 [dir=ltr]:mr-2" />
              {t("store.addToCart")}
            </Button>
          </div>
        </div>
      </main>

      {isAddToCartOpen && product && (
        <AddToCartDialog
          product={{ ...product, total_stock: product.total_stock || 0 }}
          open={isAddToCartOpen}
          onClose={() => setIsAddToCartOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
