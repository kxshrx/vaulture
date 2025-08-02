import Link from "next/link";
import Image from "next/image";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export function CreatorCard({ creator, showStats = true }) {
  const {
    id,
    name,
    bio,
    avatar,
    productCount = 0,
    totalSales = 0,
    socialLinks = {},
  } = creator;

  return (
    <Card className="text-center">
      <div className="p-6">
        {/* Avatar */}
        <div className="w-20 h-20 mx-auto mb-4 relative">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-xl font-semibold">
                {name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name and Bio */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        {bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bio}</p>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex justify-center space-x-6 mb-4 text-sm">
            <div>
              <div className="font-semibold text-gray-900">{productCount}</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{totalSales}</div>
              <div className="text-gray-600">Sales</div>
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <Link href={`/creator/${id}`}>
          <Button variant="secondary" size="small" className="w-full">
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}
