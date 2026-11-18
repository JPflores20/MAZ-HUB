/**
 * @fileoverview Visor modal a pantalla completa con zoom, arrastre y reinicio para imágenes de evidencia.
 */
import React from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";

interface PropiedadesVisorImagenZoom {
  /** URL segura de la imagen a previsualizar */
  url_imagen: string;
  /** Texto alternativo descriptivo */
  texto_alternativo?: string;
  /** Elemento trigger que abre el modal */
  children: React.ReactNode;
}

/**
 * Envuelve un trigger y despliega un visor modal interactivo de alta resolución al hacer clic.
 */
export const VisorImagenConZoom: React.FC<PropiedadesVisorImagenZoom> = ({
  url_imagen,
  texto_alternativo = "Imagen",
  children,
}) => {
  return (
    <Dialog>
      <>{children}</>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
        <DialogTitle className="sr-only">Ver imagen completa</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={10} centerZoomedOut>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-4 right-4 z-50 flex gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md border shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => zoomIn()}
                    title="Acercar"
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => zoomOut()}
                    title="Alejar"
                  >
                    <ZoomOut className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={() => resetTransform()}
                    title="Restablecer zoom"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </div>

                <TransformComponent wrapperClass="w-full h-screen !flex items-center justify-center cursor-move">
                  <img
                    src={url_imagen}
                    alt={texto_alternativo}
                    className="w-full h-full object-contain bg-white shadow-2xl"
                    style={{
                      willChange: "transform",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </DialogContent>
    </Dialog>
  );
};
