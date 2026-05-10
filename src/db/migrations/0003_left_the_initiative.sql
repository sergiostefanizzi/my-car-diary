CREATE TABLE `maintenance_intervals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`record_type` text NOT NULL,
	`interval_km` integer,
	`interval_days` integer,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_intervals_vehicle_type_uq` ON `maintenance_intervals` (`vehicle_id`,`record_type`);