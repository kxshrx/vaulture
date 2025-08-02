import { Card, CardContent } from "../ui/Card";

export function StatsCard({ title, value, subtitle, icon, trend, trendValue }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend === "up" ? "+" : "-"}
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {icon && <div className="p-3 bg-blue-50 rounded-full">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
