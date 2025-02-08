import { Saldo } from "./Saldo"

export type Stand = {
    periodeStartDatum: string,
    peilDatum: string,
    openingsBalans: Saldo[],
    mutatiesOpDatum: Saldo[],
    balansOpDatum: Saldo[],
    resultaatOpDatum: Saldo[],
}
