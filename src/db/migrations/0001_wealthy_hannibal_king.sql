CREATE TABLE `maintenance_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`type` text NOT NULL,
	`date` text NOT NULL,
	`odometer` integer NOT NULL,
	`cost` real,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`vendor` text,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `maintenance_records_vehicle_date_idx` ON `maintenance_records` (`vehicle_id`,`date`);--> statement-breakpoint
CREATE INDEX `maintenance_records_vehicle_type_idx` ON `maintenance_records` (`vehicle_id`,`type`);