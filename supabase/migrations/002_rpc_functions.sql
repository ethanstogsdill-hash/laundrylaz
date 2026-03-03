-- RPC function to atomically increment a user's credit balance
CREATE OR REPLACE FUNCTION increment_credit_balance(
  user_id_input UUID,
  amount_input INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credit_balance_cents = credit_balance_cents + amount_input,
      updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
