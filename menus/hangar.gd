extends Node2D

@export var goal_resource: Goal
@export var step_resource: Step

@onready var scroll_container: ScrollContainer = $CenterContainer/VBoxContainer/HBoxContainer/ScrollContainer
@onready var h_box_container: HBoxContainer = $CenterContainer/VBoxContainer/HBoxContainer/ScrollContainer/HBoxContainer
@onready var username_line_edit: LineEdit = $CenterContainer/VBoxContainer/VBoxContainer/UsernameLineEdit
@onready var start_button: Button = $CenterContainer/VBoxContainer/StartButton

var selected_index = 0
var total_ships = 0

const SHIP_WIDTH = 52
const SETTINGS_FILE_PATH = "user://settings.cfg"
const SHIP_DATA_SECTION = "ship_data"
const SHIP_HULL_KEY = "ship_hull"
const USERNAME_KEY = "username"
const JOURNEY_STARTED_AT_KEY = "journey_started_at"
const SNAP_ANIMATION_DURATION = 0.3

func _ready() -> void:
	step_resource.init(goal_resource.goal_period_days)
	total_ships = h_box_container.get_child_count()
	load_selection()
	selected_index = clamp(selected_index, 0, total_ships - 1)
	scroll_container.scroll_horizontal = selected_index * SHIP_WIDTH
	username_line_edit.text = load_username()

func save_selection():
	var config = ConfigFile.new()
	if config.load(SETTINGS_FILE_PATH) != OK:
		config.save(SETTINGS_FILE_PATH)
	config.set_value(SHIP_DATA_SECTION, SHIP_HULL_KEY, selected_index + 1)
	config.save(SETTINGS_FILE_PATH)
	save_username(config)
	save_journey_started_at(config)

func save_username(config: ConfigFile):
	config.set_value(SHIP_DATA_SECTION, USERNAME_KEY, username_line_edit.text)
	config.save(SETTINGS_FILE_PATH)

func save_journey_started_at(config: ConfigFile):
	config.set_value(SHIP_DATA_SECTION, JOURNEY_STARTED_AT_KEY, Time.get_datetime_string_from_system())
	config.save(SETTINGS_FILE_PATH)

func load_username() -> String:
	var config = ConfigFile.new()
	if config.load(SETTINGS_FILE_PATH) == OK:
		return config.get_value(SHIP_DATA_SECTION, USERNAME_KEY, "")
	return ""

func load_selection():
	var config = ConfigFile.new()
	if config.load(SETTINGS_FILE_PATH) == OK:
		selected_index = config.get_value(SHIP_DATA_SECTION, SHIP_HULL_KEY, 0)

func _on_start_button_pressed() -> void:
	save_selection()
	update_goal_with_steps()
	change_to_world_scene()

func update_goal_with_steps() -> void:
	var steps_data = step_resource.fetch_steps_for_period()
	goal_resource.update_goal(steps_data)

func change_to_world_scene() -> void:
	get_tree().change_scene_to_file("res://world.tscn")

func _input(event):
	if is_drag_event(event):
		return
	if is_touch_release_event(event):
		snap_to_selected_ship()

func is_drag_event(event: InputEvent) -> bool:
	return event is InputEventScreenDrag

func is_touch_release_event(event: InputEvent) -> bool:
	return event is InputEventScreenTouch and not event.pressed

func snap_to_selected_ship() -> void:
	total_ships = h_box_container.get_child_count()
	selected_index = clamp(int(round(float(scroll_container.scroll_horizontal) / float(SHIP_WIDTH))), 0, total_ships - 1)

	var target_x = selected_index * SHIP_WIDTH
	var tween = get_tree().create_tween()
	if tween:
		tween.tween_property(scroll_container, "scroll_horizontal", target_x, SNAP_ANIMATION_DURATION)
