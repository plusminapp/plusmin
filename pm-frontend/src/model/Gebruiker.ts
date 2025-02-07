import { BetalingsSoort } from "./Betaling";
import { Rekening } from "./Rekening";

export type Gebruiker = {
    id: number;
    email: string;
    bijnaam: string;
    periodeDag: number;
    roles: string[];
    vrijwilligerEmail: string | undefined;
    rekeningen: Rekening[];
    betalingsSoorten: BetalingsSoort[];
}