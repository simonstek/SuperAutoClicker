#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

typedef enum eClickType {
	OneClick = 0,
	DoubleClick
}eClickType;

class ClickType : public sciter::om::asset<ClickType>
{
public:
	ClickType();
	~ClickType();

private:
	int OneClick;
	int DoubleClick;

public:
	SOM_PASSPORT_BEGIN(ClickType)
		SOM_PROPS(
			SOM_RO_PROP(OneClick),
			SOM_RO_PROP(DoubleClick)
		)
	SOM_PASSPORT_END
};

