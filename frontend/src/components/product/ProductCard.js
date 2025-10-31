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
    <Card hover className={`overflow-hidden cursor-pointer group ${className}`}>
      <Link href={`/product/${id}`}>
        {/* Product Image */}
        <div className="relative aspect-video bg-dark-500 overflow-hidden">
          {image ? (
            <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <span>No Image</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Chip variant="category" size="small">
              {category}
            </Chip>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-semibold text-white mb-2 line-clamp-2 text-lg leading-tight group-hover:text-neon-500 transition-colors">
            {title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleCreatorClick}
              className="text-sm text-gray-400 hover:text-neon-500 transition-colors text-left font-medium"
            >
              {creator?.name}
            </button>
            <span className="text-xl font-bold text-neon-500">{formatPriceINR(price)}</span>
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
