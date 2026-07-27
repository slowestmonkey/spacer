import { Goal } from '../models/Goal';
import { Step } from '../models/Step';

/**
 * The `.tres` resources from the Godot project.
 *
 * `world.tscn` and `hangar.tscn` both point at the *same* `goal.tres` and
 * `step.tres` files, and Godot hands out one shared instance per resource path,
 * so the hangar's `update_goal()` is visible to the world scene without any
 * reload. Module-level singletons reproduce that.
 */

/** `resources/goal.tres` — `goal_period_days = 30`, `level = 0.6`. */
export const goalResource = new Goal({ goalPeriodDays: 30, level: 0.6 });

/** `resources/step.tres` */
export const stepResource = new Step();
