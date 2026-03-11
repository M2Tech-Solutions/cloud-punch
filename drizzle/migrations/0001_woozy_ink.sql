PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_worktime` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`date` integer NOT NULL,
	`punchIn` integer,
	`punchOut` integer,
	`project` integer,
	`task` integer,
	`status` text NOT NULL,
	FOREIGN KEY (`project`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_worktime`("id", "userId", "date", "punchIn", "punchOut", "project", "task", "status") SELECT "id", "userId", "date", "punchIn", "punchOut", "project", "task", "status" FROM `worktime`;--> statement-breakpoint
DROP TABLE `worktime`;--> statement-breakpoint
ALTER TABLE `__new_worktime` RENAME TO `worktime`;--> statement-breakpoint
PRAGMA foreign_keys=ON;