#include "NativeActor.h"
#include "LogUtil.h"
#include "ClickButton.h"
#include "ClickType.h"
#include "ClickRepeatType.h"
#include "ClickLocationType.h"
#include "Constants.h"
#include "NativeUtil.h"
#include "MouseClicker.h"

NativeActor::NativeActor(QObject* parent/* = nullptr*/)
	: QObject(parent)
	, _win(nullptr)
	, _clickInterval(0)
	, _clickButton(eClickButton::left)
	, _clickType(eClickType::OneClick)
	, _clickRepeatType(eClickRepeatType::RepeatLimitedTimes)
	, _clickRepeatTimes(10)
	, _clickLocationType(eClickLocationType::CurrentLocation)
	, _clickLocationX(0)
	, _clickLocationY(0)
	, _clickCount(0)
	, _clickTimer(Q_NULLPTR)
{
}

NativeActor::~NativeActor()
{
}

NativeActor* NativeActor::sInstance = nullptr;

NativeActor* NativeActor::getInstance()
{
	if (NativeActor::sInstance == nullptr)
	{
		NativeActor::sInstance = new NativeActor();
	}

	return sInstance;
}

void NativeActor::setWindow(sciter::window* win)
{
	_win = win;
}

void NativeActor::setClickInterval(int v)
{
	_clickInterval = v;
}
void NativeActor::setClickButton(int v)
{
	_clickButton = v;
}
void NativeActor::setClickType(int v)
{
	_clickType = v;
}
void NativeActor::setClickRepeatType(int v)
{
	_clickRepeatType = v;
}
void NativeActor::setClickRepeatTimes(int v)
{
	_clickRepeatTimes = v;
}
void NativeActor::setClickLocationType(int v)
{
	_clickLocationType = v;
}
void NativeActor::setClickLocationX(int v)
{
	_clickLocationX = v;
}
void NativeActor::setClickLocationY(int v)
{
	_clickLocationY = v;
}

void NativeActor::startClicking()
{
	LOG_INFO("[{:>24}] NativeActor start clicking", "NativeActor");

	_clickCount = 0;

	auto N = NativeUtil::getInstance();

	_clickTimer = new QTimer(this);
	auto tt = _clickTimer->timerType();
	_clickTimer->setTimerType(Qt::TimerType::PreciseTimer);
	connect(_clickTimer, SIGNAL(timeout()), this, SLOT(onClickTimer()));
	_clickTimer->start(_clickInterval);
}

void NativeActor::onClickTimer()
{
	//LOG_INFO("[{:>24}] simulate click. repeat type: {}. current click count: {}. repeat times: {}", "MouseClicker", _clickRepeatType, _clickCount, _clickRepeatTimes);

	auto M = MouseClicker::getInstance();

	if (_clickRepeatType == eClickRepeatType::RepeatLimitedTimes && _clickCount > _clickRepeatTimes)
	{
		LOG_INFO("[{:>24}] {}", "MouseClicker", "reached repeat times. stop clicking");
		stopClicking();
	}
	else
	{
		if (_clickLocationType == eClickLocationType::CurrentLocation)
		{
			POINT cursorPos;
			GetCursorPos(&cursorPos);
			M->simulateClick((eClickButton)_clickButton, _clickType == eClickType::DoubleClick, cursorPos.x, cursorPos.y);
		}
		else if (_clickLocationType == eClickLocationType::PickedLocation)
		{
			M->simulateClick((eClickButton)_clickButton, _clickType == eClickType::DoubleClick, _clickLocationX, _clickLocationY);
		}
		else
		{
			LOG_INFO("[{:>24}] unknown click location type: {}", "MouseClicker", _clickLocationType);
		}

		_clickCount++;
	}
}

void NativeActor::stopClicking()
{
	LOG_INFO("[{:>24}] NativeActor stop clicking", "NativeActor");

	if (_clickTimer == Q_NULLPTR) return;
	_clickTimer->stop();

	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("NATIVE_AUTOCLICK_STOPPED");
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
}