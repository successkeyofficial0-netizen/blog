import { Spinner } from './Feedback'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <Spinner size={15} />}
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="modal-copy">{message}</p>
    </Modal>
  )
}
