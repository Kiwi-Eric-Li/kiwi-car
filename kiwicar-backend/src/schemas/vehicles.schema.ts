import { z } from 'zod';

export const lookupVehicleSchema = z.object({
  params: z.object({
    plateNumber: z.string().regex(/^[A-Z0-9]{1,7}$/i).transform(v => v.toUpperCase()),
  }),
});
