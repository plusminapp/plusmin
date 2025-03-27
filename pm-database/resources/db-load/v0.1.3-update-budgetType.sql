update rekening r set budget_type = 'VAST' where r.rekening_soort = 'INKOMSTEN';
update rekening r set budget_type = 'VAST' where r.rekening_soort = 'UITGAVEN';

update rekening r set budget_type = 'CONTINU' where r.naam = 'Boodschappen';
update rekening r set budget_type = 'CONTINU' where r.naam = 'Andere uitgave';