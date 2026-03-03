-- ============================================================================
-- LaundryLaz - Seed Data
-- Generates time_slots for the next 14 days
-- 4 windows per day, both pickup and delivery types = 8 rows per day
-- ============================================================================

INSERT INTO public.time_slots (date, start_time, end_time, slot_type, capacity)
SELECT
    d::date                         AS date,
    t.start_time                    AS start_time,
    t.end_time                      AS end_time,
    st.slot_type                    AS slot_type,
    5                               AS capacity
FROM generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '13 days',
    INTERVAL '1 day'
) AS d
CROSS JOIN (
    VALUES
        ('08:00'::time, '10:00'::time),
        ('10:00'::time, '12:00'::time),
        ('13:00'::time, '15:00'::time),
        ('15:00'::time, '17:00'::time)
) AS t(start_time, end_time)
CROSS JOIN (
    VALUES ('pickup'), ('delivery')
) AS st(slot_type)
ON CONFLICT (date, start_time, slot_type) DO NOTHING;
