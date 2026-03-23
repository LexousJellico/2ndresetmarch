import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from '@inertiajs/react'
import type { ServiceTypeEntity } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceType: ServiceTypeEntity | null
}

export default function DeleteServiceTypeDialog({ open, onOpenChange, serviceType }: Props) {
  const { delete: destroy, processing } = useForm()

  function onConfirm() {
    if (!serviceType) return
    destroy(`/service-types/${serviceType.id}`, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete service type</DialogTitle>
          <DialogDescription>
            This will permanently delete “{serviceType?.name}”. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={processing}>
            {processing ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
