CREATE TABLE IF NOT EXISTS public.transactie (
	id int8 NOT NULL,
	referentie varchar NOT NULL,
	bedrag numeric(38, 2) NULL,
	betalingskenmerk varchar(255) NULL,
	boekingsdatum date NULL,
	categorie varchar(255) NULL,
	naam_tegenrekening varchar(255) NULL,
	omschrijving varchar(255) NULL,
	omschrijving_bank varchar(255) NULL,
	saldo_vooraf numeric(38, 2) NULL,
	status varchar(255) NULL,
	tegenrekening varchar(255) NULL,
	CONSTRAINT transactie_pkey PRIMARY KEY (id),
	CONSTRAINT transactie_unique UNIQUE (referentie)
);