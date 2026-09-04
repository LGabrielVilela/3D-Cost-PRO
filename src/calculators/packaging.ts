import { sumCentavos } from "@/lib/money";

export interface PackagingParams {
  embalagemCentavos: number;
  etiquetaCentavos: number;
  adesivoCentavos: number;
  protecaoCentavos: number;
  outrosCentavos: number;
}

/** Custo de embalagem: soma simples dos itens (caixa, etiqueta, adesivo, proteção, outros). */
export function calculatePackagingCost(params: PackagingParams): number {
  return sumCentavos(
    params.embalagemCentavos,
    params.etiquetaCentavos,
    params.adesivoCentavos,
    params.protecaoCentavos,
    params.outrosCentavos,
  );
}
