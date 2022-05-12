#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

typedef enum eClickButton {
	left = 0,
	middle,
	right,
	side
}eClickButton;

class ClickButton : public sciter::om::asset<ClickButton>
{
public:
	ClickButton();
	~ClickButton();

private:
	int Left;
	int Middle;
	int Right;
	int Side;

public:
	SOM_PASSPORT_BEGIN(ClickButton)
		SOM_PROPS(
			SOM_RO_PROP(Left),
			SOM_RO_PROP(Middle),
			SOM_RO_PROP(Right),
			SOM_RO_PROP(Side)
		)
	SOM_PASSPORT_END
};

