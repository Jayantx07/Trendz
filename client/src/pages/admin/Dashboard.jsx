import React, { useState, useEffect } from 'react';
import { apiAuthFetch } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiAuthFetch('/orders/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
  if (!stats) return <div className="p-10 text-center">Failed to load stats</div>;

  // Process sales data to fill missing days for the current month
  const processChartData = (data) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      // Format as YYYY-MM-DD to match backend data format
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      monthDays.push(dateStr);
    }

    const salesMap = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        salesMap[item._id] = item.sales;
      });
    }

    return {
      labels: monthDays.map(date => parseInt(date.split('-')[2])), // Just the day number
      data: monthDays.map(date => salesMap[date] || 0)
    };
  };

  const processedData = processChartData(stats.salesPerformance);

  // Chart Data
  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: 'Sales',
        data: processedData.data,
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Sales: ₹${context.parsed.y.toLocaleString()}`
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10000, // Ensure scale goes up to at least 10k
        grid: { 
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: { 
          maxTicksLimit: 8,
          callback: (value) => {
            if (value === 0) return '₹0';
            if (value >= 1000) return '₹' + (value / 1000).toFixed(1).replace('.0', '') + 'k';
            return '₹' + value;
          },
          color: '#000000',
          font: { size: 11 },
          padding: 10
        },
        border: { display: false }
      },
      x: {
        grid: { 
          display: true,
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: { 
          color: '#000000',
          font: { size: 11 },
          maxTicksLimit: 10
        },
        border: { display: false }
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-secondary min-h-screen">
      <h1 className="text-2xl font-bold mb-6 lg:mb-8 text-black">Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard 
          title="Total Sales" 
          value={`₹${stats.totalSales.toLocaleString()}`} 
          icon={DollarSign} 
          trend={stats.salesGrowth > 0 ? `+${stats.salesGrowth}%` : `${stats.salesGrowth}%`}
          showTrend={true}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend={stats.ordersGrowth > 0 ? `+${stats.ordersGrowth}%` : `${stats.ordersGrowth}%`}
          showTrend={true}
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`₹${stats.aov}`} 
          icon={TrendingUp} 
          showTrend={false}
        />
        <StatCard 
          title="Returning Customers" 
          value={`${stats.returningCustomers}%`} 
          icon={Users} 
          showTrend={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-black">Sales Performance</h2>
            <select className="text-sm border-gray-200 rounded-md text-black">
              <option>This Month</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Best Selling Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-black">Best-Selling Categories</h2>
            <select className="text-sm border-gray-200 rounded-md text-black">
              <option>This Month</option>
            </select>
          </div>
          <div className="space-y-6">
            {stats.bestSellingCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-black">{cat._id}</span>
                  <span className="text-black">₹{cat.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black" 
                    style={{ width: `${(cat.revenue / stats.totalSales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-black">Top Products</h2>
          <select className="text-sm border-gray-200 rounded-md text-black">
            <option>This Month</option>
          </select>
        </div>
        <div className="space-y-4">
          {stats.topProducts.map((prod, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm text-black">{prod._id}</span>
                  <span className="text-sm text-black">{prod.unitsSold} pcs</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black" 
                    style={{ width: `${(prod.unitsSold / stats.topProducts[0].unitsSold) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, showTrend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm text-black mb-1 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-black">{value}</h3>
      </div>
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={20} className="text-black" />
      </div>
    </div>
    {showTrend && (
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium text-black`}>
          {trend}
        </span>
        <span className="text-black">this month</span>
      </div>
    )}
  </div>
);

export default Dashboard;
