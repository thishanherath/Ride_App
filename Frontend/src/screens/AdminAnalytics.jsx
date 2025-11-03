import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  MapPin,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Download,
  Eye,
  Activity
} from "lucide-react";
import { Card, Button, Select } from "../components/ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/analytics`, {
        headers: { token },
        params: { period }
      });

      setAnalytics(response.data);
    } catch (error) {
      Console.error("Error fetching analytics:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : (
                <Activity className="w-4 h-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const PieChart = ({ data, colors }) => {
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;
    
    let currentAngle = 0;
    
    const segments = data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      // Calculate path for pie slice
      const radius = 75;
      const centerX = 100;
      const centerY = 100;
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos(((startAngle + angle) * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin(((startAngle + angle) * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      return {
        ...item,
        pathData,
        color: colors[index % colors.length],
        percentage: percentage.toFixed(1)
      };
    });
    
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 200 200" className="transform -rotate-90 drop-shadow-sm">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-90 hover:scale-105 cursor-pointer filter drop-shadow-sm"
                stroke="white"
                strokeWidth="3"
                style={{
                  transformOrigin: '100px 100px'
                }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-sm">
              <p className="text-lg font-bold text-gray-900">{total.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 min-w-[200px]">
          {segments.map((segment, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div 
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{segment.label}</p>
                <p className="text-xs text-gray-600">
                  {segment.value.toLocaleString()} ({segment.percentage}%)
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, data, type = "pie", colors = [] }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center">
        {data && data.length > 0 ? (
          type === "pie" ? (
            <PieChart data={data} colors={colors} />
          ) : (
            <div className="w-full h-full flex items-end justify-between px-4 py-4">
              {data.slice(0, 7).map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                    style={{ 
                      height: `${Math.max((item.value / Math.max(...data.map(d => d.value))) * 200, 10)}px`,
                      width: '20px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        )}
      </div>
    </Card>
  );

  const getPeriodLabel = (period) => {
    switch (period) {
      case "7d": return "Last 7 Days";
      case "30d": return "Last 30 Days";
      case "90d": return "Last 90 Days";
      case "1y": return "Last Year";
      default: return "Last 30 Days";
    }
  };

  const formatChartData = (data, valueKey, labelKey) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      label: labelKey === 'date' ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item._id,
      value: item[valueKey] || 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const rideStats = analytics?.rideStats || {};
  const revenueData = formatChartData(analytics?.revenueStats, 'revenue', 'date');
  const userData = formatChartData(analytics?.userStats, 'count', 'date');
  const captainData = formatChartData(analytics?.captainStats, 'count', 'date');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Detailed insights and performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </Select>
              
              <Button
                onClick={fetchAnalytics}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Period Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics Overview - {getPeriodLabel(period)}
          </h2>
          <p className="text-gray-600">
            Comprehensive performance metrics and trends for the selected period
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Rides"
            value={rideStats.totalRides?.toLocaleString() || '0'}
            icon={MapPin}
            color="bg-blue-500"
            trend="up"
            trendValue={`${rideStats.totalRides || 0} rides`}
          />
          
          <StatCard
            title="Completed Rides"
            value={rideStats.completedRides?.toLocaleString() || '0'}
            icon={Activity}
            color="bg-green-500"
            trend="up"
            trendValue={`${Math.round(((rideStats.completedRides || 0) / (rideStats.totalRides || 1)) * 100)}% completion rate`}
          />
          
          <StatCard
            title="Total Revenue"
            value={formatCurrency(rideStats.totalRevenue || 0)}
            icon={DollarSign}
            color="bg-purple-500"
            trend="up"
            trendValue={`${formatCurrency(rideStats.avgFare || 0)} avg fare`}
          />
          
          <StatCard
            title="Cancelled Rides"
            value={rideStats.cancelledRides?.toLocaleString() || '0'}
            icon={TrendingDown}
            color="bg-red-500"
            trend="down"
            trendValue={`${Math.round(((rideStats.cancelledRides || 0) / (rideStats.totalRides || 1)) * 100)}% cancellation rate`}
          />
        </div>

        {/* Pie Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Ride Status Distribution"
            data={[
              { label: 'Completed Rides', value: rideStats.completedRides || 0 },
              { label: 'Cancelled Rides', value: rideStats.cancelledRides || 0 },
              { label: 'Active Rides', value: Math.max((rideStats.totalRides || 0) - (rideStats.completedRides || 0) - (rideStats.cancelledRides || 0), 0) }
            ].filter(item => item.value > 0)}
            type="pie"
            colors={['#10B981', '#EF4444', '#3B82F6']}
          />
          
          <ChartCard
            title="Performance Metrics"
            data={[
              { label: 'Successful Rides', value: rideStats.completedRides || 0 },
              { label: 'Failed Rides', value: rideStats.cancelledRides || 0 },
              { label: 'Revenue Generated', value: Math.round((rideStats.totalRevenue || 0) / 100) }, // Scaled down for visualization
              { label: 'Average Fare', value: Math.round(rideStats.avgFare || 0) }
            ].filter(item => item.value > 0)}
            type="pie"
            colors={['#10B981', '#EF4444', '#8B5CF6', '#F59E0B']}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Daily Revenue Breakdown"
            data={revenueData.slice(-5).map(item => ({
              label: item.label,
              value: item.value
            }))}
            type="pie"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          />
          
          <ChartCard
            title="Growth Analytics"
            data={[
              { label: 'New Users', value: userData.reduce((sum, item) => sum + item.value, 0) || 1 },
              { label: 'New Captains', value: captainData.reduce((sum, item) => sum + item.value, 0) || 1 },
              { label: 'Total Rides', value: Math.round((rideStats.totalRides || 0) / 10) || 1 }, // Scaled for better visualization
              { label: 'Revenue (100s)', value: Math.round((rideStats.totalRevenue || 0) / 1000) || 1 }
            ].filter(item => item.value > 0)}
            type="pie"
            colors={['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6']}
          />
        </div>

        {/* Performance Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ride Efficiency</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(((rideStats.completedRides || 0) / (rideStats.totalRides || 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Revenue Performance</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(rideStats.avgFare || 0)}
              </p>
              <p className="text-sm text-gray-600">Average Fare</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Growth Metrics</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {userData.length > 0 ? userData.reduce((sum, item) => sum + item.value, 0) : 0}
              </p>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Ride Completion Rate</p>
                <p className="text-sm text-gray-600">
                  {Math.round(((rideStats.completedRides || 0) / (rideStats.totalRides || 1)) * 100)}% of rides are successfully completed, 
                  indicating good service reliability.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Revenue Growth</p>
                <p className="text-sm text-gray-600">
                  Total revenue of {formatCurrency(rideStats.totalRevenue || 0)} with an average fare of {formatCurrency(rideStats.avgFare || 0)} per ride.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Cancellation Analysis</p>
                <p className="text-sm text-gray-600">
                  {rideStats.cancelledRides || 0} rides were cancelled 
                  ({Math.round(((rideStats.cancelledRides || 0) / (rideStats.totalRides || 1)) * 100)}% cancellation rate). 
                  Monitor for improvement opportunities.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminAnalytics;