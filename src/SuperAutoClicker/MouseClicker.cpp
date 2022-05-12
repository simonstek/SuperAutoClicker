#include "MouseClicker.h"
#include "LogUtil.h"
#include "ClickType.h"
#include "ClickRepeatType.h"
#include "ClickLocationType.h"
#include "Constants.h"
#include "InputEvent.h"
#include "MacroFile.h"

#include <fstream>
#include <chrono>

#include <QString>
#include <QDir>
#include <QFile>
#include <QDataStream>
#include <QUuid>
#include <QJsonDocument>
#include <QJsonObject>

MouseClicker::MouseClicker(QObject* parent/* = nullptr*/)
	: QObject(parent)
	, ctrlPressed(false)
	, shiftPressed(false)
	, altPressed(false)
	, _win(nullptr)
	, _macro(nullptr)
	, _playTimer(nullptr)
	, _playStartTime(0)
	, _currPlayEventIndex(0)
	, _lastSimulatedTime(0)
	, _numSimulatedEvents(0)
{
}

MouseClicker::~MouseClicker()
{
	if (_macro) delete _macro;
}

MouseClicker* MouseClicker::sInstance = nullptr;

MouseClicker* MouseClicker::getInstance()
{
	if (MouseClicker::sInstance == nullptr)
	{
		MouseClicker::sInstance = new MouseClicker();
	}

	return sInstance;
}

void MouseClicker::setWindow(sciter::window* win)
{
	_win = win;
}

bool MouseClicker::installInputHook()
{
	return InputHooker::installInputHook();
}

bool MouseClicker::unstallInputHook()
{
	return InputHooker::unstallInputHook();
}

bool MouseClicker::startRecording()
{
	return InputHooker::startRecording();
}

bool MouseClicker::stopRecording()
{
	return InputHooker::stopRecording();
}

sciter::value MouseClicker::saveMacro(sciter::string name, sciter::string path)
{
	QString qName = QString::fromStdWString(name);
	LOG_INFO("[{:>24}] save recording: {} begin...", "MouseClicker", qName.toStdString());

	// make macro dir
	QString qPath = QString::fromStdWString(path);
	QFileInfo fi(qPath);
	if (!fi.dir().exists())
	{
		fi.dir().mkpath(".");
	}

	MacroFile* f = new MacroFile();

	auto v = (std::vector<InputEvent>*)getInputEvents();
	const std::vector<InputEvent>& es = (*v);
	f->events = es;

	using namespace std::chrono;
	uint64_t ms = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();
	//std::cout << ms << " milliseconds since the Epoch\n";
	QString uuid = QUuid::createUuid().toString();
	f->id = uuid.toStdWString();

	f->createdTime = ms;
	f->name = name;
	f->duration = es.at(es.size() - 1).time;

	if (!f->serialize(qPath))
	{
		LOG_INFO("[{:>24}] faled to serialize macro file: {}", "MouseClicker", qName.toStdString());
		return 0;
	}

	sciter::value rv = sciter::value::wrap_asset(f);
	return rv;
}

bool MouseClicker::renameMacro(sciter::string oldPath, sciter::string newPath, sciter::string newName)
{
	QString qOldPath = QString::fromStdWString(oldPath);
	QString qNewPath = QString::fromStdWString(newPath);
	QString qNewName = QString::fromStdWString(newName);
	LOG_INFO("[{:>24}] rename macro. old path: {}. new path: {}. new name: {}", "MouseClicker", qOldPath.toStdString(), qNewPath.toStdString(), qNewName.toStdString());

	auto macro = new MacroFile();
	if (!macro->deserialize(qOldPath))
	{
		LOG_INFO("[{:>24}] failed to deserialize macro file: {}", "MouseClicker", qOldPath.toStdString());
		return false;
	}

	macro->name = newName;

	if (!macro->serialize(qNewPath))
	{
		LOG_INFO("[{:>24}] failed to serialize macro file: {}", "MouseClicker", qNewPath.toStdString());
		return false;
	}

	QFile file(qOldPath);
	if (!file.remove())
	{
		LOG_INFO("[{:>24}] failed to remove old macro file: {}", "MouseClicker", qOldPath.toStdString());
	}

	return true;
}

sciter::value MouseClicker::getMacroFile(sciter::string path)
{
	QString qPath = QString::fromStdWString(path);
	LOG_INFO("[{:>24}] get macro file. path: {}", "MouseClicker", qPath.toStdString());

	auto f = new MacroFile();
	if (!f->deserialize(qPath))
	{
		LOG_INFO("[{:>24}] failed to get macro file: {}", "MouseClicker", qPath.toStdString());
		return 0;
	}

	sciter::value rv = sciter::value::wrap_asset(f);
	return rv;
}

int GScreenX;
int GScreenY;

bool MouseClicker::startPlaying(sciter::string path)
{
	QString qPath = QString::fromStdWString(path);
	LOG_INFO("[{:>24}] start playing: {}", "MouseClicker", qPath.toStdString());
	
	if (_macro) delete _macro;
	_macro = new MacroFile();
	if (!_macro->deserialize(qPath))
	{
		LOG_INFO("[{:>24}] failed to deserialize macro file: {}", "MouseClicker", qPath.toStdString());
		return false;
	}

	HDC hdcScreen = GetWindowDC(NULL);
	GScreenX = GetDeviceCaps(hdcScreen, HORZRES);
	GScreenY = GetDeviceCaps(hdcScreen, VERTRES);
	DeleteObject(hdcScreen);

	stopPlaying();
	_playTimer = new QTimer(this);
	connect(_playTimer, SIGNAL(timeout()), this, SLOT(onPlayingTimer()));
	_playTimer->start();
	_playStartTime = GetTickCount64();
	_currPlayEventIndex = 0;
	_lastSimulatedTime = 0;
	_numSimulatedEvents = 0;
	LOG_INFO("[{:>24}] play start time: {}, timer: {}", "MouseClicker", _playStartTime, _playTimer->timerId());

	// emit start playing event
	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("PLAY_MACRO_STARTED");
	e.data.set_item("duration", _macro->duration);
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app

	return true;
}

bool MouseClicker::stopPlaying()
{
	LOG_INFO("[{:>24}] stop playing", "MouseClicker");

	if (_playTimer != NULL)
	{
		LOG_INFO("[{:>24}] already has play timer {}, stop it", "MouseClicker", _playTimer->timerId());
		_playTimer->stop();
	}

	return true;
}

void MouseClicker::onPlayingTimer()
{
	if (_macro == nullptr) return;

	int currTime = GetTickCount64() - _playStartTime;

	if (_currPlayEventIndex >= _macro->events.size() || currTime > _macro->duration)
	{
		// emit finish playing event
		BEHAVIOR_EVENT_PARAMS e = { 0 };
		e.name = WSTR("PLAY_MACRO_FINISHED");
		if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app

		stopPlaying();
		return;
	}

	const InputEvent &currEvent = _macro->events.at(_currPlayEventIndex);
	if (_lastSimulatedTime <= currEvent.time && currEvent.time <= currTime)
	{
		simulateInputs(currTime);
	}

	// emit play progress event
	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("PLAY_MACRO_PROGRESS");
	e.data.set_item("currTime", currTime);
	e.data.set_item("totalTime", _macro->duration);
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
}

void MouseClicker::simulateInputs(int currTime)
{
	if (_macro == nullptr) return;

	int i = 0;
	for (i = _currPlayEventIndex; i < _macro->events.size(); i++)
	{
		const InputEvent &e = _macro->events.at(i);

		if (_lastSimulatedTime <= e.time && e.time <= currTime)
		{
			simulateSingleInput(e);
		}
		else
		{
			break;
		}
	}

	_currPlayEventIndex = i;

	_lastSimulatedTime = currTime;
}

int msgToFlags(int msg)
{
	switch (msg)
	{
	case WM_MOUSEMOVE:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_MOVE;
	case WM_LBUTTONDOWN:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_LEFTDOWN;
	case WM_LBUTTONUP:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_LEFTUP;
	case WM_RBUTTONDOWN:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_RIGHTDOWN;
	case WM_RBUTTONUP:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_RIGHTUP;
	case WM_MOUSEWHEEL:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_WHEEL;
	case WM_MBUTTONDOWN:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_MIDDLEDOWN;
	case WM_MBUTTONUP:
		return MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_MIDDLEUP;
	case WM_KEYDOWN:
		return 0x0; // KEYEVENTF_KEYDOWN is not defined in winuser.h, which value = 0
	case WM_KEYUP:
		return KEYEVENTF_KEYUP;
	}

	return 0;
}

void MouseClicker::simulateSingleInput(const InputEvent &e)
{
	INPUT input = { 0 };
	int type = e.type;

	if (type == eInputType::Mouse) // mouse event
	{
		int dx = e.x;
		int dy = e.y;
		int dwData = e.mouseData;

		int msg = e.msg;
		int flags = msgToFlags(msg);

		input.type = INPUT_MOUSE;
		input.mi.dwExtraInfo = KSimulatingInput;
		input.mi.dwFlags = flags;
		input.mi.dx = dx * 65535 / GScreenX;
		input.mi.dy = dy * 65535 / GScreenY;
		input.mi.mouseData = dwData;
		input.mi.time = 0;

		// Logger::getInstance()->log(QString("send input: msg=%1, type=%2, dwExtraInfo=%3").arg(node->msg).arg(node->type).arg(KSimulatingInput));

		if (msg == WM_LBUTTONDOWN)
		{
			// emit mouse click event
			BEHAVIOR_EVENT_PARAMS e = { 0 };
			e.name = WSTR("MACRO_MOUSE_CLICK");
			e.data.set_item("dx", dx);
			e.data.set_item("dy", dy);
			if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
		}
	}
	else // keyboard event
	{
		int msg = e.msg;
		int flags = msgToFlags(msg);

		int scanCode = e.scanCode;
		int vkCode = e.vkCode;

		input.type = INPUT_KEYBOARD;
		input.ki.dwExtraInfo = KSimulatingInput;
		input.ki.dwFlags = flags;
		input.ki.wScan = scanCode;
		input.ki.wVk = vkCode;
		input.ki.time = 0;
	}

	int cbSize = sizeof(input);
	SendInput(1, &input, cbSize);
	
	_numSimulatedEvents++;
}

void MouseClicker::onKeyboardMsg(unsigned int msg, unsigned long long vkCode)
{
	//LOG_INFO("[{:>24}] on keyboar msg: 0x{:x}:{}. vkCode: 0x{:x}:{}", "MouseClicker", msg, msg, vkCode, vkCode);

	if (msg == WM_KEYDOWN)
	{
		if (vkCode == VK_LCONTROL || vkCode == VK_RCONTROL)
		{
			ctrlPressed = true;
		}
		if (vkCode == VK_LSHIFT || vkCode == VK_RSHIFT)
		{
			shiftPressed = true;
		}
		if (vkCode == VK_LMENU || vkCode == VK_RMENU)
		{
			altPressed = true;
		}

		broadcastKeyDownMsg(vkCode);
	}

	if (msg == WM_KEYUP)
	{
		if (vkCode == VK_LCONTROL || vkCode == VK_RCONTROL)
		{
			ctrlPressed = false;
		}
		if (vkCode == VK_LSHIFT || vkCode == VK_RSHIFT)
		{
			shiftPressed = false;
		}
		if (vkCode == VK_LMENU || vkCode == VK_RMENU)
		{
			altPressed = false;
		}
	}
}

void MouseClicker::broadcastKeyDownMsg(unsigned int vkCode)
{
	//LOG_INFO("[{:>24}] mouse clicker tell mouse pos", "MouseClicker");

	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("BROADCAST_KEYDOWN");
	e.data.set_item("key", vkCode);
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
}

void MouseClicker::onMouseMsg(unsigned int msg, int btn, unsigned int x, unsigned int y)
{
	if (msg == WM_MOUSEMOVE)
	{
		broadcastMousePos(x, y);
	}
	else if (msg == WM_LBUTTONDOWN || msg == WM_RBUTTONDOWN || msg == WM_MBUTTONDOWN || msg == WM_XBUTTONDOWN)
	{
		broadcastMouseDownMsg(msg);
	}
}

void MouseClicker::broadcastMousePos(int x, int y)
{
	//LOG_INFO("[{:>24}] mouse clicker tell mouse pos", "MouseClicker");

	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("BROADCAST_MOUSE_POS");
	e.data.set_item("x", x);
	e.data.set_item("y", y);
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
}

void MouseClicker::broadcastMouseDownMsg(unsigned int msg)
{
	BEHAVIOR_EVENT_PARAMS e = { 0 };
	e.name = WSTR("BROADCAST_MOUSEDOWN");
	e.data.set_item("msg", msg);
	if (_win) _win->broadcast_event(e); // this will post the event to all windows in the app
}

void adjustScreenPos(int &x, int &y)
{
	static bool ScreenMesured = false;
	static int GScreenX = 1920;
	static int GScreenY = 1080;
	if (!ScreenMesured)
	{
		HDC hdcScreen = GetWindowDC(NULL);
		GScreenX = GetDeviceCaps(hdcScreen, HORZRES);
		GScreenY = GetDeviceCaps(hdcScreen, VERTRES);
		DeleteObject(hdcScreen);
		ScreenMesured = true;
	}

	auto scale = 65535;
	x = x * scale / (GScreenX - 1);
	y = y * scale / (GScreenY - 1);
}

static int lastSimulateClickTime = 0;
void MouseClicker::simulateClick(int btn, bool dbClick, int x, int y)
{
	auto curr = ::GetTickCount64();
	auto elapsed = curr - lastSimulateClickTime;
	//LOG_INFO("[{:>24}] elapsed:{}mils. simulate click action", "MouseClicker", elapsed);
	lastSimulateClickTime = curr;

	INPUT Input = { 0 };
	Input.type = INPUT_MOUSE;
	
	adjustScreenPos(x, y);
	Input.mi.dx = x;
	Input.mi.dy = y;

	Input.mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE;
	switch (btn)
	{
	case eClickButton::left:
		Input.mi.dwFlags |= (MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP);
		break;
	case eClickButton::middle:
		Input.mi.dwFlags |= (MOUSEEVENTF_MIDDLEDOWN | MOUSEEVENTF_MIDDLEUP);
		break;
	case eClickButton::right:
		Input.mi.dwFlags |= (MOUSEEVENTF_RIGHTDOWN | MOUSEEVENTF_RIGHTUP);
		break;
	case eClickButton::side:
		Input.mi.dwFlags |= (MOUSEEVENTF_XDOWN | MOUSEEVENTF_XUP);
		break;
	default:
		break;
	}

	SendInput(1, &Input, sizeof(INPUT));
	if (dbClick) SendInput(1, &Input, sizeof(INPUT));
}

void MouseClicker::simulateMouseMove(int x, int y)
{
	//LOG_INFO("[{:>24}] simulate click action", "MouseClicker");

	INPUT Input = { 0 };
	Input.type = INPUT_MOUSE;

	adjustScreenPos(x, y);
	Input.mi.dx = x;
	Input.mi.dy = y;

	Input.mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE;

	SendInput(1, &Input, sizeof(INPUT));
}
