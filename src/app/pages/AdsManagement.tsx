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

export function AdsManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
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

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAds();
      // Ensure response is an array (handle cases where backend might return something else if not ready)
      setAds(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch ads");
      // Fallback dummy data for development
      /*
      setAds([
        { 
          id: "1", 
          title: "Premium Subscription", 
          description: "Get ad-free news for just $5/mo", 
          image_url: "https://placehold.co/600x400", 
          link_url: "https://example.com/premium",
          is_active: true,
          position: "middle_feed"
        }
      ]);
      */
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-500">Create and manage advertisement campaigns.</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={18} className="mr-2" /> Create Ad
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-100 flex justify-between items-center">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchAds} className="text-red-700 hover:bg-red-100">Retry</Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Loading advertisements...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Ad Details</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    No advertisements found.
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                        {ad.image_url ? (
                          <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-400" size={20} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{ad.title}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{ad.description}</span>
                        <a 
                          href={ad.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-600 hover:underline flex items-center mt-1"
                        >
                          {ad.link_url} <ExternalLink size={8} className="ml-1" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">
                        {ad.position.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={ad.is_active} 
                          onCheckedChange={() => toggleAdStatus(ad)}
                        />
                        {ad.is_active ? (
                          <span className="text-xs text-green-600 flex items-center"><CheckCircle2 size={12} className="mr-1" /> Active</span>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center"><XCircle size={12} className="mr-1" /> Inactive</span>
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
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="A brief description of the offer..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(val) => setFormData({...formData, position: val})}
                  >
                    <SelectTrigger id="position">
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
                  <div className="flex items-center h-10 gap-2 border rounded-md px-3 bg-gray-50/50">
                    <Switch 
                      id="is_active" 
                      checked={formData.is_active}
                      onCheckedChange={(val) => setFormData({...formData, is_active: val})}
                    />
                    <span className="text-sm text-gray-500">{formData.is_active ? "Active" : "Inactive"}</span>
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
