"use client";

import { useEffect, useState, useTransition } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/actions/addresses";
import type { Address } from "@/lib/supabase/types";

interface AddressFormData {
  address_id?: string;
  label: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  delivery_instructions: string;
  is_default: boolean;
}

const emptyForm: AddressFormData = {
  label: "",
  street: "",
  apt: "",
  city: "Gainesville",
  state: "FL",
  zip: "",
  delivery_instructions: "",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    const result = await getAddresses();
    if (result.data) {
      setAddresses(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateDialog = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setFormData({
      address_id: addr.id,
      label: addr.label || "",
      street: addr.street,
      apt: addr.apt || "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      delivery_instructions: addr.delivery_instructions || "",
      is_default: addr.is_default,
    });
    setIsEditing(true);
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      if (formData.address_id) fd.set("address_id", formData.address_id);
      fd.set("label", formData.label);
      fd.set("street", formData.street);
      fd.set("apt", formData.apt);
      fd.set("city", formData.city);
      fd.set("state", formData.state);
      fd.set("zip", formData.zip);
      fd.set("delivery_instructions", formData.delivery_instructions);
      fd.set("is_default", formData.is_default ? "true" : "false");

      const result = isEditing
        ? await updateAddress(fd)
        : await createAddress(fd);

      if (result.error) {
        setError(result.error);
      } else {
        setDialogOpen(false);
        fetchAddresses();
      }
    });
  };

  const handleDelete = (addressId: string) => {
    setDeleteId(addressId);
    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.error) {
        setError(result.error);
      } else {
        fetchAddresses();
      }
      setDeleteId(null);
    });
  };

  const updateField = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Addresses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved pickup and delivery addresses.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update your address details."
                  : "Add a new address for pickup and delivery."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="label">Label (optional)</Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Dorm, Office"
                  value={formData.label}
                  onChange={(e) => updateField("label", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main St"
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apt">Apt / Suite / Unit (optional)</Label>
                <Input
                  id="apt"
                  placeholder="Apt 4B"
                  value={formData.apt}
                  onChange={(e) => updateField("apt", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP</Label>
                  <Input
                    id="zip"
                    placeholder="32601"
                    value={formData.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery_instructions">
                  Delivery Instructions (optional)
                </Label>
                <Textarea
                  id="delivery_instructions"
                  placeholder="e.g., Leave at front door, ring doorbell..."
                  value={formData.delivery_instructions}
                  onChange={(e) =>
                    updateField("delivery_instructions", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) =>
                    updateField("is_default", checked)
                  }
                />
                <Label htmlFor="is_default">Set as default address</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Add Address"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <MapPin className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {addr.label && (
                          <p className="font-medium text-sm">{addr.label}</p>
                        )}
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <Star className="size-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">
                        {addr.street}
                        {addr.apt ? `, ${addr.apt}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      {addr.delivery_instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {addr.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(addr)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleteId === addr.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deleteId === addr.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="size-12 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="mb-2">No addresses saved</CardTitle>
            <CardDescription className="mb-4">
              Add your first address to schedule a pickup.
            </CardDescription>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
