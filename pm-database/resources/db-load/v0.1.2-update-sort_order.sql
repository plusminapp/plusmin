DO $$
DECLARE
    r RECORD;
    current_boekingsdatum TEXT := '';
    sort_order_value INT := 900;
BEGIN
    FOR r IN
        SELECT id, boekingsdatum
        FROM betaling
        ORDER BY boekingsdatum, id
    LOOP
        IF current_boekingsdatum = TO_CHAR(r.boekingsdatum, 'YYYYMMDD') THEN
            sort_order_value := sort_order_value - 10;
        ELSE
            current_boekingsdatum := TO_CHAR(r.boekingsdatum, 'YYYYMMDD');
            sort_order_value := 900;
        END IF;

        UPDATE betaling
        SET sort_order = current_boekingsdatum || '.' || sort_order_value
        WHERE id = r.id;
    END LOOP;
END $$;