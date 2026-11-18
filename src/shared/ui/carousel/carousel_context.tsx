/**
 * carousel_context.tsx
 * Proveedor de contexto, hook `useCarousel` y contenedor raíz para carruseles basados en Embla.
 */
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { cn } from "@/shared/utils/class_names";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

/**
 * Accede al estado y acciones del carrusel activo. Debe usarse dentro de `<Carousel>`.
 *
 * @returns Contexto activo de navegación del carrusel.
 */
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [can_scroll_prev, set_can_scroll_prev] = React.useState(false);
  const [can_scroll_next, set_can_scroll_next] = React.useState(false);

  const on_select = React.useCallback((embla_api: CarouselApi) => {
    if (!embla_api) return;
    set_can_scroll_prev(embla_api.canScrollPrev());
    set_can_scroll_next(embla_api.canScrollNext());
  }, []);

  const scroll_prev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scroll_next = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handle_key_down = React.useCallback(
    (keyboard_event: React.KeyboardEvent<HTMLDivElement>) => {
      if (keyboard_event.key === "ArrowLeft") {
        keyboard_event.preventDefault();
        scroll_prev();
      } else if (keyboard_event.key === "ArrowRight") {
        keyboard_event.preventDefault();
        scroll_next();
      }
    },
    [scroll_prev, scroll_next],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    on_select(api);
    api.on("reInit", on_select);
    api.on("select", on_select);

    return () => {
      api?.off("select", on_select);
    };
  }, [api, on_select]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev: scroll_prev,
        scrollNext: scroll_next,
        canScrollPrev: can_scroll_prev,
        canScrollNext: can_scroll_next,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handle_key_down}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

export { type CarouselApi, Carousel, useCarousel };
