#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

typedef enum eInputType
{
	Mouse,
	Keyboard
}eInputType;

class InputEvent
{
public:
	sciter::value wrap();

public:
	eInputType type;
	double time;
	int msg;
	int wParam;
	int lParam;
	int scanCode;
	int vkCode;
	int x;
	int y;
	int mouseData;
	int flags;
};