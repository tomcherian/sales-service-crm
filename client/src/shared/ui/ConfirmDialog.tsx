import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{description}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button color="error" onClick={onConfirm} disabled={busy}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
