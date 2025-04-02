
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'http://0.0.0.0:5000',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcnd6bmp2dWFjZ212b2pxbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDM3ODIsImV4cCI6MjA1OTA3OTc4Mn0.S2sUU9rskiaCA9y_CwcIZL9UO20jMPjEgssspYPgqfk',
  {
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
);
