import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import { Header } from "../components/layout";
import { Sidebar } from "../components/layout";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from "../hooks/useNavigation";
import { formatCurrency } from "../utils/currency";
import { StatusBadge } from "../components/ui/Badge";

function PaymentHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { 
    sidebarOpen, 
    currentPath, 
    openSidebar, 
    closeSidebar, 
    navigateTo, 
    handleLogout 
  } = useNavigation();
  
  // Determine user type from current path
  const userType = location.pathname.includes('/captain/') ? 'captain' : 'user';
  
  const [transactions, setTransactions] = useState([
    {
      id: 'txn_001',
      type: 'payment',
      amount: 450,
      status: 'completed',
      method: 'Visa ending in 4242',
      description: 'Ride from Colombo to Kandy',
      date: new Date('2024-01-15T10:30:00'),
      rideId: 'ride_001',
      refundable: false
    },
    {
      id: 'txn_002',
      type: 'refund',
      amount: 320,
      status: 'completed',
      method: 'Visa ending in 4242',
      description: 'Refund for cancelled ride',
      date: new Date('2024-01-14T15:45:00'),
      rideId: 'ride_002',
      refundable: false
    },
    {
      id: 'txn_003',
      type: 'payment',
      amount: 280,
      status: 'pending',
      method: 'Mastercard ending in 8888',
      description: 'Ride from Galle to Matara',
      date: new Date('2024-01-14T09:15:00'),
      rideId: 'ride_003',
      refundable: true
    },
    {
      id: 'txn_004',
      type: 'payment',
      amount: 150,
      status: 'failed',
      method: 'Visa ending in 4242',
      description: 'Ride booking failed',
      date: new Date('2024-01-13T18:20:00'),
      rideId: 'ride_004',
      refundable: false
    }
  ]);

  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    yesterday: true,
    earlier: true
  });

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const classifyTransactionsByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const isYesterday = (date) =>
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const todayTxns = [];
    const yesterdayTxns = [];
    const earlierTxns = [];

    filteredTransactions.forEach((txn) => {
      if (isToday(txn.date)) {
        todayTxns.push(txn);
      } else if (isYesterday(txn.date)) {
        yesterdayTxns.push(txn);
      } else {
        earlierTxns.push(txn);
      }
    });

    return {
      today: todayTxns.sort((a, b) => new Date(b.date) - new Date(a.date)),
      yesterday: yesterdayTxns.sort((a, b) => new Date(b.date) - new Date(a.date)),
      earlier: earlierTxns.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTransactionIcon = (type, status) => {
    if (type === 'refund') return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
    if (status === 'pending') return <Clock className="w-5 h-5 text-yellow-600" />;
    return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'gray';
    }
  };

  const classifiedTransactions = classifyTransactionsByDate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        userType={userType}
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header */}
      <Header
        title="Payment History"
        showMenu={true}
        showNotifications={true}
        user={user}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo(`/${userType}/notifications`)}
        onProfileClick={() => navigateTo(`/${userType}/edit-profile`)}
      />

      {/* Back Button and Export */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
        
        <p className="text-sm text-gray-500">
          {filteredTransactions.length} transactions
        </p>
      </div>

      <div className="px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(transactions.filter(t => t.type === 'payment' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(transactions.filter(t => t.type === 'refund' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(transactions.filter(t => {
                    const txnDate = new Date(t.date);
                    const now = new Date();
                    return txnDate.getMonth() === now.getMonth() && 
                           txnDate.getFullYear() === now.getFullYear() &&
                           t.type === 'payment' && t.status === 'completed';
                  }).reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions by Date */}
        <div className="space-y-6">
          {/* Today */}
          <TransactionSection
            title="Today"
            transactions={classifiedTransactions.today}
            isExpanded={expandedSections.today}
            onToggle={() => toggleSection('today')}
          />

          {/* Yesterday */}
          <TransactionSection
            title="Yesterday"
            transactions={classifiedTransactions.yesterday}
            isExpanded={expandedSections.yesterday}
            onToggle={() => toggleSection('yesterday')}
          />

          {/* Earlier */}
          <TransactionSection
            title="Earlier"
            transactions={classifiedTransactions.earlier}
            isExpanded={expandedSections.earlier}
            onToggle={() => toggleSection('earlier')}
          />
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Receipt className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Transaction Section Component
const TransactionSection = ({ title, transactions, isExpanded, onToggle }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {transactions.length}
          </span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction }) => {
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionIcon = (type, status) => {
    if (type === 'refund') return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
    if (status === 'pending') return <Clock className="w-5 h-5 text-yellow-600" />;
    return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'gray';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getTransactionIcon(transaction.type, transaction.status)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">{transaction.method}</p>
              <span className="text-gray-300">•</span>
              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2">
            <p className={`font-semibold ${
              transaction.type === 'refund' ? 'text-green-600' : 
              transaction.status === 'failed' ? 'text-red-600' : 'text-gray-900'
            }`}>
              {transaction.type === 'refund' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
            <StatusBadge status={transaction.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1">ID: {transaction.id}</p>
        </div>
      </div>
    </Card>
  );
};

export default PaymentHistory;