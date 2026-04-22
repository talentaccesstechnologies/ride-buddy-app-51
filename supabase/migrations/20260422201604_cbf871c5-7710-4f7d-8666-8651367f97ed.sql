-- ── 1. Table des incidents chauffeur ────────────────────────
CREATE TABLE IF NOT EXISTS public.van_driver_incidents (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  slot_id         UUID REFERENCES public.van_slots(id),
  booking_id      UUID REFERENCES public.van_bookings(id),
  reported_by     UUID REFERENCES public.profiles(id),
  reporter_role   TEXT CHECK (reporter_role IN ('rider','driver','admin','system')),
  tier            INTEGER NOT NULL CHECK (tier IN (1,2,3)),
  category        TEXT NOT NULL CHECK (category IN (
    'subcontracting','cash_payment','data_breach','solicitation','aggression',
    'late_10min','dirty_vehicle','no_charger','loud_music','luggage_refusal',
    'late_5min','dress_code','rough_driving'
  )),
  description     TEXT,
  commission_impact NUMERIC(10,2) DEFAULT 0,
  fine_amount     NUMERIC(10,2) DEFAULT 0,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','dismissed','appealed')),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_driver ON public.van_driver_incidents(driver_id, created_at);

-- ── 2. Table checklist pré-départ ───────────────────────────
CREATE TABLE IF NOT EXISTS public.van_predeparture_checks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  slot_id         UUID NOT NULL REFERENCES public.van_slots(id),
  checked_at      TIMESTAMPTZ DEFAULT now(),
  no_warning_lights     BOOLEAN DEFAULT false,
  ac_working            BOOLEAN DEFAULT false,
  fuel_full             BOOLEAN DEFAULT false,
  tires_ok              BOOLEAN DEFAULT false,
  vehicle_clean_ext     BOOLEAN DEFAULT false,
  vehicle_clean_int     BOOLEAN DEFAULT false,
  no_personal_items     BOOLEAN DEFAULT false,
  water_bottles         BOOLEAN DEFAULT false,
  chargers_usb_c        BOOLEAN DEFAULT false,
  chargers_lightning    BOOLEAN DEFAULT false,
  dress_code_ok         BOOLEAN DEFAULT false,
  all_passed            BOOLEAN GENERATED ALWAYS AS (
    no_warning_lights AND ac_working AND fuel_full AND tires_ok AND
    vehicle_clean_ext AND vehicle_clean_int AND no_personal_items AND
    water_bottles AND chargers_usb_c AND chargers_lightning AND dress_code_ok
  ) STORED,
  failed_items          TEXT[],
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checks_driver ON public.van_predeparture_checks(driver_id, slot_id);

-- ── 3. Table score mensuel enrichi ──────────────────────────
CREATE TABLE IF NOT EXISTS public.van_driver_scores (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id           UUID NOT NULL REFERENCES public.profiles(id),
  month               TEXT NOT NULL,
  tier1_count         INTEGER DEFAULT 0,
  tier2_count         INTEGER DEFAULT 0,
  tier3_count         INTEGER DEFAULT 0,
  checks_done         INTEGER DEFAULT 0,
  checks_total        INTEGER DEFAULT 0,
  check_rate          NUMERIC(5,2) DEFAULT 100,
  punctuality_rate    NUMERIC(5,2) DEFAULT 100,
  avg_rating          NUMERIC(3,2) DEFAULT 5.0,
  total_ratings       INTEGER DEFAULT 0,
  composite_score     NUMERIC(5,2) DEFAULT 100,
  level               TEXT DEFAULT 'gold'
                      CHECK (level IN ('gold','silver','bronze','suspended')),
  base_commission_rate    NUMERIC(5,4) DEFAULT 0.20,
  effective_commission_rate NUMERIC(5,4) DEFAULT 0.20,
  commission_penalty      NUMERIC(5,4) DEFAULT 0,
  bonus_amount        NUMERIC(10,2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, month)
);

CREATE INDEX IF NOT EXISTS idx_scores_driver ON public.van_driver_scores(driver_id, month);

-- ── 4. Fonction : calculer le score mensuel ─────────────────
CREATE OR REPLACE FUNCTION public.compute_driver_score(
  p_driver_id UUID,
  p_month     TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM')
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier1       INTEGER := 0;
  v_tier2       INTEGER := 0;
  v_tier3       INTEGER := 0;
  v_checks_done INTEGER := 0;
  v_checks_tot  INTEGER := 0;
  v_check_rate  NUMERIC := 100;
  v_punct_rate  NUMERIC := 100;
  v_avg_rating  NUMERIC := 5.0;
  v_ratings_count INTEGER := 0;
  v_score       NUMERIC := 100;
  v_level       TEXT := 'gold';
  v_base_comm   NUMERIC := 0.20;
  v_penalty     NUMERIC := 0;
  v_eff_comm    NUMERIC;
  v_bonus       NUMERIC := 0;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE tier = 1 AND status = 'confirmed'),
    COUNT(*) FILTER (WHERE tier = 2 AND status = 'confirmed'),
    COUNT(*) FILTER (WHERE tier = 3 AND status = 'confirmed')
  INTO v_tier1, v_tier2, v_tier3
  FROM public.van_driver_incidents
  WHERE driver_id = p_driver_id
    AND TO_CHAR(created_at, 'YYYY-MM') = p_month;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE all_passed)
  INTO v_checks_tot, v_checks_done
  FROM public.van_predeparture_checks
  WHERE driver_id = p_driver_id
    AND TO_CHAR(created_at, 'YYYY-MM') = p_month;

  IF v_checks_tot > 0 THEN
    v_check_rate := ROUND(v_checks_done::NUMERIC / v_checks_tot * 100, 2);
  END IF;

  SELECT COALESCE(
    ROUND(
      COUNT(*) FILTER (WHERE is_punctual) * 100.0 / NULLIF(COUNT(*), 0),
      2
    ), 100
  ) INTO v_punct_rate
  FROM public.van_driver_missions
  WHERE driver_id = p_driver_id
    AND status = 'completed'
    AND TO_CHAR(completed_at, 'YYYY-MM') = p_month;

  SELECT
    COALESCE(ROUND(AVG(overall_score)::NUMERIC, 2), 5.0),
    COUNT(*)
  INTO v_avg_rating, v_ratings_count
  FROM public.trip_ratings
  WHERE ratee_id = p_driver_id
    AND rater_role = 'rider'
    AND TO_CHAR(created_at, 'YYYY-MM') = p_month;

  v_score := 100
    - (v_tier1 * 40)
    - (v_tier2 * 10)
    - (v_tier3 * 3)
    + ((v_check_rate - 100) * 0.1)
    + ((v_punct_rate - 100) * 0.2)
    + ((v_avg_rating - 5) * 5);

  v_score := GREATEST(0, LEAST(100, v_score));

  IF v_tier1 > 0 THEN
    v_level := 'suspended';
    v_penalty := 0.10;
  ELSIF v_score >= 85 THEN
    v_level := 'gold';
    v_penalty := 0;
    v_bonus := CASE WHEN v_score >= 95 THEN 50 ELSE 0 END;
  ELSIF v_score >= 70 THEN
    v_level := 'silver';
    v_penalty := 0.02;
  ELSE
    v_level := 'bronze';
    v_penalty := 0.05;
  END IF;

  v_eff_comm := LEAST(0.35, v_base_comm + v_penalty);

  INSERT INTO public.van_driver_scores (
    driver_id, month,
    tier1_count, tier2_count, tier3_count,
    checks_done, checks_total, check_rate,
    punctuality_rate, avg_rating, total_ratings,
    composite_score, level,
    base_commission_rate, effective_commission_rate,
    commission_penalty, bonus_amount
  ) VALUES (
    p_driver_id, p_month,
    v_tier1, v_tier2, v_tier3,
    v_checks_done, v_checks_tot, v_check_rate,
    v_punct_rate, v_avg_rating, v_ratings_count,
    v_score, v_level,
    v_base_comm, v_eff_comm,
    v_penalty, v_bonus
  )
  ON CONFLICT (driver_id, month) DO UPDATE SET
    tier1_count = EXCLUDED.tier1_count,
    tier2_count = EXCLUDED.tier2_count,
    tier3_count = EXCLUDED.tier3_count,
    checks_done = EXCLUDED.checks_done,
    checks_total = EXCLUDED.checks_total,
    check_rate = EXCLUDED.check_rate,
    punctuality_rate = EXCLUDED.punctuality_rate,
    avg_rating = EXCLUDED.avg_rating,
    total_ratings = EXCLUDED.total_ratings,
    composite_score = EXCLUDED.composite_score,
    level = EXCLUDED.level,
    effective_commission_rate = EXCLUDED.effective_commission_rate,
    commission_penalty = EXCLUDED.commission_penalty,
    bonus_amount = EXCLUDED.bonus_amount,
    updated_at = now();

  RETURN jsonb_build_object(
    'driver_id', p_driver_id,
    'month', p_month,
    'score', v_score,
    'level', v_level,
    'tier1_count', v_tier1,
    'tier2_count', v_tier2,
    'tier3_count', v_tier3,
    'check_rate', v_check_rate,
    'punctuality_rate', v_punct_rate,
    'avg_rating', v_avg_rating,
    'effective_commission', v_eff_comm,
    'penalty', v_penalty,
    'bonus', v_bonus
  );
END;
$$;

-- ── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE public.van_driver_incidents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.van_predeparture_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.van_driver_scores       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_driver_read" ON public.van_driver_incidents
  FOR SELECT USING (auth.uid() = driver_id OR auth.uid() = reported_by);

CREATE POLICY "incidents_write_auth" ON public.van_driver_incidents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "checks_own" ON public.van_predeparture_checks
  FOR ALL USING (auth.uid() = driver_id);

CREATE POLICY "scores_own" ON public.van_driver_scores
  FOR SELECT USING (auth.uid() = driver_id);