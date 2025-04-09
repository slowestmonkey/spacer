extends Node2D

@onready var ship_animated_sprite_2d: AnimatedSprite2D = $ShipAnimatedSprite2D
@onready var thruster_left_animated_sprite_2d: AnimatedSprite2D = $ThrusterLeftAnimatedSprite2D
@onready var thruster_right_animated_sprite_2d: AnimatedSprite2D = $ThrusterRightAnimatedSprite2D
@onready var destroyed_component: DestroyedComponent = $DestroyedComponent

var thruster_offsets = {
	0: {"left": Vector2(-3, 28), "right": Vector2(7, 28)},
	1: {"left": Vector2(-3, 28), "right": Vector2(7, 28)},
	2: {"left": Vector2(-11, 24), "right": Vector2(14, 24)},
	3: {"left": Vector2(-2, 21), "right": Vector2(6, 21)},
	4: {"left": Vector2(2, 24), "right": Vector2(2, 24)},
	5: {"left": Vector2(-4, 26), "right": Vector2(9, 26)},
	6: {"left": Vector2(-2, 28), "right": Vector2(5, 28)},
}

func _ready():
	var ship_hull = load_ship_hull()
	apply_hull_texture(ship_hull)

func load_ship_hull() -> int:
	var config = ConfigFile.new()
	var path = "user://settings.cfg"

	if config.load(path) == OK:
		return config.get_value("ship_data", "ship_hull", 0)
	return 0

func apply_hull_texture(ship_hull: int):
	var texture_path = "res://assets/ships/ship_" + str(ship_hull) + ".png"

	if ResourceLoader.exists(texture_path):
		var ship_texture = load(texture_path)

		var frames = SpriteFrames.new()
		frames.add_frame("default", ship_texture)

		ship_animated_sprite_2d.sprite_frames = frames
		ship_animated_sprite_2d.play("default")

		set_thruster_position(ship_hull)
	else:
		print("⚠ Ship hull texture not found:", texture_path)

func set_thruster_position(ship_hull: int):
	var offsets = thruster_offsets.get(ship_hull, thruster_offsets[0])
	var thruster_left_offset = offsets["left"]
	var thruster_right_offset = offsets["right"]

	thruster_left_animated_sprite_2d.position = ship_animated_sprite_2d.position + thruster_left_offset
	thruster_right_animated_sprite_2d.position = ship_animated_sprite_2d.position + thruster_right_offset

func destroy():
	destroyed_component.destroy()
	
	
