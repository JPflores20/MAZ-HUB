/**
 * form_context.tsx
 * Proveedores de contexto, enlace `FormField` y hook `useFormField` para formularios `react-hook-form`.
 */
import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type FormItemContextValue = {
  id: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);
const FormItemContext = React.createContext<FormItemContextValue | null>(null);

/**
 * Conecta un controlador de `react-hook-form` con su contexto de metadatos de accesibilidad.
 *
 * @param props - Propiedades de `Controller` de `react-hook-form`.
 * @returns Campo controlado envuelto en `FormFieldContext`.
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

/**
 * Obtiene el estado de validación y los identificadores ARIA del campo de formulario activo.
 *
 * @returns Metadatos ARIA y estado del campo registrado en `react-hook-form`.
 */
const useFormField = () => {
  const field_context = React.useContext(FormFieldContext);
  const item_context = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!field_context) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!item_context) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const field_state = getFieldState(field_context.name, formState);
  const { id: item_id } = item_context;

  return {
    id: item_id,
    name: field_context.name,
    formItemId: `${item_id}-form-item`,
    formDescriptionId: `${item_id}-form-item-description`,
    formMessageId: `${item_id}-form-item-message`,
    ...field_state,
  };
};

export { Form, FormField, FormItemContext, useFormField };
