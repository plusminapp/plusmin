export type Gebruiker = {
    id: number;
    email: string;
    bijnaam: string;
    roles: string[];
    vrijwilliger: string | undefined;
    vrijwilligerbijnaam: string | undefined;
}