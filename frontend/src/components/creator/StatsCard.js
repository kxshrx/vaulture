import { Card, CardContent } from "../ui/Card";

export function StatsCard({ title, value, subtitle, icon, trend, trendValue }) {
  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-neon-500" : "text-red-400"
                  }`}
                >
                  {trend === "up" ? "+" : "-"}
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {icon && <div className="p-4 bg-dark-500 rounded-xl ml-4">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
