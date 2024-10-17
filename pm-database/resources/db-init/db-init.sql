create table if not exists transactions
(
    id serial not null constraint transactions_pkey primary key,
    boekingsdatum date,
    tegenrekening TEXT,
    naam_tegenrekening TEXT,
    saldo_vooraf numeric(10,2),
    bedrag numeric(10,2),
    betalingskenmerk VARCHAR(16),
    omschrijving_bank TEXT,
    omschrijving TEXT,
    categorie VARCHAR(10),
    status VARCHAR(10)
);
