-- ============================================================================
-- LaundryLaz - Initial Schema Migration
-- ============================================================================

-- =========================
-- 1. TABLES
-- =========================

-- profiles: extends auth.users with app-specific data
CREATE TABLE public.profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name       text NOT NULL,
    phone           text,
    role            text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    referral_code   text UNIQUE,
    referred_by     uuid REFERENCES public.profiles (id),
    stripe_customer_id text,
    credit_balance_cents integer NOT NULL DEFAULT 0,
    sms_opt_in      boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- addresses: user delivery/pickup addresses
CREATE TABLE public.addresses (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    label                   text NOT NULL,
    street                  text NOT NULL,
    apt                     text,
    city                    text NOT NULL DEFAULT 'Gainesville',
    state                   text NOT NULL DEFAULT 'FL',
    zip                     text NOT NULL,
    delivery_instructions   text,
    is_default              boolean NOT NULL DEFAULT false,
    created_at              timestamptz NOT NULL DEFAULT now()
);

-- time_slots: available pickup and delivery windows
CREATE TABLE public.time_slots (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date        date NOT NULL,
    start_time  time NOT NULL,
    end_time    time NOT NULL,
    slot_type   text NOT NULL CHECK (slot_type IN ('pickup', 'delivery')),
    capacity    integer NOT NULL DEFAULT 5,
    booked      integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (date, start_time, slot_type)
);

-- orders: laundry orders
CREATE TABLE public.orders (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid NOT NULL REFERENCES public.profiles (id),
    address_id              uuid NOT NULL REFERENCES public.addresses (id),
    pickup_slot_id          uuid NOT NULL REFERENCES public.time_slots (id),
    delivery_slot_id        uuid REFERENCES public.time_slots (id),
    status                  text NOT NULL DEFAULT 'pending' CHECK (status IN (
                                'pending', 'confirmed', 'picked_up', 'washing',
                                'drying', 'folding', 'ready_for_delivery',
                                'out_for_delivery', 'delivered', 'cancelled'
                            )),
    weight_lbs              numeric(6, 2),
    base_fee_cents          integer NOT NULL DEFAULT 500,
    per_lb_rate_cents       integer NOT NULL DEFAULT 175,
    total_cents             integer,
    credits_applied_cents   integer NOT NULL DEFAULT 0,
    payment_status          text NOT NULL DEFAULT 'not_required' CHECK (payment_status IN (
                                'not_required', 'pending', 'processing', 'succeeded', 'failed', 'refunded'
                            )),
    special_instructions    text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

-- order_status_history: audit trail for order status changes
CREATE TABLE public.order_status_history (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    old_status  text,
    new_status  text NOT NULL,
    changed_by  uuid REFERENCES public.profiles (id),
    note        text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- payments: Stripe payment records
CREATE TABLE public.payments (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                    uuid NOT NULL REFERENCES public.orders (id),
    stripe_payment_intent_id    text UNIQUE,
    amount_cents                integer NOT NULL,
    status                      text NOT NULL DEFAULT 'pending',
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- referrals: tracks referral relationships and rewards
CREATE TABLE public.referrals (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id         uuid NOT NULL REFERENCES public.profiles (id),
    referee_id          uuid NOT NULL REFERENCES public.profiles (id),
    referral_code_used  text NOT NULL,
    reward_cents        integer NOT NULL DEFAULT 500,
    status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- credit_transactions: ledger for user credit balance changes
CREATE TABLE public.credit_transactions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    amount_cents    integer NOT NULL,
    type            text NOT NULL CHECK (type IN ('referral_bonus', 'referral_reward', 'order_payment')),
    reference_id    uuid,
    description     text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- sms_log: record of all outbound SMS messages
CREATE TABLE public.sms_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES public.profiles (id),
    phone           text NOT NULL,
    message_type    text NOT NULL,
    message_body    text NOT NULL,
    twilio_sid      text,
    status          text NOT NULL DEFAULT 'queued',
    created_at      timestamptz NOT NULL DEFAULT now()
);


-- =========================
-- 2. INDEXES
-- =========================

CREATE INDEX idx_orders_user_id     ON public.orders (user_id);
CREATE INDEX idx_orders_status      ON public.orders (status);
CREATE INDEX idx_orders_created_at  ON public.orders (created_at);

CREATE INDEX idx_addresses_user_id  ON public.addresses (user_id);

CREATE INDEX idx_time_slots_date        ON public.time_slots (date);
CREATE INDEX idx_time_slots_slot_type   ON public.time_slots (slot_type);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history (order_id);

CREATE INDEX idx_payments_order_id                  ON public.payments (order_id);
CREATE INDEX idx_payments_stripe_payment_intent_id   ON public.payments (stripe_payment_intent_id);

CREATE INDEX idx_referrals_referrer_id  ON public.referrals (referrer_id);
CREATE INDEX idx_referrals_referee_id   ON public.referrals (referee_id);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions (user_id);


-- =========================
-- 3. TRIGGER FUNCTIONS
-- =========================

-- Generate a unique 8-character referral code for new profiles
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    new_code text;
    code_exists boolean;
BEGIN
    IF NEW.referral_code IS NULL THEN
        LOOP
            -- Generate an 8-character alphanumeric code
            new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
            SELECT EXISTS (
                SELECT 1 FROM public.profiles WHERE referral_code = new_code
            ) INTO code_exists;
            EXIT WHEN NOT code_exists;
        END LOOP;
        NEW.referral_code := new_code;
    END IF;
    RETURN NEW;
END;
$$;

-- Auto-create a profile row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL)
    );
    RETURN NEW;
END;
$$;

-- Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


-- =========================
-- 4. TRIGGERS
-- =========================

-- Auto-generate referral code before inserting a profile
CREATE TRIGGER trg_generate_referral_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_referral_code();

-- Auto-create profile when a new user signs up
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Keep updated_at current on profiles
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Keep updated_at current on orders
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();


-- =========================
-- 5. ROW LEVEL SECURITY
-- =========================

-- Helper: check if the current user has the admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;


-- ---- profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ---- addresses ----
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses"
    ON public.addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
    ON public.addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
    ON public.addresses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
    ON public.addresses FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all addresses"
    ON public.addresses FOR SELECT
    USING (public.is_admin());


-- ---- time_slots ----
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read time_slots"
    ON public.time_slots FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert time_slots"
    ON public.time_slots FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update time_slots"
    ON public.time_slots FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete time_slots"
    ON public.time_slots FOR DELETE
    USING (public.is_admin());


-- ---- orders ----
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
    ON public.orders FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ---- order_status_history ----
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order status history"
    ON public.order_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all order status history"
    ON public.order_status_history FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert order status history"
    ON public.order_status_history FOR INSERT
    WITH CHECK (public.is_admin());


-- ---- payments ----
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all payments"
    ON public.payments FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update payments"
    ON public.payments FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete payments"
    ON public.payments FOR DELETE
    USING (public.is_admin());


-- ---- referrals ----
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals as referrer"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can read own referrals as referee"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referee_id);

CREATE POLICY "Admins can read all referrals"
    ON public.referrals FOR SELECT
    USING (public.is_admin());


-- ---- credit_transactions ----
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (public.is_admin());


-- ---- sms_log ----
ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sms_log"
    ON public.sms_log FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert sms_log"
    ON public.sms_log FOR INSERT
    WITH CHECK (public.is_admin());
