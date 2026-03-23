import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from '@inertiajs/react'
import type { Service } from '@/types'

interface DeleteServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
}

export default function DeleteServiceDialog({ open, onOpenChange, service }: DeleteServiceDialogProps) {
  const { delete: destroy, processing } = useForm()

  function onConfirm() {
    if (!service) return
    destroy(`/services/${service.id}`, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete service</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the service
            “{service?.name}”.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={processing}>
            {processing ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
