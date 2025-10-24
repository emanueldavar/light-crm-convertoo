import { ZodError } from 'zod';

export const isValidationError = (error) => error instanceof ZodError;

export const formatValidationError = (error) => {
  if (!isValidationError(error)) {
    return null;
  }

  const { fieldErrors, formErrors } = error.flatten();
  return {
    fieldErrors,
    formErrors
  };
};

export const respondValidationError = (res, error) => {
  const details = formatValidationError(error);
  return res.status(400).json({ message: 'Dados inválidos.', details });
};
