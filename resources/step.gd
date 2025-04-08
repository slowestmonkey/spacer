extends Resource
class_name Step

var health_kit

func init(period_days: int) -> void:
	if !health_kit and Engine.has_singleton("HealthKit"):
		health_kit = Engine.get_singleton("HealthKit")
		health_kit.run_today_steps_query()
		health_kit.run_period_steps_query(period_days)

func fetch_today_steps() -> int:
	if !health_kit:
		return randi_range(1000, 10000)

	health_kit.run_today_steps_query()
	
	return health_kit.get_today_steps()

func fetch_steps_for_period() -> Dictionary:
	if !health_kit:
		return {"2023-10-01": 1000, "2023-10-02": 2000, "2023-10-03": 3000}
	return health_kit.get_period_steps_dict()
