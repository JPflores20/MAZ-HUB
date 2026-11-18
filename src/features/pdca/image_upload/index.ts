/**
 * @fileoverview Barrel de exportación del módulo de carga de imágenes y evidencias PDCA.
 */
export { ImageUploadSection } from "./image_upload_section";
export { MultiImageUploadSection } from "./multi_image_upload_section";
export {
  ALL_ACCEPT_STRING,
  TIPOS_MIME_OFICINA,
  comprimir_imagen_para_subida,
  subir_archivo_a_firebase,
  detectar_tipo_de_archivo,
  es_archivo_valido,
} from "./upload_utils";
export type { PropiedadesImageUploadSection as ImageUploadSectionProps } from "./image_upload_section";
export type { PropiedadesMultiImageUploadSection as MultiImageUploadSectionProps } from "./multi_image_upload_section";
