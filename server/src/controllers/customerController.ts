import type { RequestHandler } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "../services/customerService.js";
import { customerListSchema } from "../validators/schemas.js";

// Controllers pass the tenant derived by middleware, never a client-supplied company ID.
export const listCustomersController: RequestHandler = async (
  request,
  response,
) => {
  const query = customerListSchema.parse(request.query);
  const result = await listCustomers(request.companyId!, query);
  response.json({ success: true, data: result.items, meta: result.meta });
};

export const getCustomerController: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  response.json({
    success: true,
    data: await getCustomer(request.companyId!, request.params.id!),
  });
};

export const createCustomerController: RequestHandler = async (
  request,
  response,
) => {
  const customer = await createCustomer(request.companyId!, request.body);
  response.status(201).json({ success: true, data: customer });
};

export const updateCustomerController: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const customer = await updateCustomer(
    request.companyId!,
    request.params.id!,
    request.body,
  );
  response.json({ success: true, data: customer });
};

export const deleteCustomerController: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  await deleteCustomer(request.companyId!, request.params.id!);
  response.json({ success: true, data: { deleted: true } });
};
