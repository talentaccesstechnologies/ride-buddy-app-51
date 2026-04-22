-- ── 1. Champs no-show dans van_bookings ─────────────────────
ALTER TABLE public.van_bookings
  ADD COLUMN IF NOT EXISTS no_show_declared_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_declared_by   UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS no_show_grace_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_compensation  NUMERIC(10,2) DEFAULT 0;

-- ── 2. Compteur no-shows dans profiles ──────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS no_show_count     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS no_show_warned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_suspended      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_until   TIMESTAMPTZ;

-- ── 3. Table no_show_log ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.van_no_show_log (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id        UUID NOT NULL REFERENCES public.van_bookings(id),
  slot_id           UUID NOT NULL REFERENCES public.van_slots(id),
  rider_id          UUID NOT NULL REFERENCES public.profiles(id),
  driver_id         UUID REFERENCES public.profiles(id),
  declared_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  grace_expired_at  TIMESTAMPTZ NOT NULL,
  seat_price        NUMERIC(10,2) NOT NULL,
  compensation_pct  INTEGER NOT NULL DEFAULT 60,
  compensation_amt  NUMERIC(10,2) NOT NULL,
  seat_relisted     BOOLEAN DEFAULT false,
  seat_resold       BOOLEAN DEFAULT false,
  resold_price      NUMERIC(10,2),
  rider_warning_nb  INTEGER NOT NULL DEFAULT 1,
  action_taken      TEXT CHECK (action_taken IN ('warned','suspended','none')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_no_show_rider ON public.van_no_show_log(rider_id);
CREATE INDEX IF NOT EXISTS idx_no_show_slot ON public.van_no_show_log(slot_id);

-- ── 4. Fonction : déclarer un no-show ───────────────────────
CREATE OR REPLACE FUNCTION public.declare_van_no_show(
  p_booking_id UUID,
  p_driver_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking       public.van_bookings%ROWTYPE;
  v_slot          public.van_slots%ROWTYPE;
  v_rider         public.profiles%ROWTYPE;
  v_grace_min     INTEGER := 10;
  v_comp_pct      INTEGER := 60;
  v_comp_amt      NUMERIC(10,2);
  v_new_count     INTEGER;
  v_action        TEXT := 'none';
  v_result        JSONB;
BEGIN
  SELECT * INTO v_booking FROM public.van_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Réservation introuvable'); END IF;
  IF v_booking.status != 'confirmed' THEN RETURN jsonb_build_object('error', 'Statut invalide: ' || v_booking.status); END IF;

  SELECT * INTO v_slot FROM public.van_slots WHERE id = v_booking.slot_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Créneau introuvable'); END IF;

  IF v_slot.departure_time > now() + INTERVAL '10 minutes' THEN
    RETURN jsonb_build_object('error', 'Trop tôt pour déclarer un no-show', 'available_at', v_slot.departure_time - INTERVAL '10 minutes');
  END IF;

  SELECT * INTO v_rider FROM public.profiles WHERE id = v_booking.rider_id;

  v_comp_amt := ROUND(v_booking.price_paid * v_comp_pct / 100.0, 2);

  UPDATE public.van_bookings SET
    status = 'no_show',
    no_show_declared_at = now(),
    no_show_declared_by = p_driver_id,
    no_show_grace_expires = v_slot.departure_time + (v_grace_min || ' minutes')::INTERVAL,
    no_show_compensation = v_comp_amt,
    refund_amount = 0,
    payment_status = 'paid'
  WHERE id = p_booking_id;

  UPDATE public.van_slots SET
    seats_sold = GREATEST(0, seats_sold - 1),
    status = 'open'
  WHERE id = v_booking.slot_id;

  UPDATE public.profiles SET
    no_show_count = COALESCE(no_show_count, 0) + 1
  WHERE id = v_booking.rider_id
  RETURNING no_show_count INTO v_new_count;

  IF v_new_count = 2 THEN
    UPDATE public.profiles SET no_show_warned_at = now() WHERE id = v_booking.rider_id;
    v_action := 'warned';
  ELSIF v_new_count >= 3 THEN
    UPDATE public.profiles SET
      is_suspended = true,
      suspended_until = now() + INTERVAL '30 days'
    WHERE id = v_booking.rider_id;
    v_action := 'suspended';
  END IF;

  INSERT INTO public.van_no_show_log (
    booking_id, slot_id, rider_id, driver_id,
    grace_expired_at, seat_price,
    compensation_pct, compensation_amt,
    seat_relisted, rider_warning_nb, action_taken
  ) VALUES (
    p_booking_id, v_booking.slot_id, v_booking.rider_id, p_driver_id,
    v_slot.departure_time + (v_grace_min || ' minutes')::INTERVAL,
    v_booking.price_paid, v_comp_pct, v_comp_amt,
    true, v_new_count, v_action
  );

  v_result := jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'rider_id', v_booking.rider_id,
    'compensation_amt', v_comp_amt,
    'compensation_pct', v_comp_pct,
    'seat_relisted', true,
    'rider_no_show_count', v_new_count,
    'action_taken', v_action,
    'message', CASE v_action
      WHEN 'warned'    THEN 'Passager averti — 2ème no-show'
      WHEN 'suspended' THEN 'Passager suspendu 30 jours — 3ème no-show'
      ELSE 'No-show enregistré'
    END
  );

  RETURN v_result;
END;
$$;

-- ── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE public.van_no_show_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_show_log_driver_read" ON public.van_no_show_log
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "no_show_log_rider_read" ON public.van_no_show_log
  FOR SELECT USING (auth.uid() = rider_id);