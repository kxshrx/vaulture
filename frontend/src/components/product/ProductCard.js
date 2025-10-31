import Link from "next/link";
import Image from "next/image";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import { formatPriceINR } from "@/lib/api";

export function ProductCard({ product, className = "" }) {
  const {
    id,
    title,
    price,
    image,
    creator,
    category,
    purchaseCount = 0,
  } = product;

  const handleCreatorClick = (e) => {
    e.stopPropagation();
    window.location.href = `/creator/${creator?.id}`;
  };

  return (
    <Card hover className={`overflow-hidden cursor-pointer ${className}`}>
      <Link href={`/product/${id}`}>
        {/* Product Image */}
        <div className="relative aspect-video bg-gray-100">
          {image ? (
            <Image src={image} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span>No Image</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Chip variant="category" size="small">
              {category}
            </Chip>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-semibold text-black mb-2 line-clamp-2 text-lg leading-tight">
            {title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleCreatorClick}
              className="text-sm text-gray-600 hover:text-black transition-colors text-left font-medium"
            >
              {creator?.name}
            </button>
            <span className="text-xl font-bold text-black">{formatPriceINR(price)}</span>
          </div>

          {purchaseCount > 0 && (
            <div className="text-xs text-gray-500 font-medium">
              {purchaseCount} purchase{purchaseCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
