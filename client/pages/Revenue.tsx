import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Award,
  Truck,
  Store,
} from "lucide-react";

const COLORS = [
  "#742370",
  "#401951",
  "#8b4d89",
  "#5a2972",
  "#b366a7",
  "#c785bb",
];

export default function Revenue() {
  const { orders, products, getProductById } = useData();
  const { t, language } = useLanguage();

  // Calculate revenue metrics
  const revenueMetrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const lastMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      );
    });

    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const monthlyGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Daily revenue for current month
    const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      const dayOrders = currentMonthOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === date.getDate();
      });
      return {
        day: i + 1,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      };
    });

    // Monthly revenue for last 12 months
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === month && orderDate.getFullYear() === year
        );
      });

      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length,
      };
    }).reverse();

    // Revenue by delivery type
    const deliveryRevenue = orders.reduce(
      (acc, order) => {
        acc[order.deliveryType] = (acc[order.deliveryType] || 0) + order.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    const deliveryTypeData = [
      { name: "Delivery", value: deliveryRevenue.delivery || 0 },
      { name: "Pickup", value: deliveryRevenue.pickup || 0 },
    ];

    // Revenue by product
    const productRevenue = orders.reduce(
      (acc, order) => {
        order.items.forEach((item) => {
          const product = getProductById(item.productId);
          if (product) {
            const key = product.name;
            acc[key] = (acc[key] || 0) + item.price * item.quantity;
          }
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const topProducts = Object.entries(productRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    return {
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      monthlyGrowth,
      avgOrderValue,
      dailyRevenue,
      monthlyRevenue,
      deliveryTypeData,
      topProducts,
    };
  }, [orders, products, getProductById]);

  // Create translated delivery type data
  const translatedDeliveryTypeData = [
    {
      name: t("orders.delivery"),
      value: revenueMetrics.deliveryTypeData[0]?.value || 0,
    },
    {
      name: t("orders.pickup"),
      value: revenueMetrics.deliveryTypeData[1]?.value || 0,
    },
  ];

  const formatCurrency = (amount: number) => formatPrice(amount, language);

  return (
    <ErrorBoundary 
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("revenue.title")}
            </h1>
            <p className="text-gray-600 mt-2">Revenue page temporarily unavailable</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">There was an error loading the revenue data. Please refresh the page or contact support if the issue persists.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("revenue.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("revenue.overview")}</p>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("revenue.totalRevenue")}
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {t("revenue.totalRevenue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("revenue.month")}
            </CardTitle>
            <Calendar className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics.currentMonthRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {revenueMetrics.monthlyGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <p
                className={`text-xs ${revenueMetrics.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {Math.abs(revenueMetrics.monthlyGrowth).toFixed(1)}%{" "}
                {t("revenue.month")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("revenue.avgOrderValue")}
            </CardTitle>
            <Target className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(revenueMetrics.avgOrderValue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {t("revenue.avgOrderValue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("revenue.revenue")}
            </CardTitle>
            <Award className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {((revenueMetrics.currentMonthRevenue / 100) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              BD 100 {t("revenue.month")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monthly">{t("revenue.monthlyTrend")}</TabsTrigger>
          <TabsTrigger value="daily">{t("revenue.dailyRevenue")}</TabsTrigger>
          <TabsTrigger value="products">{t("revenue.topProducts")}</TabsTrigger>
          <TabsTrigger value="delivery">
            {t("revenue.deliveryType")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("revenue.monthlyTrend")}</CardTitle>
              <CardDescription>{t("revenue.monthlyTrend")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary
                fallback={
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Chart temporarily unavailable
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueMetrics.monthlyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(value) => `BD ${value}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#742370"
                      fill="#742370"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("revenue.dailyRevenue")}</CardTitle>
              <CardDescription>{t("revenue.dailyRevenue")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueMetrics.dailyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(value) => `BD ${value}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#742370" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("revenue.topProducts")}</CardTitle>
              <CardDescription>{t("revenue.productRevenue")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueMetrics.topProducts || []}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `BD ${value}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#742370" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("revenue.deliveryAnalysis")}</CardTitle>
                <CardDescription>{t("revenue.deliveryType")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={translatedDeliveryTypeData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {translatedDeliveryTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("revenue.deliveryType")}</CardTitle>
                <CardDescription>
                  {t("revenue.deliveryAnalysis")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {translatedDeliveryTypeData.map((item, index) => {
                  const percentage =
                    revenueMetrics.totalRevenue > 0
                      ? (item.value / revenueMetrics.totalRevenue) * 100
                      : 0;
                  const deliveryKey = index === 0 ? "delivery" : "pickup";
                  const orderCount = orders.filter(
                    (order) => order.deliveryType === deliveryKey,
                  ).length;

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {index === 0 ? (
                          <Truck className="w-5 h-5 text-dashboard-primary" />
                        ) : (
                          <Store className="w-5 h-5 text-dashboard-secondary" />
                        )}
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {orderCount} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-dashboard-primary">
                          {formatCurrency(item.value)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("revenue.overview")}</CardTitle>
            <CardDescription>{t("revenue.overview")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">
                  {t("revenue.revenue")}
                </h4>
                <p className="text-sm text-green-700">
                  {revenueMetrics.monthlyGrowth >= 0
                    ? t("revenue.revenue")
                    : t("revenue.revenue")}{" "}
                  {t("revenue.month")}
                </p>
              </div>
              <Badge
                className={
                  revenueMetrics.monthlyGrowth >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {revenueMetrics.monthlyGrowth.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">
                  {t("revenue.day")}
                </h4>
                <p className="text-sm text-blue-700">
                  {t("revenue.day")}{" "}
                  {revenueMetrics.dailyRevenue.reduce(
                    (max, day, index) =>
                      day.revenue > revenueMetrics.dailyRevenue[max].revenue
                        ? index
                        : max,
                    0,
                  ) + 1}{" "}
                  {t("revenue.month")}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {formatCurrency(
                  Math.max(
                    ...revenueMetrics.dailyRevenue.map((d) => d.revenue),
                  ),
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-purple-900">
                  {t("revenue.avgOrderValue")}
                </h4>
                <p className="text-sm text-purple-700">
                  {t("revenue.avgOrderValue")}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-700">
                {formatCurrency(revenueMetrics.avgOrderValue)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("revenue.revenue")}</CardTitle>
            <CardDescription>{t("revenue.overview")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {t("revenue.month")}
                </span>
                <span className="text-sm text-gray-600">BD 100.00</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-dashboard-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min((revenueMetrics.currentMonthRevenue / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(revenueMetrics.currentMonthRevenue)}{" "}
                {t("revenue.revenue")}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {t("revenue.revenue")}
                </span>
                <span className="text-sm text-gray-600">BD 300.00</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-dashboard-secondary h-2 rounded-full"
                  style={{
                    width: `${Math.min((revenueMetrics.totalRevenue / 300) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(revenueMetrics.totalRevenue)}{" "}
                {t("revenue.revenue")}
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">{t("revenue.overview")}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  •{" "}
                  {revenueMetrics.topProducts[0]?.name ||
                    t("revenue.topProducts")}{" "}
                  - {t("revenue.revenue")}
                </li>
                <li>
                  •{" "}
                  {revenueMetrics.deliveryTypeData[0]?.value >
                  revenueMetrics.deliveryTypeData[1]?.value
                    ? t("orders.delivery") + " " + t("revenue.revenue")
                    : t("orders.pickup") + " " + t("revenue.revenue")}
                </li>
                <li>
                  • BD {(100 - revenueMetrics.currentMonthRevenue).toFixed(2)}{" "}
                  {t("revenue.month")}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  );
}
