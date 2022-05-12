#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

class VirtualKey : public sciter::om::asset<VirtualKey>
{
public:
	VirtualKey();
	~VirtualKey();

private:
	int F1;
	int F2;
	int F3;
	int F4;
	int F5;
	int F6;
	int F7;
	int F8;
	int F9;
	int F10;
	int F11;
	int F12;
	int ESC;

public:
	SOM_PASSPORT_BEGIN(VirtualKey)
		SOM_PROPS(
			SOM_RO_PROP(F1),
			SOM_RO_PROP(F2),
			SOM_RO_PROP(F3),
			SOM_RO_PROP(F4),
			SOM_RO_PROP(F5),
			SOM_RO_PROP(F6),
			SOM_RO_PROP(F7),
			SOM_RO_PROP(F8),
			SOM_RO_PROP(F9),
			SOM_RO_PROP(F10),
			SOM_RO_PROP(F11),
			SOM_RO_PROP(F12),
			SOM_RO_PROP(ESC)
		)
		SOM_PASSPORT_END
};

