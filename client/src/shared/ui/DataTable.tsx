import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

export interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  page: number;
  limit: number;
  total: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (value: string) => void;
  getRowKey: (row: T) => string;
}

export function DataTable<T>({
  rows,
  columns,
  page,
  limit,
  total,
  search,
  onPageChange,
  onLimitChange,
  onSearchChange,
  getRowKey,
}: Props<T>) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{ maxWidth: 360 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.label}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.label}>{column.render(row)}</TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography color="text.secondary">
                    No records found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, next) => onPageChange(next + 1)}
          onRowsPerPageChange={(event) =>
            onLimitChange(Number(event.target.value))
          }
        />
      </TableContainer>
    </Stack>
  );
}
