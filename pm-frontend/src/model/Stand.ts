import { Periode } from "./Periode"

export type Stand = {
    openingsBalans: Periode,
    mutatiesOpDatum: Periode,
    balansOpDatum: Periode,
    resultaatOpDatum: Periode
}
