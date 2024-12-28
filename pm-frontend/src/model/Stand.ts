import { RekeningSaldi } from "./Saldi"

export type Stand = {
    openingsBalans: RekeningSaldi,
    mutatiesOpDatum: RekeningSaldi,
    balansOpDatum: RekeningSaldi,
    resultaatOpDatum: RekeningSaldi
}
