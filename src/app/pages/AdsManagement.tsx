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
  XCircle
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

const DUMMY_ADS: Ad[] = [
  {
    id: "1",
    title: "Premium News Subscription",
    description: "Upgrade to premium for an ad-free experience and exclusive content.",
    image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop",
    link_url: "https://example.com/premium",
    position: "top_banner",
    is_active: true,
  },
  {
    id: "2",
    title: "Global Tech Summit 2024",
    description: "Join the leaders in technology this summer. Early bird tickets available now.",
    image_url: "https://images.unsplash.com/photo-1540575861501-7ad058c48a33?q=80&w=2070&auto=format&fit=crop",
    link_url: "https://example.com/summit",
    position: "middle_feed",
    is_active: false,
  },
  {
    id: "3",
    title: "Modern Minimalist Watch",
    description: "Elegant design meets precision engineering. Shop the new collection.",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    link_url: "https://example.com/watches",
    position: "sidebar",
    is_active: true,
  }
];

export function AdsManagement() {
  const { darkMode } = useTheme();
  const [ads, setAds] = useState<Ad[]>(DUMMY_ADS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateAdRequest>({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: "top_banner",
    is_active: true,
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
      setAds(fetchedAds.length > 0 ? fetchedAds : DUMMY_ADS);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch ads, using dummy data:", err);
      // Keep dummy data on error
      setAds(DUMMY_ADS);
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
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      position: "top_banner",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      is_active: ad.is_active,
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
    try {
      const updated = await apiClient.updateAd(ad.id, { is_active: !ad.is_active });
      setAds(ads.map(a => a.id === ad.id ? updated : a));
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
        {/* Coming Soon Overlay */}
        <div className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none backdrop-blur-[2px] ${dm ? "bg-black/40" : "bg-white/40"}`}>
          <div className={`p-8 rounded-2xl shadow-2xl border flex flex-col items-center text-center max-w-sm mx-4 transform transition-all pointer-events-auto ${
            dm ? "bg-gray-900/90 border-gray-700 text-gray-100" : "bg-white/90 border-indigo-100 text-gray-900"
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dm ? "bg-indigo-500/20" : "bg-indigo-50"}`}>
              <Megaphone className="text-indigo-400 animate-bounce" size={32} />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${textTitle}`}>Coming Soon!</h2>
            <p className={`mb-6 text-sm ${textMuted}`}>
              We're building a powerful advertisement engine to help you reach more readers. This feature will be available shortly.
            </p>
            <div className="flex gap-2">
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                dm ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                In Development
              </div>
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                dm ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-100"
              }`}>
                Q2 2026
              </div>
            </div>
          </div>
        </div>

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
          <div className="grayscale-[0.5] select-none pointer-events-none">
            <Table>
              <TableHeader className={dm ? "bg-gray-800/50" : "bg-gray-50"}>
                <TableRow className={dm ? "border-gray-800" : ""}>
                  <TableHead className={`w-[100px] ${dm ? "text-gray-300 hover:text-gray-100" : ""}`}>Preview</TableHead>
                  <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Ad Details</TableHead>
                  <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Position</TableHead>
                  <TableHead className={dm ? "text-gray-300 hover:text-gray-100" : ""}>Status</TableHead>
                  <TableHead className={`text-right ${dm ? "text-gray-300 hover:text-gray-100" : ""}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                  <TableRow className={dm ? "border-gray-800" : ""}>
                    <TableCell colSpan={5} className={`text-center py-10 ${textMuted}`}>
                      No advertisements found.
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
                          <span className={`font-medium ${textTitle}`}>{ad.title}</span>
                          <span className={`text-xs line-clamp-1 ${textMuted}`}>{ad.description}</span>
                          <span className={`text-[10px] flex items-center mt-1 ${dm ? "text-indigo-400" : "text-indigo-600"}`}>
                            {ad.link_url} <ExternalLink size={8} className="ml-1" />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-mono px-2 py-1 rounded capitalize ${dm ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                          {ad.position.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={ad.is_active} 
                            disabled
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
                            disabled
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600"
                            disabled
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
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Summer Sale 2024" 
                  required
                  className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="A brief description of the offer..." 
                  className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(val) => setFormData({...formData, position: val})}
                  >
                    <SelectTrigger id="position" className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top_banner">Top Banner</SelectItem>
                      <SelectItem value="middle_feed">Middle Feed</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="native_article">Native Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="is_active">Initial Status</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..." 
                  type="url"
                  required
                  className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link_url">Destination Link</Label>
                <Input 
                  id="link_url" 
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                  placeholder="https://..." 
                  type="url"
                  required
                  className={dm ? "bg-gray-800 border-gray-700 text-gray-100" : ""}
                />
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
