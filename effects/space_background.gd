extends ParallaxBackground

@export var exponent: int = 1

@onready var space_layer: ParallaxLayer = %SpaceLayer
@onready var far_stars_layer: ParallaxLayer = %FarStarsLayer
@onready var close_stars_layer: ParallaxLayer = %CloseStarsLayer

func _process(delta: float) -> void:
	space_layer.motion_offset.y += exponent * 100 * delta
	far_stars_layer.motion_offset.y += exponent * 200 * delta
	close_stars_layer.motion_offset.y += exponent * 500 * delta
	
