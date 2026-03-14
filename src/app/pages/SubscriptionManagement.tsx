import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Search, 
  User, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  History,
  ArrowRight,
  ArrowLeft,
  Filter,
  Users
} from "lucide-react";
import { apiClient } from "../services/api";
import { 
  SubscriptionCheck, 
  SubscriptionGrantRequest, 
  SubscriptionRecord,
  User as UserType
} from "../types/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useTheme } from "../context/ThemeContext";
import { useDebounce } from "../hook/useDebounce";

export function SubscriptionManagement() {
  const { darkMode } = useTheme();
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  
  // Master table state
  const [users, setUsers] = useState<UserType[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // User detail state
  const [userId, setUserId] = useState(urlUserId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubscriptionCheck | null>(null);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);

  // Grant form state
  const [grantData, setGrantData] = useState<Omit<SubscriptionGrantRequest, "user_id">>({
    plan_type: "FREE",
    end_date: ""
  });
  const [isGranting, setIsGranting] = useState(false);

  // Dark mode helpers
  const dm = darkMode;
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const inputBg = dm ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";

  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const response = await apiClient.getUsers({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
      });
      setUsers(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (!urlUserId) {
      fetchUsers();
    }
  }, [urlUserId, fetchUsers]);

  const loadUserData = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setStatus(null);
    setHistory([]);

    try {
      const [statusRes, historyRes] = await Promise.all([
        apiClient.checkSubscription(id),
        apiClient.getSubscriptionHistory(id)
      ]);
      setStatus(statusRes);
      setHistory(historyRes);
    } catch (err: any) {
      console.error("Search failed:", err);
      if (err.status === 404) {
        setError("User not found or no subscription data available.");
      } else {
        setError(err.message || "Failed to fetch subscription data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlUserId) {
      setUserId(urlUserId);
      loadUserData(urlUserId);
    } else {
      setUserId("");
      setStatus(null);
      setHistory([]);
    }
  }, [urlUserId, loadUserData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    navigate(`/subscriptions/${userId}`);
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !grantData.end_date) return;

    setIsGranting(true);
    try {
      await apiClient.grantSubscription({
        user_id: userId,
        ...grantData
      });
      // Refresh data
      await loadUserData(userId);
      alert("Subscription granted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to grant subscription.");
    } finally {
      setIsGranting(false);
    }
  };

  if (urlUserId) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/subscriptions")}
            className={dm ? "border-gray-700 hover:bg-gray-800" : ""}
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Users
          </Button>
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${textTitle}`}>User Subscription Detail</h1>
          <p className={textMuted}>Manage individual user premium plans and history.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className={textMuted}>Fetching subscription data...</p>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-xl border flex flex-col items-center gap-4 text-center ${dm ? "bg-red-900/10 border-red-800 text-red-400" : "bg-red-50 border-red-100 text-red-700"}`}>
            <AlertCircle size={48} />
            <div>
              <h3 className="text-lg font-bold">Error Loading Data</h3>
              <p>{error}</p>
            </div>
            <Button variant="outline" onClick={() => loadUserData(urlUserId)} className={dm ? "border-red-800 hover:bg-red-900/20" : ""}>
              Try Again
            </Button>
          </div>
        ) : status && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Status Card */}
            <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${cardBg}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.isPremium ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                    <User className={status.isPremium ? "text-green-600 dark:text-green-400" : textMuted} size={24} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textTitle}`}>User Profile</h3>
                    <p className={`text-xs ${textMuted}`}>{userId}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  status.isPremium 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {status.isPremium ? "Premium" : "Free User"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <CreditCard className="text-indigo-500" size={18} />
                  <div>
                    <p className={`text-xs font-medium ${textMuted}`}>Current Plan</p>
                    <p className={`text-sm font-semibold ${textTitle}`}>
                      {status.isPremium ? "Active Subscription" : "No Active Plan"}
                    </p>
                  </div>
                </div>
                {status.isPremium && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <CheckCircle2 className="text-green-500" size={18} />
                    <p className={`text-sm ${textTitle}`}>Premium features unlocked</p>
                  </div>
                )}
              </div>
            </div>

            {/* Grant Subscription Form */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textTitle}`}>
                <CreditCard size={18} className="text-indigo-500" /> Grant Subscription
              </h3>
              <form onSubmit={handleGrant} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="plan_type">Plan Type</Label>
                  <Select 
                    value={grantData.plan_type} 
                    onValueChange={(val: any) => setGrantData({...grantData, plan_type: val})}
                  >
                    <SelectTrigger id="plan_type" className={inputBg}>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">FREE</SelectItem>
                      <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                      <SelectItem value="ANNUAL">ANNUAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end_date">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={16} />
                    <Input 
                      id="end_date" 
                      type="date"
                      required
                      value={grantData.end_date}
                      onChange={(e) => setGrantData({...grantData, end_date: e.target.value})}
                      className={`pl-10 ${inputBg}`}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isGranting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {isGranting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  Update Subscription
                </Button>
              </form>
            </div>

            {/* Subscription History */}
            <div className={`p-6 rounded-xl border shadow-sm md:col-span-2 ${cardBg}`}>
              <h3 className={`font-semibold mb-6 flex items-center gap-2 ${textTitle}`}>
                <History size={18} className="text-indigo-500" /> Subscription History
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className={`mx-auto mb-2 opacity-20 ${textMuted}`} size={48} />
                  <p className={textMuted}>No past subscription records found.</p>
                </div>
              ) : (
                <div className="relative space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
                  
                  {history.map((record, index) => (
                    <div key={record.id} className="relative pl-8">
                      {/* Dot */}
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                        record.status === 'active' 
                          ? (dm ? "bg-green-500 border-gray-900" : "bg-green-500 border-white") 
                          : (dm ? "bg-gray-700 border-gray-900" : "bg-gray-300 border-white")
                      }`} />
                      
                      <div className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        dm ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-100"
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-md ${dm ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                            <CreditCard className="text-indigo-500" size={20} />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${textTitle}`}>{record.plan_type} Plan</p>
                            <p className={`text-xs ${textMuted}`}>Started: {new Date(record.start_date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-[10px] uppercase font-bold tracking-wider ${textMuted}`}>Expires</p>
                            <p className={`text-sm font-medium ${textTitle}`}>{new Date(record.end_date).toLocaleDateString()}</p>
                          </div>
                          <ArrowRight className={textMuted} size={14} />
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            record.status === 'active' 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          }`}>
                            {record.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Master Table View
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className={`text-2xl font-bold ${textTitle}`}>Subscription Master Table</h1>
        <p className={textMuted}>Select a user to manage their subscription details.</p>
      </div>

      <div className={`rounded-xl border shadow-sm ${cardBg}`}>
        <div className={`p-4 border-b flex items-center gap-3 ${dm ? "border-gray-800" : "border-gray-100"}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search users by name, email or ID..." 
              className={`pl-10 ${dm ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500" : ""}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm flex items-center gap-1 ${textMuted}`}>
              <Users size={14} /> Total Users: {users.length}
            </span>
          </div>
        </div>

        {isUsersLoading ? (
          <div className={`flex flex-col items-center justify-center py-20 ${textMuted}`}>
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className={dm ? "bg-gray-800/50" : "bg-gray-50"}>
              <TableRow className={dm ? "border-gray-800" : ""}>
                <TableHead className={dm ? "text-gray-300" : ""}>User</TableHead>
                <TableHead className={dm ? "text-gray-300" : ""}>ID / System UID</TableHead>
                <TableHead className={dm ? "text-gray-300" : ""}>Role</TableHead>
                <TableHead className={`text-right ${dm ? "text-gray-300" : ""}`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow className={dm ? "border-gray-800" : ""}>
                  <TableCell colSpan={4} className={`text-center py-10 ${textMuted}`}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={dm ? "border-gray-800 hover:bg-gray-800/30" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium overflow-hidden">
                          {user.profile_picture ? (
                            <img src={user.profile_picture} alt={user.display_name} className="w-full h-full object-cover" />
                          ) : (
                            user.display_name?.charAt(0) || user.email?.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${textTitle}`}>{user.display_name}</p>
                          <p className={`text-xs ${textMuted}`}>{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className={`text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 ${textMuted}`}>
                        {user.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${dm ? "border-gray-700 text-gray-400" : ""}`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/subscriptions/${user.id}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <div className={`p-4 border-t flex items-center justify-between ${dm ? "border-gray-800" : "border-gray-100"}`}>
          <p className={`text-sm ${textMuted}`}>
            Showing {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={dm ? "border-gray-700 hover:bg-gray-800 text-gray-300" : ""}
            >
              Previous
            </Button>
            <span className={`text-sm font-medium px-4 ${textBody}`}>Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={dm ? "border-gray-700 hover:bg-gray-800 text-gray-300" : ""}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Search as fallback */}
      <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
        <h3 className={`font-semibold mb-4 ${textTitle}`}>Lookup by User ID</h3>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={18} />
            <Input 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User System UUID manually..." 
              className={`pl-10 ${inputBg}`}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            Fetch Details
          </Button>
        </form>
      </div>
    </div>
  );
}
