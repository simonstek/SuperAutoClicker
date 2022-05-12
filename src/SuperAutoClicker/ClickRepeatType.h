#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

typedef enum eClickRepeatType {
	RepeatUntilStopped = 0,
	RepeatLimitedTimes
}eClickRepeatType;

class ClickRepeatType : public sciter::om::asset<ClickRepeatType>
{
public:
	ClickRepeatType();
	~ClickRepeatType();

private:
	int RepeatLimitedTimes;
	int RepeatUntilStopped;

public:
	SOM_PASSPORT_BEGIN(ClickRepeatType)
		SOM_PROPS(
			SOM_RO_PROP(RepeatLimitedTimes),
			SOM_RO_PROP(RepeatUntilStopped)
		)
	SOM_PASSPORT_END
};

