#include "InputEvent.h"

sciter::value InputEvent::wrap()
{
	sciter::value e;

	e.set_item("type", (int)type);
	e.set_item("time", time);
	e.set_item("msg", msg);
	e.set_item("wParam", wParam);
	e.set_item("lParam", lParam);
	e.set_item("scanCode", scanCode);
	e.set_item("vkCode", vkCode);
	e.set_item("x", x);
	e.set_item("y", y);
	e.set_item("mouseData", mouseData);
	e.set_item("flags", flags);

	return e;
}