import { Rekening } from "./Rekening";

export type Saldo = {
    id: number;
    rekening: Rekening;
    bedrag: number;
}