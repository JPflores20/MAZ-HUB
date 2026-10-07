export const getPhaseTabColors = (id: string, isCurrent: boolean) => {
  if (isCurrent) {
    switch (id) {
      case "Resumen": return "bg-blue-600 text-white shadow-sm";
      case "Plan": return "bg-red-600 text-white shadow-sm";
      case "Do": return "bg-yellow-400 text-black shadow-sm";
      case "Check": return "bg-emerald-500 text-white shadow-sm";
      case "Act": return "bg-blue-600 text-white shadow-sm";
      case "Evaluacion": return "bg-indigo-900 text-white shadow-sm";
      default: return "bg-primary text-primary-foreground shadow-sm";
    }
  }
  switch (id) {
    case "Resumen": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
    case "Plan": return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
    case "Do": return "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30";
    case "Check": return "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20";
    case "Act": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
    case "Evaluacion": return "bg-indigo-900/10 text-indigo-900 hover:bg-indigo-900/20";
    default: return "hover:bg-background/80 text-muted-foreground";
  }
};

export const getPhaseCircleColors = (id: string, isCurrent: boolean, isCompleted: boolean) => {
  if (isCompleted) return "border-emerald-500 bg-emerald-500 text-white";
  if (isCurrent) {
    return id === "Do" ? "border-black/20 bg-black/10 text-black" : "border-white/20 bg-white/20 text-white";
  }
  switch (id) {
    case "Resumen": return "border-blue-200 bg-blue-100 text-blue-700";
    case "Plan": return "border-red-200 bg-red-100 text-red-700";
    case "Do": return "border-yellow-400/40 bg-yellow-200/50 text-yellow-800";
    case "Check": return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "Act": return "border-blue-200 bg-blue-100 text-blue-700";
    case "Evaluacion": return "border-indigo-200 bg-indigo-100 text-indigo-900";
    default: return "border-border bg-background";
  }
};

export const getPhaseSubText = (id: string, isCurrent: boolean) => {
  if (isCurrent) return id === "Do" ? "text-black/70" : "text-white/80";
  switch (id) {
    case "Resumen": return "text-blue-700/70";
    case "Plan": return "text-red-700/70";
    case "Do": return "text-yellow-800/70";
    case "Check": return "text-emerald-700/70";
    case "Act": return "text-blue-700/70";
    case "Evaluacion": return "text-indigo-900/70";
    default: return "text-muted-foreground/80";
  }
};

export const getPhaseToggleBorder = (id: string, isCurrent: boolean, isCompleted: boolean) => {
  if (isCompleted) return "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600";
  if (isCurrent) {
    return id === "Do" ? "border-black/30 text-black/40 hover:border-black hover:text-black"
                       : "border-white/40 text-white/50 hover:border-white hover:text-white";
  }
  switch (id) {
    case "Plan": return "border-red-500/30 text-red-500/30 hover:border-red-500 hover:text-red-500";
    case "Do": return "border-yellow-600/30 text-yellow-600/30 hover:border-yellow-600 hover:text-yellow-600";
    case "Check": return "border-emerald-500/30 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-500";
    case "Act": return "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500";
    case "Evaluacion": return "border-indigo-900/30 text-indigo-900/30 hover:border-indigo-900 hover:text-indigo-900";
    default: return "border-muted-foreground/30 text-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500";
  }
};
