update betaling t set categorie = 'vast', status = 'gesloten' where lower(t.naam_tegenrekening) like '%odido%' or lower(t.naam_tegenrekening) like '%asr z%' or lower(t.naam_tegenrekening) like '%asr s%';
update betaling t set categorie = 'wonen', status = 'gesloten' where lower(t.naam_tegenrekening) like '%greenchoice%' or lower(t.naam_tegenrekening) like 'vve boxbergerweg 109 f1' or lower(t.naam_tegenrekening) like '%asr levverz%';
update betaling t set categorie = 'boodsch.', status = 'gesloten' where lower(t.omschrijving_bank) like '%jumbo%' or lower(t.omschrijving_bank) like '%albert%';


