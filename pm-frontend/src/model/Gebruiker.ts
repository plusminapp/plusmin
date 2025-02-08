import { BetalingsSoort } from "./Betaling";
import { Periode } from "./Periode";
import { Rekening } from "./Rekening";

export type Gebruiker = {
    id: number;
    email: string;
    bijnaam: string;
    periodeDag: number;
    roles: string[];
    vrijwilligerEmail: string | undefined;
    rekeningen: Rekening[];
    periodes: Periode[];
    betalingsSoorten: BetalingsSoort[];
}