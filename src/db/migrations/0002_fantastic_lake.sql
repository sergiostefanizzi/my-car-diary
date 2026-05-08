CREATE TABLE `fuel_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`date` text NOT NULL,
	`odometer` integer NOT NULL,
	`liters` real NOT NULL,
	`price_per_liter` real NOT NULL,
	`total_cost` real NOT NULL,
	`full_tank` integer DEFAULT true NOT NULL,
	`station` text,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fuel_entries_vehicle_date_idx` ON `fuel_entries` (`vehicle_id`,`date`);