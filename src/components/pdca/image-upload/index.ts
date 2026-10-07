/**
 * Barrel de re-exportaciones del módulo image-upload.
 * Mantiene retrocompatibilidad con imports existentes de image-upload-section.
 */
export { ImageUploadSection } from "./image-upload-section";
export { MultiImageUploadSection } from "./multi-image-upload-section";
export { ALL_ACCEPT_STRING } from "./utils/upload-utils";
export type { PropiedadesImageUploadSection as ImageUploadSectionProps } from "./image-upload-section";
export type { PropiedadesMultiImageUploadSection as MultiImageUploadSectionProps } from "./multi-image-upload-section";
