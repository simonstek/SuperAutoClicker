#pragma once

#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include <IInputMsgHandler.h>
#include <QLibrary>

class InputHooker : public IInputMsgHandler
{
public:
	InputHooker();
	~InputHooker();

	bool installInputHook();
	bool unstallInputHook();
	bool startRecording();
	bool stopRecording();
	void* getInputEvents();

public:
	virtual void onKeyboardMsg(unsigned int msg, unsigned long long vkCode);
	virtual void onMouseMsg(unsigned int msg, int btn, unsigned int x, unsigned int y);

private:
	bool addInputMsgHandler();

private:
	bool _inputHookIsInstalled;
	QLibrary _dll;
};