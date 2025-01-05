import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { Rekening, RekeningPaar } from '../model/Rekening';
import { BetalingsSoort } from '../model/Betaling';

interface CustomContextType {
    gebruiker: Gebruiker | undefined;
    setGebruiker: (gebruiker: Gebruiker | undefined) => void;
    actieveHulpvrager: Gebruiker | undefined;
    setActieveHulpvrager: (actieveHulpvrager: Gebruiker | undefined) => void;
    hulpvragers: Array<Gebruiker>;
    setHulpvragers: (hulpvragers: Array<Gebruiker>) => void;
    rekeningen: Array<Rekening>;
    setRekeningen: (rekeningen: Array<Rekening>) => void;
    betalingsSoorten: Array<BetalingsSoort>;
    setBetalingsSoorten: (betalingsSoorten: Array<BetalingsSoort>) => void;
    betaalMethoden: Array<Rekening>;
    setBetaalMethoden: (betaalMethoden: Array<Rekening>) => void;
    betalingsSoorten2Rekeningen: Map<BetalingsSoort, RekeningPaar>;
    setBetalingsSoorten2Rekeningen: (betalingsSoorten2Rekeningen: Map<BetalingsSoort, RekeningPaar>) => void;
}

const CustomContext = createContext<CustomContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomContext = (): CustomContextType => {
    const context = useContext(CustomContext);
    if (!context) {
        throw new Error('useCustomContext must be used within a CustomProvider');
    }
    return context;
};

interface CustomProviderProps {
    children: ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
    const [gebruiker, setGebruiker] = useState<Gebruiker | undefined>(undefined);
    const [actieveHulpvrager, setActieveHulpvrager] = useState<Gebruiker | undefined>(undefined);
    const [hulpvragers, setHulpvragers] = useState<Array<Gebruiker>>([]);
    const [rekeningen, setRekeningen] = useState<Array<Rekening>>([]);
    const [betalingsSoorten, setBetalingsSoorten] = useState<Array<BetalingsSoort>>([]);
    const [betaalMethoden, setBetaalMethoden] = useState<Array<Rekening>>([]);
    const [betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen] = useState<Map<BetalingsSoort, RekeningPaar>>(new Map())

    return (
        <CustomContext.Provider value={{
            gebruiker, setGebruiker,
            actieveHulpvrager, setActieveHulpvrager,
            hulpvragers, setHulpvragers,
            rekeningen, setRekeningen,
            betalingsSoorten, setBetalingsSoorten,
            betaalMethoden, setBetaalMethoden,
            betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen}}>
            {children}
        </CustomContext.Provider>
    );
};
