import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://dodjsyqrbfhthsrfcecl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZGpzeXFyYmZodGhzcmZjZWNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTMyNTkyOSwiZXhwIjoyMDE2OTAxOTI5fQ.SVANG8h2h5vjw0woVVRwVl4Vimb7abVgCllY-lvKxxM"
);
