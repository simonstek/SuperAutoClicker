#include "InputHooker.h"

#include <Windows.h>
#include <VersionHelpers.h>
#include <shellapi.h>
#include <iphlpapi.h>
#include <tlhelp32.h>
#include <chrono>
#include <QLibrary>

#include "LogUtil.h"
#include "RegUtil.h"
#include "Constants.h"
#include "SysUtil.h"
#include "StringUtil.h"

#pragma comment(lib, "iphlpapi")

using namespace std;

InputHooker::InputHooker()
	:  _inputHookIsInstalled(false)
{
	_dll.setFileName("InputHook");
}

InputHooker::~InputHooker()
{
}

bool InputHooker::installInputHook()
{
	LOG_INFO("[{:>24}] try to install input hook", "InputHooker");

	if (_inputHookIsInstalled)
	{
		LOG_INFO("[{:>24}] already installed input hook!", "InputHooker");
		return true;
	}

	if (!_dll.load())
	{
		LOG_INFO("[{:>24}] failed to load input hook dll!", "InputHooker");
		return false;
	}

	typedef BOOL(__cdecl* InstallHookFunc)();
	InstallHookFunc fn = (InstallHookFunc)_dll.resolve("installHook");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find installHook function!", "InputHooker");
		return false;
	}
	auto result = fn();
	LOG_INFO("[{:>24}] install input hook result: {}", "InputHooker", result);

	_inputHookIsInstalled = result;

	if (_inputHookIsInstalled)
	{
		addInputMsgHandler();
	}

	return result;
}

bool InputHooker::unstallInputHook()
{
	LOG_INFO("[{:>24}] try to unstall input hook", "InputHooker");

	if (!_inputHookIsInstalled)
	{
		LOG_INFO("[{:>24}] input hook is NOT installed. no need to unstall it", "InputHooker");
		return true;
	}

	if (!_dll.isLoaded())
	{
		LOG_INFO("[{:>24}] input hook dll is NOT loaded!", "InputHooker");
		return false;
	}

	typedef BOOL(__cdecl* UnstallHookFunc)();
	UnstallHookFunc fn = (UnstallHookFunc)_dll.resolve("unstallHook");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find unstallHook function!", "InputHooker");
		return false;
	}
	auto result = fn();
	LOG_INFO("[{:>24}] unstall input hook result: {}", "InputHooker", result);

	auto un = _dll.unload();
	LOG_INFO("[{:>24}] unload InputHooker dll result: {}", "InputHooker", un);

	_inputHookIsInstalled = !result;
	return result;
};

bool InputHooker::startRecording()
{
	LOG_INFO("[{:>24}] start recording", "InputHooker");

	if (!_inputHookIsInstalled)
	{
		LOG_INFO("[{:>24}] input hook is NOT installed. no need to start recording", "InputHooker");
		return true;
	}

	typedef BOOL(__cdecl* StartRecordingFunc)();
	StartRecordingFunc fn = (StartRecordingFunc)_dll.resolve("startRecording");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find startRecording function!", "InputHooker");
		return false;
	}
	auto result = fn();
	LOG_INFO("[{:>24}] start recording result: {}", "InputHooker", result);

	return true;
}

bool InputHooker::stopRecording()
{
	LOG_INFO("[{:>24}] stop recording", "InputHooker");

	if (!_inputHookIsInstalled)
	{
		LOG_INFO("[{:>24}] input hook is NOT installed. no need to stop recording", "InputHooker");
		return true;
	}

	typedef BOOL(__cdecl* StopRecordingFunc)();
	StopRecordingFunc fn = (StopRecordingFunc)_dll.resolve("stopRecording");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find stopRecording function!", "InputHooker");
		return false;
	}
	auto result = fn();
	LOG_INFO("[{:>24}] stop recording result: {}", "InputHooker", result);

	return true;
}

void* InputHooker::getInputEvents()
{
	LOG_INFO("[{:>24}] get input events", "InputHooker");

	typedef void*(__cdecl* GetInputEventsFunc)();
	GetInputEventsFunc fn = (GetInputEventsFunc)_dll.resolve("getInputEvents");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find getInputEvents function!", "InputHooker");
		return nullptr;
	}
	auto result = fn();
	LOG_INFO("[{:>24}] get input events result: {}", "InputHooker", result);

	return result;
}

void InputHooker::onKeyboardMsg(unsigned int msg, unsigned long long vkCode)
{
	//Logger::get()->info("on keyboard msg={:#x}. vkcode={:#x}", msg, vkCode);
}

void InputHooker::onMouseMsg(unsigned int msg, int btn, unsigned int x, unsigned int y)
{
	//Logger::get()->info("on mouse msg={:#x}. vkcode={:#x}", msg, vkCode);
}

bool InputHooker::addInputMsgHandler()
{
	LOG_INFO("[{:>24}] try to add input msg handler", "InputHooker");

	if (!_dll.isLoaded())
	{
		LOG_INFO("[{:>24}] input hook dll is NOT loaded!", "InputHooker");
		return false;
	}

	// add keyboard message handler
	typedef void(__cdecl* AddInputMsgHandlerFunc)(IInputMsgHandler*);
	AddInputMsgHandlerFunc fn = (AddInputMsgHandlerFunc)_dll.resolve("addInputMsgHandler");
	if (fn == nullptr)
	{
		LOG_INFO("[{:>24}] cannot find AddInputMsgHandlerFunc!", "InputHooker");
		return false;
	}
	fn(this);
	LOG_INFO("[{:>24}] added input msg handler", "InputHooker");

	return true;
}