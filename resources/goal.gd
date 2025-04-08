class_name Goal
extends Resource

@export var goal_period_days: int = 30
@export var level: float = 0.8

var goal: int = 0
var goal_set_at: String = ""

func init() -> void:
	load_goal_settings()

func update_goal(steps_data: Dictionary) -> void:
	goal = calculate_goal(steps_data)
	save_goal(goal)

func calculate_goal(steps_data: Dictionary) -> int:
	var total_steps: int = sum_steps(steps_data, true)
	return int((float(total_steps) / float(goal_period_days)) * level)

func sum_steps(steps_data: Dictionary, skip_today: bool = false) -> int:
	var total: int = 0
	var today: String = Time.get_date_string_from_system()

	for date in steps_data.keys():
		if skip_today and date == today:
			continue
		total += steps_data[date]

	return total

func should_update_goal() -> bool:
	var goal_expiry_time: int = Time.get_unix_time_from_datetime_string(goal_set_at) + goal_period_days * 86400
	return goal == 0 or Time.get_unix_time_from_system() > goal_expiry_time

func save_goal(new_goal: int) -> void:
	var config: ConfigFile = ConfigFile.new()
	if config.load("user://settings.cfg") != OK:
		print("Failed to load config file")
		return

	config.set_value("goal_data", "goal", new_goal)
	config.set_value("goal_data", "goal_set_at", Time.get_datetime_string_from_system())

	if config.save("user://settings.cfg") != OK:
		print("Failed to save config file")

func load_goal_settings() -> void:
	var config: ConfigFile = ConfigFile.new()
	if config.load("user://settings.cfg") == OK:
		goal = config.get_value("goal_data", "goal", 0)
		goal_set_at = config.get_value("goal_data", "goal_set_at", "")
	else:
		print("Could not load goal settings")
