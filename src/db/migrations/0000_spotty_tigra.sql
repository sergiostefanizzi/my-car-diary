CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`make` text,
	`model` text,
	`year` integer,
	`license_plate` text,
	`vin` text,
	`current_odometer` integer DEFAULT 0 NOT NULL,
	`odometer_unit` text DEFAULT 'km' NOT NULL,
	`purchase_date` text,
	`photo_uri` text,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
