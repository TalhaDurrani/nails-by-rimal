-- Run in the Supabase SQL editor. Test effects are rolled back.
BEGIN;
DO $$
DECLARE n integer; allowed boolean;
BEGIN
  FOR n IN 1..6 LOOP
    allowed := public.consume_action_limit('newsletter', repeat('a',64));
    IF allowed IS DISTINCT FROM (n <= 5) THEN
      RAISE EXCEPTION 'Rate limiter failed at attempt %', n;
    END IF;
  END LOOP;
  IF has_function_privilege('anon','public.consume_action_limit(text,text)','execute')
    OR has_function_privilege('authenticated','public.consume_action_limit(text,text)','execute') THEN
    RAISE EXCEPTION 'Public clients can execute the limiter';
  END IF;
END;
$$;
ROLLBACK;
