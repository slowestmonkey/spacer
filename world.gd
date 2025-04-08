extends Node2D

@export var goal_resource: Goal
@export var step_resource: Step

@onready var ship: Node2D = $Ship
@onready var fuel_label: Label = $FuelLabel
@onready var fuel_update_timer: Timer = $FuelUpdateTimer
@onready var goal_label: Label = $GoalLabel
@onready var username_label: Label = $UsernameLabel

var health_kit
var ship_hull

func _ready() -> void:
	initialize_resources()
	load_settings()

	if is_ship_hull_missing():
		navigate_to_start_menu()
		return

	initialize_game()

func initialize_resources() -> void:
	goal_resource.init()
	step_resource.init(goal_resource.goal_period_days)

func initialize_game() -> void:
	setup_signals()
	setup_ui()
	load_goal_settings()
	refresh_goal()
	validate_goal()

func load_goal_settings() -> void:
	goal_resource.load_goal_settings()

func is_ship_hull_missing() -> bool:
	return ship_hull == null

func navigate_to_start_menu() -> void:
	await get_tree().process_frame
	get_tree().change_scene_to_file("res://menus/start_menu.tscn")

func setup_signals() -> void:
	ship.tree_exiting.connect(on_ship_exit)
	fuel_label.gui_input.connect(on_fuel_label_interaction)
	fuel_update_timer.timeout.connect(update_fuel_display)

func on_ship_exit() -> void:
	await get_tree().create_timer(1.0).timeout
	get_tree().change_scene_to_file("res://menus/game_over.tscn")

func setup_ui() -> void:
	fuel_label.mouse_filter = Control.MOUSE_FILTER_STOP
	update_fuel_display()
	update_goal_display()
	fuel_update_timer.start()

func on_fuel_label_interaction(event: InputEvent) -> void:
	if event is InputEventScreenTouch or (event is InputEventMouseButton and event.pressed):
		destroy_ship()

func destroy_ship() -> void:
	if ship:
		ship.health_component.health = 0
	save_ship_hull(null)

func save_ship_hull(hull_value) -> void:
	var config = ConfigFile.new()
	config.load("user://settings.cfg")
	config.set_value("ship_data", "ship_hull", hull_value)
	if config.save("user://settings.cfg") != OK:
		print("Failed to save config file")

func update_fuel_display() -> void:
	fuel_label.text = "Fuel: " + str(int(step_resource.fetch_today_steps() / 10.0))

func update_goal_display() -> void:
	goal_label.text = "Goal: " + str(int(goal_resource.goal / 10.0))

func refresh_goal() -> void:
	if goal_resource.should_update_goal():
		update_goal_with_steps()

func update_goal_with_steps() -> void:
	var steps_data = step_resource.fetch_steps_for_period()
	goal_resource.update_goal(steps_data)

func validate_goal() -> void:
	var steps_data = step_resource.fetch_steps_for_period()
	var goal_start_time = Time.get_unix_time_from_datetime_string(goal_resource.goal_set_at)
	var today_time = get_start_of_today_unix()

	for date_key in steps_data.keys():
		var date_time = Time.get_unix_time_from_datetime_string(date_key)
		if is_outside_goal_period(date_time, goal_start_time, today_time):
			continue

		if steps_data[date_key] < goal_resource.goal:
			ship.health_component.health = 0

func is_outside_goal_period(date_time: int, goal_start_time: int, today_time: int) -> bool:
	return date_time < goal_start_time or date_time >= today_time

func get_start_of_today_unix() -> int:
	var today = Time.get_datetime_dict_from_system()
	today.hour = 0
	today.minute = 0
	today.second = 0
	return Time.get_unix_time_from_datetime_dict(today)

func load_settings() -> void:
	var config = ConfigFile.new()
	var err = config.load("user://settings.cfg")

	if err == OK:
		ship_hull = config.get_value("ship_data", "ship_hull")
	else:
		print("Could not load config file")
