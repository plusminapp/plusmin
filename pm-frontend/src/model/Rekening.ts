import { Gebruiker } from "./Gebruiker";

export type Rekening = {
    id: number;
    gebruiker: Gebruiker;
    type: string;
    nummer: string | undefined;
    naam: string;
    afkorting: string;
}