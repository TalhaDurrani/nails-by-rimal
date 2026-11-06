BEGIN;
CREATE TABLE IF NOT EXISTS public.action_rate_limits (
  scope text NOT NULL,
  client_key text NOT NULL,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0),
  PRIMARY KEY (scope, client_key)
);
ALTER TABLE public.action_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.action_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_action_limit(p_scope text, p_client_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  max_attempts integer;
  current_attempts integer;
BEGIN
  max_attempts := CASE p_scope WHEN 'tracking' THEN 30 WHEN 'newsletter' THEN 5
    WHEN 'contact' THEN 5 WHEN 'recovery' THEN 3 ELSE NULL END;
  IF max_attempts IS NULL OR p_client_key !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid rate limit request';
  END IF;
  DELETE FROM public.action_rate_limits WHERE (scope,client_key) IN (
    SELECT scope,client_key FROM public.action_rate_limits
    WHERE window_start < now() - interval '1 day' LIMIT 100
  );
  INSERT INTO public.action_rate_limits AS limits (scope,client_key,window_start,attempts)
  VALUES (p_scope,p_client_key,now(),1)
  ON CONFLICT (scope,client_key) DO UPDATE SET
    attempts = CASE WHEN limits.window_start <= now() - interval '15 minutes'
      THEN 1 ELSE LEAST(limits.attempts + 1,max_attempts + 1) END,
    window_start = CASE WHEN limits.window_start <= now() - interval '15 minutes'
      THEN now() ELSE limits.window_start END
  RETURNING attempts INTO current_attempts;
  RETURN current_attempts <= max_attempts;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_action_limit(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_action_limit(text,text) TO service_role;
COMMIT;
