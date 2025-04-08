extends Control

const SETTINGS_FILE_PATH: String = "user://settings.cfg"
const GOAL_DATA_SECTION: String = "goal_data"
const SHIP_DATA_SECTION: String = "ship_data"

@onready var menu_label: Label = $CenterContainer/VBoxContainer/MenuLabel
@onready var username_value: Label = $CenterContainer/VBoxContainer/UsernameHBoxContainer/UsernameValue
@onready var journey_date_value: Label = $CenterContainer/VBoxContainer/JourneyDateHBoxContainer/JourneyDateValue
@onready var goal_value: Label = %GoalValue

func _ready() -> void:
	load_settings()

func load_settings() -> void:
	var config = ConfigFile.new()
	var err = config.load(SETTINGS_FILE_PATH)

	if err == OK:
		apply_settings(config)
	else:
		handle_config_error(err)

func apply_settings(config: ConfigFile) -> void:
	var goal = config.get_value(GOAL_DATA_SECTION, "goal", 0)
	var journey_started_at = config.get_value(SHIP_DATA_SECTION, "journey_started_at", 0)
	var username = config.get_value(SHIP_DATA_SECTION, "username", "")

	goal_value.text = str(goal)
	journey_date_value.text = format_date(Time.get_datetime_dict_from_datetime_string(journey_started_at, true))
	username_value.text = username

func handle_config_error(err: int) -> void:
	print("Could not load config file. Error code: %d" % err)

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch and event.pressed:
		change_to_hangar_scene()

func change_to_hangar_scene() -> void:
	get_tree().change_scene_to_file("res://menus/hangar.tscn")

func format_date(datetime: Dictionary) -> String:
	return "%04d-%02d-%02d" % [datetime.year, datetime.month, datetime.day]
