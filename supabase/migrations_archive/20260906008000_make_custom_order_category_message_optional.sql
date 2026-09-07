-- Allow category and message to be optional in custom_orders
ALTER TABLE arts.custom_orders ALTER COLUMN category DROP NOT NULL;
ALTER TABLE arts.custom_orders ALTER COLUMN category SET DEFAULT 'Not specified';

ALTER TABLE arts.custom_orders ALTER COLUMN message DROP NOT NULL;
ALTER TABLE arts.custom_orders ALTER COLUMN message SET DEFAULT '';

