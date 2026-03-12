import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  User as UserIcon,
  MoreVertical,
  Loader2,
  Pencil,
  Filter
} from "lucide-react";
import { apiClient } from "../services/api";
import { User } from "../types/api";
import { Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { getCurrentUser } from "../helper/getCurrentUser";
import { useDebounce } from "../hook/useDebounce";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const currentUser = getCurrentUser();
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    display_name: "",
    role: "client",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getUsers({
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
        role: roleFilter === "all" ? undefined : roleFilter,
      });
      setUsers(response.items);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await apiClient.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      email: "",
      display_name: "",
      role: "client",
      password: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      display_name: user.display_name || "",
      role: user.role || "client",
      password: "", // Don't pre-fill password
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.createUser(formData);
      setIsAddModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.id) return;
    setIsSubmitting(true);
    try {
      const updateData: Partial<User> & { password?: string } = {
        email: formData.email,
        display_name: formData.display_name,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await apiClient.updateUser(selectedUser.id, updateData);
      setIsEditModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none"><ShieldCheck size={12} className="mr-1" /> Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"><Shield size={12} className="mr-1" /> Manager</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"><UserIcon size={12} className="mr-1" /> Client</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage user accounts and permissions.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleOpenAddModal}
        >
          <UserPlus size={18} className="mr-2" /> Add New User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-9">
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
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-100 flex justify-between items-center">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-red-700 hover:bg-red-100">Retry</Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium overflow-hidden">
                          {user.profile_picture ? (
                            <img src={user.profile_picture} alt={user.display_name} className="w-full h-full object-cover" />
                          ) : (
                            user.display_name?.charAt(0) || user.email?.charAt(0)
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{user.display_name}</span>
                        {user.sysuid && <Badge variant="outline" className="text-[10px] scale-90 opacity-50">API</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Select 
                          value={user.role} 
                          onValueChange={(val) => handleRoleChange(user.id!, val)}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Change Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dropdown menu={{ 
                          items: [
                                  {
                                    key: "edit",
                                    label: (
                                      <div
                                        className="flex items-center"
                                        onClick={() => handleOpenEditModal(user)}
                                      >
                                        <Pencil size={14} className="mr-2" />
                                        Edit User
                                      </div>
                                    ),
                                  },
                                  ...(currentUser?.role === "admin" && user.id != currentUser.id
                                    ? [
                                        {
                                          key: "delete",
                                          label: (
                                            <div
                                              className="flex items-center text-red-600"
                                              onClick={() => handleDeleteUser(user.id!)}
                                            >
                                              <Trash2 size={14} className="mr-2" />
                                              Delete User
                                            </div>
                                          ),
                                        },
                                      ]
                                    : []),
                                ]
                        }} trigger={["click"]}>
                          <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded">
                            <MoreOutlined />
                          </button>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-medium px-4">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Display Name</Label>
                <Input
                  id="add-name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger id="add-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details or change their role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input
                  id="edit-name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
