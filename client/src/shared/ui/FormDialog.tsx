import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function FormDialog({
  open,
  title,
  busy,
  onClose,
  onSubmit,
  children,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={busy}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
