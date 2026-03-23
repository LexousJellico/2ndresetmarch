import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import type { Service, ServiceTypeOption } from "@/types";

export type ServicePayload = {
  service_type_id: number | string | null;
  name: string;
  description: string;
  uom: string;
  price: number | string;
  quantity: number | string;
};

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  service?: Partial<Service> | null;
  serviceTypes: ServiceTypeOption[];
}

export default function ServiceFormModal({ open, onOpenChange, mode, service, serviceTypes }: ServiceFormModalProps) {
  const isEdit = mode === "edit";

  const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<ServicePayload>({
    service_type_id: "",
    name: "",
    description: "",
    uom: "",
    price: "",
    quantity: "",
  });

  // Hydrate form when editing
  useEffect(() => {
    if (isEdit && service) {
      setData({
        service_type_id: service.service_type_id ?? "",
        name: service.name ?? "",
        description: service.description ?? "",
        uom: service.uom ?? "",
        price: service.price ?? "",
        quantity: service.quantity ?? "",
      });
      clearErrors();
    } else if (!isEdit) {
      reset();
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, service, open]);

  function handleClose() {
    onOpenChange(false);
    // Don't reset immediately when closing edit so users don't lose values by accident
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Convert numeric fields for submission
    const applyTransform = () =>
      ({
        ...data,
        service_type_id: data.service_type_id === "" ? null : Number(data.service_type_id),
        price: data.price === "" ? "" : Number(data.price),
        quantity: data.quantity === "" ? "" : Number(data.quantity),
      });

    if (isEdit && service?.id) {
      transform(applyTransform);
      put(`/services/${service.id}`, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else {
      transform(applyTransform);
      post(`/services`, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit service" : "Create service"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the service details." : "Add a new service to your catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="service_type_id">Service Type</Label>
            <Select
              value={String(data.service_type_id ?? "")}
              onValueChange={(value) => setData("service_type_id", value)}
            >
              <SelectTrigger id="service_type_id" aria-invalid={!!errors.service_type_id}>
                <SelectValue placeholder="Select a type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(serviceTypes) && serviceTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_type_id && <p className="text-destructive text-sm">{errors.service_type_id}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="e.g., Event Photography"
              required
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              placeholder="Short description"
              required
            />
            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="uom">Unit of Measure</Label>
              <Input
                id="uom"
                value={data.uom}
                onChange={(e) => setData("uom", e.target.value)}
                placeholder="e.g., hour, item"
                required
              />
              {errors.uom && <p className="text-destructive text-sm">{errors.uom}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={data.price}
                onChange={(e) => setData("price", e.target.value)}
                placeholder="0.00"
                required
              />
              {errors.price && <p className="text-destructive text-sm">{errors.price}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                step="1"
                value={data.quantity}
                onChange={(e) => setData("quantity", e.target.value)}
                placeholder="0"
                required
              />
              {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
