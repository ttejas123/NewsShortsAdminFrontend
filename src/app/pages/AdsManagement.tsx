import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Hash,
  Layout as LayoutIcon
} from "lucide-react";
import { apiClient } from "../services/api";
import { Ad, CreateAdRequest, UpdateAdRequest } from "../types/api";
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
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useTheme } from "../context/ThemeContext";

export function AdsManagement() {
  const { darkMode } = useTheme();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateAdRequest>({
    type: "GOOGLE",
    name: "",
    image_url: "",
    ad_id: "",
    redirect_url: "",
    format: "BANNER",
    position_interval: 5,
    is_active: true,
    start_date: "",
    end_date: "",
  });

  // Dark mode helpers
  const dm = darkMode;
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const borderCol = dm ? "border-gray-800" : "border-gray-100";
  const hoverBg = dm ? "hover:bg-gray-800/50" : "hover:bg-gray-50";
  const inputBg = dm ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900";

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAds();
      // Ensure response is an array
      const fetchedAds = Array.isArray(response) ? response : [];
      setAds(fetchedAds.length > 0 ? fetchedAds : []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch ads, using dummy data:", err);
      // Keep dummy data on error
      setAds([]);
      // We don't necessarily want to show an error if we have dummy data to show
      // setError(err.message || "Failed to fetch ads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenAddDialog = () => {
    setCurrentAd(null);
    setFormData({
      type: "GOOGLE",
      name: "",
      image_url: "",
      ad_id: "",
      redirect_url: "",
      format: "BANNER",
      position_interval: 5,
      is_active: true,
      start_date: "",
      end_date: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setFormData({
      type: ad.type,
      name: ad.name,
      image_url: ad.image_url || "",
      ad_id: ad.ad_id || "",
      redirect_url: ad.redirect_url || "",
      format: ad.format,
      position_interval: ad.position_interval || 5,
      is_active: ad.is_active,
      start_date: ad.start_date || "",
      end_date: ad.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentAd) {
        const updated = await apiClient.updateAd(currentAd.id, formData);
        setAds(ads.map(a => a.id === currentAd.id ? updated : a));
      } else {
        const created = await apiClient.createAd(formData);
        setAds([...ads, created]);
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      await apiClient.deleteAd(id);
      setAds(ads.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete ad");
    }
  };

  const toggleAdStatus = async (ad: Ad) => {
    if (ad.is_active && !window.confirm("Deactivate this advertisement?")) return;
    if (!ad.is_active && !window.confirm("Activate this advertisement?")) return;
    try {
      const updated = await apiClient.updateAd(ad.id, { is_active: !ad.is_active });
      await fetchAds();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textTitle}`}>Ads Management</h1>
          <p className={textMuted}>Create and manage advertisement campaigns.</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} className="mr-2" /> Create Ad
        </Button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden relative min-h-[400px] ${cardBg}`}>

        {error && (
          <div className={`p-4 border-b flex justify-between items-center ${
            dm ? "bg-red-900/20 text-red-400 border-red-800/40" : "bg-red-50 text-red-700 border-red-100"
          }`}>
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchAds} className={dm ? "text-red-400 hover:bg-red-900/40" : "text-red-700 hover:bg-red-100"}>Retry</Button>
          </div>
        )}

        {isLoading ? (
          <div className={`flex flex-col items-center justify-center py-20 ${textMuted}`}>
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading advertisements...</p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader className={dm ? "bg-gray-800/50" : "bg-gray-50"}>
                <TableRow className={dm ? "border-gray-800" : ""}>
                  <TableHead className={`w-[100px] ${dm ? "text-gray-300 hover:text-gray-100" : ""}`}>Preview</TableHead>
                   <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Campaign Name</TableHead>
                   <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Type & Frequency</TableHead>
                   <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Owner</TableHead>
                   <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Position</TableHead>
                   <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Status</TableHead>
                  <TableHead className={`text-center ${dm ? "text-gray-300 hover:text-gray-100" : ""}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                   <TableRow className={dm ? "border-gray-800" : ""}>
                    <TableCell colSpan={8} className={`text-center py-36 ${textMuted}`}>
                      No advertisement providers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id} className={dm ? "border-gray-800" : ""}>
                      <TableCell>
                        <div className={`w-16 h-12 rounded border overflow-hidden flex items-center justify-center ${dm ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                          {ad.image_url ? (
                            <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-400" size={20} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className={`font-semibold ${textTitle}`}>{ad.name.length > 20 ? ad.name.slice(0, 20) + "..." : ad.name}</div>
                          <div className="flex flex-col">
                            {ad.type === "AFFILIATE" ? (
                              <span className={`text-[10px] flex items-center ${dm ? "text-indigo-400" : "text-indigo-600"}`}>
                                {ad.redirect_url} <ExternalLink size={8} className="ml-1" />
                              </span>
                            ) : (
                              <span className={`text-[10px] flex items-center ${dm ? "text-amber-400" : "text-amber-600"}`}>
                                ID: {ad.ad_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                            ad.type === "GOOGLE" 
                              ? (dm ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-700 border border-amber-100")
                              : (dm ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border border-indigo-100")
                          }`}>
                            {ad.type}
                          </span>
                          <span className={`text-[10px] font-medium flex items-center ${textMuted}`}>
                            Frequency: 1 every {ad.position_interval} items
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${textMuted}`}>{ad.owner || "System"}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-mono px-2 py-1 rounded capitalize ${dm ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                          {ad.format?.replace("_", " ") || "N/A"}
                        </span>
                      </TableCell>
               
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={ad.is_active} 
                            onCheckedChange={() => toggleAdStatus(ad)}
                          />
                          {ad.is_active ? (
                            <span className={`text-xs flex items-center ${dm ? "text-green-400" : "text-green-600"}`}><CheckCircle2 size={12} className="mr-1" /> Active</span>
                          ) : (
                            <span className={`text-xs flex items-center ${textMuted}`}><XCircle size={12} className="mr-1" /> Inactive</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEditDialog(ad)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentAd ? "Edit Advertisement" : "Create New Ad"}</DialogTitle>
              <DialogDescription>
                Fill in the details for your advertisement campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ad Type</Label>
                  <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "GOOGLE" })}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.type === "GOOGLE"
                          ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <LayoutIcon size={14} /> Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "AFFILIATE" })}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.type === "AFFILIATE"
                          ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <ImageIcon size={14} /> Affiliate
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="format">Format</Label>
                  <Select 
                    value={formData.format} 
                    onValueChange={(val) => setFormData({...formData, format: val as 'BANNER' | 'NATIVE'})}
                  >
                    <SelectTrigger id="format" className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANNER">Banner</SelectItem>
                      <SelectItem value="NATIVE">Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Summer Sale 2024 | 50% Discount | Alibaba" 
                  required
                  className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                />
              </div>

              {formData.type === "GOOGLE" ? (
                <div className="grid gap-2">
                  <Label htmlFor="ad_id" className="flex items-center gap-2">
                    <LayoutIcon size={14} className="text-amber-500" /> Google Ad Unit ID
                  </Label>
                  <Input 
                    id="ad_id" 
                    value={formData.ad_id}
                    onChange={(e) => setFormData({...formData, ad_id: e.target.value})}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" 
                    required={formData.type === "GOOGLE"}
                    className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                  />
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="image_url" className="flex items-center gap-2">
                      <ImageIcon size={14} className="text-indigo-500" /> Banner Image URL
                    </Label>
                    <Input 
                      id="image_url" 
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://images.unsplash.com/..." 
                      type="url"
                      required={formData.type === "AFFILIATE"}
                      className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="redirect_url" className="flex items-center gap-2">
                      <ExternalLink size={14} className="text-indigo-500" /> Redirect Link
                    </Label>
                    <Input 
                      id="redirect_url" 
                      value={formData.redirect_url}
                      onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                      placeholder="https://yourlink.com/promo" 
                      type="url"
                      required={formData.type === "AFFILIATE"}
                      className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position_interval" className="flex items-center gap-2">
                    <Hash size={14} /> Display Frequency
                  </Label>
                  <Input 
                    id="position_interval" 
                    type="number"
                    min={1}
                    value={formData.position_interval}
                    onChange={(e) => setFormData({...formData, position_interval: parseInt(e.target.value)})}
                    placeholder="Show every X items" 
                    required
                    className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className={`flex items-center h-10 gap-2 border rounded-md px-3 ${dm ? "bg-gray-800/50 border-gray-700" : "bg-gray-50/50"}`}>
                    <Switch 
                      id="is_active" 
                      checked={formData.is_active}
                      onCheckedChange={(val) => setFormData({...formData, is_active: val})}
                    />
                    <span className={`text-sm ${textMuted}`}>{formData.is_active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date" className="flex items-center gap-2">
                    <Calendar size={14} /> Start Date
                  </Label>
                  <Input 
                    id="start_date" 
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Calendar size={14} /> End Date
                  </Label>
                  <Input 
                    id="end_date" 
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  currentAd ? "Update Ad" : "Create Ad"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
