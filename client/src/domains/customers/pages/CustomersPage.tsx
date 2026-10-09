import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "../components/DataTable";
import { FormDialog } from "../components/FormDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  deleteCustomer,
  listEmployees,
  listCustomers,
  saveCustomer,
} from "../api/resources";
import type { Customer } from "../types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  type: z.enum(["retail", "wholesale"]),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  assignedSalesperson: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  name: "",
  type: "retail",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  assignedSalesperson: "",
  notes: "",
};

function recordId(record: Customer): string {
  return record._id ?? record.id ?? "";
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const query = useQuery({
    queryKey: ["customers", page, limit, search],
    queryFn: () => listCustomers({ page, limit, search }),
  });
  const salespeopleQuery = useQuery({
    queryKey: ["salespeople", "customer-form"],
    queryFn: () =>
      listEmployees({
        role: "salesperson",
        page: 1,
        limit: 100,
        search: "",
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      saveCustomer(editing ? recordId(editing) : undefined, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeForm();
    },
    onError: () => setError("Could not save customer. Check the form values and try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: (customer: Customer) => deleteCustomer(recordId(customer)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleting(null);
    },
    onError: () => setError("Could not delete customer. Please try again."),
  });

  function openForm(customer?: Customer) {
    setError("");
    setEditing(customer ?? null);
    setFormOpen(true);
    form.reset(
      customer
        ? {
            name: customer.name,
            type: customer.type,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            country: customer.country ?? "",
            city: customer.city ?? "",
            address: customer.address ?? "",
            assignedSalesperson:
              typeof customer.assignedSalesperson === "string"
                ? customer.assignedSalesperson
                : customer.assignedSalesperson?._id ?? "",
            notes: customer.notes ?? "",
          }
        : emptyValues,
    );
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    form.reset(emptyValues);
  }

  const columns = useMemo(
    () => [
      { label: "Name", render: (customer: Customer) => customer.name },
      {
        label: "Type",
        render: (customer: Customer) =>
          customer.type === "retail" ? "Retail" : "Wholesale",
      },
      { label: "Email", render: (customer: Customer) => customer.email || "—" },
      { label: "Phone", render: (customer: Customer) => customer.phone || "—" },
      { label: "City", render: (customer: Customer) => customer.city || "—" },
      {
        label: "Actions",
        render: (customer: Customer) => (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => openForm(customer)}>Edit</Button>
            <Button color="error" onClick={() => setDeleting(customer)}>
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" onClick={() => openForm()}>
          Add customer
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">Could not load customers. Please try again.</Alert>
      )}

      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        page={page}
        limit={limit}
        total={query.data?.meta.total ?? 0}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        getRowKey={recordId}
      />

      <FormDialog
        open={formOpen}
        title={editing ? "Edit customer" : "Add customer"}
        busy={saveMutation.isPending}
        onClose={closeForm}
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Name"
            required
            {...form.register("name")}
            error={Boolean(form.formState.errors.name)}
            helperText={form.formState.errors.name?.message}
          />
          <TextField
            label="Type"
            select
            required
            {...form.register("type")}
            error={Boolean(form.formState.errors.type)}
            helperText={form.formState.errors.type?.message}
          >
            <MenuItem value="retail">Retail</MenuItem>
            <MenuItem value="wholesale">Wholesale</MenuItem>
          </TextField>
          <TextField
            label="Email"
            type="email"
            {...form.register("email")}
            error={Boolean(form.formState.errors.email)}
            helperText={form.formState.errors.email?.message}
          />
          <TextField label="Phone" {...form.register("phone")} />
          <TextField label="Country" {...form.register("country")} />
          <TextField label="City" {...form.register("city")} />
          <TextField
            label="Address"
            multiline
            minRows={2}
            {...form.register("address")}
          />
          <TextField
            label="Assigned salesperson"
            select
            {...form.register("assignedSalesperson")}
            error={Boolean(form.formState.errors.assignedSalesperson)}
            helperText={form.formState.errors.assignedSalesperson?.message}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {salespeopleQuery.data?.items.map((salesperson) => (
              <MenuItem key={salesperson._id} value={salesperson._id}>
                {salesperson.name} ({salesperson.email})
              </MenuItem>
            ))}
          </TextField>
          {salespeopleQuery.isError && (
            <Alert severity="warning">
              Could not load salesperson choices. You can still save without an assignment.
            </Alert>
          )}
          <TextField
            label="Notes"
            multiline
            minRows={2}
            {...form.register("notes")}
          />
        </Stack>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete customer?"
        description={`Delete ${deleting?.name ?? "this customer"}? This cannot be undone.`}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </Stack>
  );
}
