extends Control

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch and event.pressed:
		change_to_hangar_scene()

func change_to_hangar_scene() -> void:
	get_tree().change_scene_to_file("res://menus/hangar.tscn")
