import { Paper, Typography } from "@mui/material";

export function DashboardPage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Analytics are planned for a later phase. Use the navigation to manage
        employees and customers.
      </Typography>
    </Paper>
  );
}
