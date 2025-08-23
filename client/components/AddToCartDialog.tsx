import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Minus, Plus } from "lucide-react";

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
}

interface AddToCartDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function AddToCartDialog({
  product,
  open,
  onClose,
}: AddToCartDialogProps) {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  // For products without variants, use total_stock; otherwise use variant stock (max 50)
  const maxQuantity =
    product.variants.length === 0
      ? Math.min(product.total_stock || 0, 50)
      : Math.min(selectedVariant?.stock || 0, 50);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedVariantId("");
      setQuantity(1);
    }
  }, [open]);

  const handleAddToCart = () => {
    // For products without variants, allow adding to cart without variant selection
    if (product.variants.length > 0 && !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || "no-variant",
      quantity,
      price: product.price,
      productName: product.name,
      variantName: selectedVariant?.name || t("common.default"),
      productImage: product.images[0] || undefined,
    });

    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // For products without variants, only check quantity; otherwise require variant selection
  const isValidSelection =
    product.variants.length === 0
      ? quantity > 0 && quantity <= maxQuantity && maxQuantity > 0
      : selectedVariant && quantity > 0 && quantity <= maxQuantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] sm:max-w-md max-h-[80vh] flex flex-col rounded-2xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4 pb-4">
            {/* Product Image */}
            {product.images.length > 0 && (
              <div className="aspect-square sm:aspect-video overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Product Description */}
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>

            {/* Price */}
            <div className="text-lg font-bold text-primary ltr-text" dir="ltr">
              {formatPrice(product.price, language)}
            </div>

            {/* Variant Selection */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="variant">{t("store.variant")}</Label>
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("store.selectVariant")} />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants
                      .filter((variant) => variant.stock > 0)
                      .map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} ({variant.stock} {t("products.stock")})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            {(selectedVariant || product.variants.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="quantity">{t("store.quantity")}</Label>
                <div className="flex items-center gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-12 w-12 p-0 touch-manipulation"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>

                  <div className="w-24 h-12 flex items-center justify-center bg-gray-50 border rounded-md">
                    <span className="text-lg font-semibold">{quantity}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity}
                    className="h-12 w-12 p-0 touch-manipulation"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {(selectedVariant || product.variants.length === 0) && (
                  <p className="text-xs text-muted-foreground">
                    {t("products.stock")}:{" "}
                    {product.variants.length === 0
                      ? product.total_stock
                      : selectedVariant.stock}
                  </p>
                )}
              </div>
            )}

            {/* Total Price */}
            {isValidSelection && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>{t("orders.subtotal")}:</span>
                  <span className="ltr-text" dir="ltr">
                    {formatPrice(product.price * quantity, language)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={!isValidSelection}
            className="flex-1 h-12"
            size="lg"
          >
            {t("store.addToCart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}