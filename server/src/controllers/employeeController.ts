import type { RequestHandler } from "express";
import {
  createEmployee,
  deactivateEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from "../services/employeeService.js";
import { employeeListSchema } from "../validators/schemas.js";

type EmployeeIdParams = { id: string };

// Controllers keep transport concerns separate from tenant-scoped service logic.
export const listEmployeesController: RequestHandler = async (
  request,
  response,
) => {
  const query = employeeListSchema.parse(request.query);
  const result = await listEmployees(request.companyId!, query);
  response.json({ success: true, data: result.items, meta: result.meta });
};

export const getEmployeeController: RequestHandler<EmployeeIdParams> = async (
  request,
  response,
) => {
  response.json({
    success: true,
    data: await getEmployee(request.companyId!, request.params.id!),
  });
};

export const createEmployeeController: RequestHandler = async (
  request,
  response,
) => {
  const employee = await createEmployee(request.companyId!, request.body);
  response.status(201).json({ success: true, data: employee });
};

export const updateEmployeeController: RequestHandler<EmployeeIdParams> = async (
  request,
  response,
) => {
  const employee = await updateEmployee(
    request.companyId!,
    request.params.id!,
    request.body,
  );
  response.json({ success: true, data: employee });
};

export const deactivateEmployeeController: RequestHandler<
  EmployeeIdParams
> = async (
  request,
  response,
) => {
  const employee = await deactivateEmployee(
    request.companyId!,
    request.params.id!,
    request.auth!.userId,
  );
  response.json({ success: true, data: employee });
};
