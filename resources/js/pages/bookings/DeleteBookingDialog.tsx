import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import type { Booking } from "@/types";

interface DeleteBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export default function DeleteBookingDialog({ open, onOpenChange, booking }: DeleteBookingDialogProps) {
  const { delete: destroy, processing } = useForm();

  const confirmDelete = () => {
    if (!booking?.id) return;
    destroy(`/bookings/${booking.id}`, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete booking</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the booking for “{booking?.client_name}”.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
            {processing ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
