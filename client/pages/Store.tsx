import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useData } from "../contexts/DataContext";
import { getProducts } from "../services/api";
import { formatPrice } from "@/lib/formatters";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoadingScreen } from "../components/ui/loading";
import {
  ShoppingCart,
  Plus,
  Globe,
  Store as StoreIcon,
  Search,
  X,
  Instagram,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import AddToCartDialog from "../components/AddToCartDialog";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";

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
  }>;
  total_stock: number;
  category_id?: string;
}

export default function Store() {
  const navigate = useNavigate();
  const { t, language, setLanguage, translateCategory } = useLanguage();
  const { getTotalItems, setIsCartOpen, isCartOpen } = useCart();
  const { categories, getCategoryById } = useData();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Instagram link handler
  const openInstagram = () => {
    window.open(
      "https://www.instagram.com/azharstore/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        // Normalize category field for filtering
        const normalized = data.map((p: any) => ({
          ...p,
          category_id: p.category_id || "",
        }));
        setProducts(normalized);
        setFilteredProducts(normalized);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const cartItemsCount = getTotalItems();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between [dir=rtl]:flex-row-reverse">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 [dir=rtl]:flex-row-reverse min-w-0 flex-1">
            <div className="h-24 sm:h-28 lg:h-32 xl:h-36 flex items-center">
              <img
                src={
                  language === "ar"
                    ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                    : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
                }
                alt="أزهار ستور - azharstore"
                className="h-24 sm:h-28 lg:h-32 xl:h-36 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 sm:gap-3 [dir=rtl]:flex-row-reverse">
            {/* Instagram Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openInstagram}
              className="h-10 px-2 sm:px-3 touch-manipulation hover:bg-primary/5 hover:border-primary transition-colors"
            >
              <Instagram className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline ml-1 sm:ml-2 [dir=rtl]:ml-0 [dir=rtl]:mr-1 [dir=rtl]:sm:mr-2">
                Instagram
              </span>
            </Button>

            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 h-10 px-2 sm:px-3 touch-manipulation"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {language === "ar"
                      ? t("common.languageAr")
                      : t("common.language")}
                  </span>
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
              className="relative hover:bg-primary/5 hover:border-primary transition-colors h-10 px-3 sm:px-4 touch-manipulation"
            >
              <ShoppingCart className="h-5 w-5 [dir=rtl]:ml-1 [dir=ltr]:mr-1 sm:[dir=rtl]:ml-2 sm:[dir=ltr]:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{t("store.cart")}</span>
              {cartItemsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 [dir=rtl]:-left-2 [dir=rtl]:right-auto h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Category Filter - Mobile Optimized */}
      <div className="border-b bg-gray-50/50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          {/* Search Bar + Categories row */}
          <div className="flex flex-col gap-4">
            <div className="max-w-2xl mx-auto w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground [dir=rtl]:left-auto [dir=rtl]:right-3" />
                <Input
                  type="text"
                  placeholder={t("store.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 [dir=rtl]:pl-10 [dir=rtl]:pr-10 auto-text h-12 sm:h-10 text-base sm:text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 [dir=rtl]:right-auto [dir=rtl]:left-1 touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2 text-center auto-text">
                  {filteredProducts.length} {t("store.searchResults")}
                </p>
              )}
            </div>

            {/* Category chips - mobile optimized */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full h-10 sm:h-8 px-4 sm:px-3 touch-manipulation"
              >
                <span className="auto-text text-sm">
                  {t("store.allProducts")}
                </span>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full h-10 sm:h-8 px-4 sm:px-3 touch-manipulation"
                >
                  <span className="auto-text text-sm">
                    {translateCategory(category.name)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid - Mobile Optimized */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {searchQuery && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4 text-center auto-text">
              {t("store.noSearchResults")}
            </p>
            <Button
              variant="outline"
              onClick={clearSearch}
              className="touch-manipulation"
            >
              <span className="auto-text">{t("store.clearSearch")}</span>
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4 text-center auto-text">
              {t("empty.noProductsFound")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
              >
                {/* Product Image */}
                <div
                  className="aspect-square overflow-hidden bg-gray-100"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-xs sm:text-sm auto-text">
                        {t("products.noImages")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info - Mobile Optimized */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <div onClick={() => navigate(`/product/${product.id}`)}>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2 hover:text-primary transition-colors auto-text leading-tight">
                      {product.name}
                    </h3>

                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 auto-text">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between [dir=rtl]:flex-row-reverse gap-2">
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 [dir=rtl]:flex-row-reverse">
                        <span
                          className="text-sm sm:text-base lg:text-lg font-bold text-primary ltr-text"
                          dir="ltr"
                        >
                          {formatPrice(product.price, language)}
                        </span>
                        {(product.total_stock || 0) > 0 && (
                          <span className="text-xs text-muted-foreground auto-text">
                            •{" "}
                            <span className="ltr-text">
                              {product.total_stock || 0}
                            </span>{" "}
                            {t("products.stock")}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.total_stock || 0) === 0}
                      className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0 touch-manipulation"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {(product.total_stock || 0) === 0 && (
                    <Badge
                      variant="secondary"
                      className="w-full mt-2 justify-center text-center text-xs"
                    >
                      <span className="auto-text">{t("store.outOfStock")}</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add to Cart Dialog */}
      {selectedProduct && (
        <AddToCartDialog
          product={selectedProduct}
          open={isAddToCartOpen}
          onClose={() => {
            setIsAddToCartOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
