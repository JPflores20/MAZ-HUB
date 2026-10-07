// ─── Tipos e Interfaces para Five Whys Interactive ──────────────────────────

export interface PropiedadesFiveWhysInteractivo {
  value?: any[];
  onChange?: (filas: any[]) => void;
  title?: string;
  onTitleChange?: (titulo: string) => void;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}

export interface PropiedadesBarraHerramientas {
  titulo?: string;
  alCambiarTitulo?: (t: string) => void;
  indice: number;
  esPantallaCompleta: boolean;
  alExpandir: () => void;
  cantidadPorques: number;
  alAgregarPorque: () => void;
  alQuitarPorque: () => void;
  alAgregarCausa: () => void;
  alEliminarTabla?: () => void;
}

export interface PropiedadesTablaCuerpo {
  filasNormalizadas: any[];
  cantidadPorques: number;
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alEliminarFila: (id: number) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}

export interface PropiedadesSeccionEvidencias {
  filasNormalizadas: any[];
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}
