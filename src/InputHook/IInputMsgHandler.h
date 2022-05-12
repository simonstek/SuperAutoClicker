#pragma once

class IInputMsgHandler
{
public:
    virtual void onKeyboardMsg(unsigned int msg, unsigned long long vkCode) = 0;
	virtual void onMouseMsg(unsigned int msg, int btn, unsigned int x, unsigned int y) = 0;
};