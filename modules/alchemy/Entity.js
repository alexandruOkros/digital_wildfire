// 
// Entity type.
// Documentation.
//

// class Entity {
// 		var text: String = the entitys.
// 		var type: String = type of entity (i.e. Company, Place).
//		car count: Int = number of appereances.
// 		var relevance: Float = ...
// }


// Convert a entity to a proper Entity object.
//
// function toEntity(entity: Entity): Entity
function toEntity(entity) {
	// Transform the relevance from String to Float.
	if(entity.hasOwnProperty('relevance'))
		entity.relevance = parseFloat(entity.relevance);
	else
		entity.relevance = 0;

	// Transform the count from String to int.
	if(entity.hasOwnProperty('count'))
		entity.count = parseInt(entity.count);
	else
		entity.count = 0;

	return entity;
}