import { useMemo, useState } from "react";
import {
  Alert,
  Button,
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
  deactivateEmployee,
  listEmployees,
  saveEmployee,
} from "../api/resources";
import type { Employee, UserRole } from "../types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().optional(),
  phone: z.string().optional(),
  teamLead: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const labels: Record<UserRole, string> = {
  admin: "Admin",
  team_lead: "Team Lead",
  salesperson: "Salesperson",
  maintenance: "Maintenance Staff",
};

export function EmployeesPage({ role }: { role: Exclude<UserRole, "admin"> }) {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      teamLead: "",
    },
  });

  const query = useQuery({
    queryKey: ["employees", role, page, limit, search],
    queryFn: () => listEmployees({ role, page, limit, search }),
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const body: Record<string, unknown> = {
        ...values,
        role,
        ...(values.teamLead ? { teamLead: values.teamLead } : {}),
      };
      if (!values.password) delete body.password;
      if (!values.teamLead) delete body.teamLead;
      return saveEmployee(editing ? editing._id ?? editing.id : undefined, body);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["employees"] });
      closeForm();
    },
    onError: () =>
      setError("Could not save employee. Verify the email and form values."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["employees"] });
      setDeleting(null);
    },
    onError: () => setError("Could not deactivate employee."),
  });

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    form.reset({ name: "", email: "", password: "", phone: "", teamLead: "" });
  }

  function openForm(employee?: Employee) {
    setError("");
    setEditing(employee ?? null);
    setFormOpen(true);
    form.reset(
      employee
        ? {
            name: employee.name,
            email: employee.email,
            password: "",
            phone: employee.phone ?? "",
            teamLead:
              typeof employee.teamLead === "string"
                ? employee.teamLead
                : employee.teamLead?._id ?? "",
          }
        : { name: "", email: "", password: "", phone: "", teamLead: "" },
    );
  }

  const columns = useMemo(
    () => [
      { label: "Name", render: (row: Employee) => row.name },
      { label: "Email", render: (row: Employee) => row.email },
      { label: "Phone", render: (row: Employee) => row.phone ?? "—" },
      {
        label: "Status",
        render: (row: Employee) => (row.isActive ? "Active" : "Inactive"),
      },
      {
        label: "Actions",
        render: (row: Employee) => (
          <Stack direction="row">
            <Button onClick={() => openForm(row)}>Edit</Button>
            {row.isActive && (
              <Button color="error" onClick={() => setDeleting(row)}>
                Deactivate
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">{labels[role]}</Typography>
        <Button variant="contained" onClick={() => openForm()}>
          Add employee
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">Could not load employees.</Alert>
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
        getRowKey={(row) => row._id ?? row.id}
      />
      <FormDialog
        open={formOpen}
        title={editing ? "Edit employee" : "Add employee"}
        busy={mutation.isPending}
        onClose={closeForm}
        onSubmit={form.handleSubmit((values) => {
          if (!editing && !values.password) {
            form.setError("password", {
              type: "required",
              message: "A password is required when creating an employee",
            });
            return;
          }
          if (values.password && values.password.length < 12) {
            form.setError("password", {
              type: "minLength",
              message: "Password must be at least 12 characters",
            });
            return;
          }
          mutation.mutate(values);
        })}
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Name"
            {...form.register("name")}
            error={Boolean(form.formState.errors.name)}
            helperText={form.formState.errors.name?.message}
          />
          <TextField
            label="Email"
            type="email"
            {...form.register("email")}
            error={Boolean(form.formState.errors.email)}
            helperText={form.formState.errors.email?.message}
          />
          <TextField
            label={
              editing
                ? "New password (leave blank to keep current)"
                : "Password (minimum 12 characters)"
            }
            type="password"
            {...form.register("password")}
            error={Boolean(form.formState.errors.password)}
            helperText={form.formState.errors.password?.message ?? (editing ? "Leave blank to keep the current password." : "At least 12 characters.")}
          />
          <TextField label="Phone" {...form.register("phone")} />
          {role === "salesperson" && (
            <TextField
              label="Team lead ID (optional)"
              {...form.register("teamLead")}
            />
          )}
        </Stack>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Deactivate employee?"
        description={`Deactivate ${deleting?.name ?? "this employee"}? They will no longer be able to sign in.`}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting && deleteMutation.mutate(deleting._id ?? deleting.id)
        }
      />
    </Stack>
  );
}
