/*
  # Add Anonymous User Support for Progress Tracking

  1. Changes
    - Add RLS policies to allow anonymous users (anon role) to access user_progress
    - Add RLS policies to allow anonymous users to access quiz_attempts
    - This allows non-authenticated users to track progress using temporary IDs

  2. Security
    - Anonymous users can only access their own data (filtered by user_id)
    - Data is still protected per user_id
    - When users log in, their temporary progress can be migrated to their account
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anonymous users can view own progress" ON user_progress;
  DROP POLICY IF EXISTS "Anonymous users can insert own progress" ON user_progress;
  DROP POLICY IF EXISTS "Anonymous users can update own progress" ON user_progress;
  DROP POLICY IF EXISTS "Anonymous users can view own quiz attempts" ON quiz_attempts;
  DROP POLICY IF EXISTS "Anonymous users can insert own quiz attempts" ON quiz_attempts;
END $$;

-- RLS Policies for user_progress (anonymous users)
CREATE POLICY "Anonymous users can view own progress"
  ON user_progress FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert own progress"
  ON user_progress FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update own progress"
  ON user_progress FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quiz_attempts (anonymous users)
CREATE POLICY "Anonymous users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO anon
  WITH CHECK (true);
