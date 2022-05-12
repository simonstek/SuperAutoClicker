#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

typedef enum eClickLocationType {
	CurrentLocation = 0,
	PickedLocation
}eClickLocationType;

class ClickLocationType : public sciter::om::asset<ClickLocationType>
{
public:
	ClickLocationType();
	~ClickLocationType();

private:
	int CurrentLocation;
	int PickedLocation;

public:
	SOM_PASSPORT_BEGIN(ClickLocationType)
		SOM_PROPS(
			SOM_RO_PROP(CurrentLocation),
			SOM_RO_PROP(PickedLocation)
		)
		SOM_PASSPORT_END
};

