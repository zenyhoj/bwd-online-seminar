-- Add water_meter_installed_at column
ALTER TABLE applications
ADD COLUMN water_meter_installed_at TIMESTAMPTZ;
