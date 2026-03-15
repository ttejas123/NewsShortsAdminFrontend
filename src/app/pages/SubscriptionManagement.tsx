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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  const [roleFilter, setRoleFilter] = useState("all");

  // User detail state
  const [userId, setUserId] = useState(urlUserId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubscriptionCheck | null>(null);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
  const [historyPlanFilter, setHistoryPlanFilter] = useState("ALL");

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
        role: roleFilter === "all" ? undefined : roleFilter,
      });
      setUsers(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, roleFilter]);

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
    setHistoryStatusFilter("ALL");
    setHistoryPlanFilter("ALL");

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

  const filteredHistory = history.filter(record => {
    const isActive = record.is_active !== undefined ? record.is_active : record.status === 'active';
    if (historyStatusFilter === "ACTIVE" && !isActive) return false;
    if (historyStatusFilter === "EXPIRED" && isActive) return false;
    if (historyPlanFilter !== "ALL" && record.plan_type !== historyPlanFilter) return false;
    return true;
  });

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
                      <SelectItem value="BASIC">BASIC</SelectItem>
                      <SelectItem value="ADVANCE">ADVANCE</SelectItem>
                      <SelectItem value="PRO">PRO</SelectItem>
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
              <Tabs defaultValue="list" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <h3 className={`font-semibold flex items-center gap-2 ${textTitle}`}>
                    <History size={18} className="text-indigo-500" /> Subscription History
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                      <SelectTrigger className={`w-[130px] h-9 ${inputBg}`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={historyPlanFilter} onValueChange={setHistoryPlanFilter}>
                      <SelectTrigger className={`w-[130px] h-9 ${inputBg}`}>
                        <SelectValue placeholder="Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Plans</SelectItem>
                        {Array.from(new Set(history.map(h => h.plan_type))).map(pt => (
                          <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <TabsList>
                      <TabsTrigger value="list">List View</TabsTrigger>
                      <TabsTrigger value="timeline">Graph</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="list" className="mt-0">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-10">
                      <Clock className={`mx-auto mb-2 opacity-20 ${textMuted}`} size={48} />
                      <p className={textMuted}>No past subscription records found matching filters.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-6">
                      {/* Vertical Line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
                      
                      {filteredHistory.map((record, index) => {
                    const isActive = record.is_active !== undefined ? record.is_active : record.status === 'active';
                    
                    return (
                    <div key={record.id} className="relative pl-8">
                      {/* Dot */}
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                        isActive 
                          ? (dm ? "bg-green-500 border-gray-900" : "bg-green-500 border-white") 
                          : (dm ? "bg-gray-700 border-gray-900" : "bg-gray-300 border-white")
                      }`} />
                      
                      <div className={`p-4 rounded-lg border flex flex-col gap-4 ${
                        dm ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-100"
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                              isActive 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            }`}>
                              {isActive ? "Active" : record.status || "Expired"}
                            </div>
                          </div>
                        </div>

                        {record.perks && record.perks.length > 0 && (
                          <div className="mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${textMuted}`}>Plan Perks</p>
                            <div className="flex flex-wrap gap-2">
                              {record.perks.map((perk, idx) => (
                                <Badge key={idx} variant="secondary" className={`${dm ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} font-normal text-[11px] flex items-center gap-1`}>
                                  <CheckCircle2 size={10} className="text-green-500" />
                                  {perk}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              )}
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-10 border rounded-xl border-dashed dark:border-gray-800">
                      <Clock className={`mx-auto mb-2 opacity-20 ${textMuted}`} size={48} />
                      <p className={textMuted}>No past subscription records found matching filters.</p>
                    </div>
                  ) : (
                    (() => {
                      const sortedHistory = [...filteredHistory].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
                      const earliestDate = new Date(sortedHistory[0].start_date).getTime();
                      const latestDate = Math.max(...sortedHistory.map(r => new Date(r.end_date).getTime()));
                      const totalDuration = latestDate - earliestDate || 1; // prevent div by zero
                      const paddedDuration = totalDuration * 1.2;
                      const paddingOffset = totalDuration * 0.1;

                      // Compute non-overlapping tracks
                      const trackEnds: number[] = [];
                      const recordTrackMap = new Map<string, number>();
                      
                      sortedHistory.forEach(record => {
                        const startT = new Date(record.start_date).getTime();
                        const endT = new Date(record.end_date).getTime();
                        let trackIdx = trackEnds.findIndex(end => end <= startT);
                        if (trackIdx === -1) {
                          trackIdx = trackEnds.length;
                          trackEnds.push(endT);
                        } else {
                          trackEnds[trackIdx] = endT;
                        }
                        recordTrackMap.set(record.id, trackIdx);
                      });

                      const numTracks = Math.max(1, trackEnds.length);
                      const trackHeight = 24;
                      const graphHeight = Math.max(80, numTracks * trackHeight + 40);

                      return (
                        <div className="relative w-full overflow-x-auto py-8 scrollbar-thin rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 px-4">
                          <div className="min-w-[500px] relative flex items-center" style={{ height: `${graphHeight}px` }}>
                            {/* Main timeline axis line (in the middle vertically) */}
                            <div className={`absolute left-0 right-0 h-1 flex rounded-full top-1/2 -translate-y-1/2 ${dm ? "bg-gray-700" : "bg-gray-200"} opacity-50`} />
                            
                            {/* Grid bounds */}
                            <div className="absolute left-0 bottom-0 text-[10px] uppercase font-bold text-gray-400">
                               {new Date(earliestDate).toLocaleDateString()}
                            </div>
                            <div className="absolute right-0 bottom-0 text-[10px] uppercase font-bold text-gray-400">
                               {new Date(latestDate).toLocaleDateString()}
                            </div>

                            {sortedHistory.map((record) => {
                               const startT = new Date(record.start_date).getTime();
                               const endT = new Date(record.end_date).getTime();
                               const leftPercent = ((startT - earliestDate + paddingOffset) / paddedDuration) * 100;
                               const widthPercent = ((endT - startT) / paddedDuration) * 100;
                               const isActive = record.is_active !== undefined ? record.is_active : record.status === 'active';
                               
                               const planColors: Record<string, string> = {
                                 "FREE": "bg-gray-400 hover:bg-gray-300",
                                 "BASIC": "bg-blue-500 hover:bg-blue-400",
                                 "ADVANCE": "bg-purple-500 hover:bg-purple-400",
                                 "PRO": "bg-yellow-500 hover:bg-yellow-400"
                               };
                               
                               // active gets plan color, inactive gets gray
                               const barColor = isActive 
                                 ? (planColors[record.plan_type] || "bg-indigo-500 hover:bg-indigo-400")
                                 : "bg-gray-400 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 opacity-60 hover:opacity-100";
                               
                               const trackIdx = recordTrackMap.get(record.id) || 0;
                               // Center tracks vertically
                               const startY = (graphHeight - numTracks * trackHeight) / 2;
                               const topPos = startY + trackIdx * trackHeight + (trackHeight - 6) / 2; // 6 is bar height

                               return (
                                 <div 
                                   key={record.id} 
                                   className={`absolute group h-1.5 rounded-full ${barColor} cursor-pointer transition-all shadow-sm z-10`}
                                   style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 1)}%`, top: `${topPos}px` }}
                                 >
                                   {/* Tooltip on hover */}
                                   <div className="absolute top-4 left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 rounded-lg shadow-xl bg-gray-900 border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 text-white pointer-events-none">
                                     <p className="font-bold text-sm mb-1">{record.plan_type} Plan</p>
                                     <div className="text-xs text-gray-300 flex flex-col gap-1">
                                       <p><span className="text-gray-400">Status:</span> <span className={isActive ? "text-green-400 font-medium" : "text-gray-300"}>{isActive ? 'Active' : (record.status || 'Expired')}</span></p>
                                       <p><span className="text-gray-400">Start:</span> {new Date(record.start_date).toLocaleDateString()}</p>
                                       <p><span className="text-gray-400">End:</span> {new Date(record.end_date).toLocaleDateString()}</p>
                                     </div>
                                   </div>
                                 </div>
                               )
                            })}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </TabsContent>
              </Tabs>
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
              <Filter size={14} /> Filter:
            </span>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className={`w-[140px] h-9 ${dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}`}>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
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
