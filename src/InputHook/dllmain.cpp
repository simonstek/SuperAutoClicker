// dllmain.cpp : 定义 DLL 应用程序的入口点。
#include "pch.h"
#include <vector>
#include "IInputMsgHandler.h"
#include "InputEvent.h"

HHOOK GKeyboardHook = NULL;
HHOOK GMouseHook = NULL;
HINSTANCE GhInst = NULL;
std::vector<IInputMsgHandler*> GInputMsgHandlers;
std::vector<InputEvent> GInputEvents;
unsigned long GFirstInputEventTime = 0;
bool GRecording = false;

extern "C"
{
    __declspec(dllexport) BOOL __cdecl installHook();
    __declspec(dllexport) BOOL __cdecl unstallHook();
    __declspec(dllexport) BOOL __cdecl startRecording();
    __declspec(dllexport) BOOL __cdecl stopRecording();
    __declspec(dllexport) void __cdecl addInputMsgHandler(IInputMsgHandler* handler);
    __declspec(dllexport) void* __cdecl getInputEvents();
}

void onDllLoaded(HINSTANCE hModule)
{
    GhInst = hModule;
}

void onDllUnload()
{
}

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        onDllLoaded(hModule);
        break;
    case DLL_THREAD_ATTACH:
        break;
    case DLL_THREAD_DETACH:
        break;
    case DLL_PROCESS_DETACH:
        onDllUnload();
        break;
    }
    return TRUE;
}

void handleKeyboardMsg(UINT msg, DWORD vkCode)
{
    int numHandlers = GInputMsgHandlers.size();
    if (numHandlers <= 0) return;

    for (int i = 0; i < numHandlers; i++)
    {
        IInputMsgHandler*handler = GInputMsgHandlers.at(i);
        if (handler)
        {
            handler->onKeyboardMsg(msg, vkCode);
        }
    }
}

void handleMouseMsg(PMSLLHOOKSTRUCT ms, WPARAM wParam)
{
    int numHandlers = GInputMsgHandlers.size();
    if (numHandlers <= 0) return;

    for (int i = 0; i < numHandlers; i++)
    {
        IInputMsgHandler* handler = GInputMsgHandlers.at(i);
        if (handler)
        {
            unsigned int msg = (unsigned int)wParam;
            handler->onMouseMsg(msg, ms->mouseData, ms->pt.x, ms->pt.y);
        }
    }
}

void recordMouseData(PMSLLHOOKSTRUCT ms, WPARAM wParam)
{
    if (!GRecording) return;

    int elapsed = 0;
    if (GInputEvents.size() > 0)
    {
        elapsed = ms->time - GFirstInputEventTime;
    }

    int dwData = GET_WHEEL_DELTA_WPARAM(ms->mouseData);

    InputEvent e;

    // common input data
    e.type = eInputType::Mouse;
    e.time = elapsed;
    e.msg = (int)wParam;
    e.flags = (int)(ms->flags);

    // mouse related
    if (ms->pt.x < 0) ms->pt.x = 0;
    if (ms->pt.y < 0) ms->pt.y = 0;
    e.x = (int)(ms->pt.x);
    e.y = (int)(ms->pt.y);
    e.mouseData = dwData;

    // keyboard related
    e.scanCode = 0;
    e.vkCode = 0;

    GInputEvents.push_back(e);

    if (GInputEvents.size() == 1)
    {
        GFirstInputEventTime = ms->time;
    }
}

void recordKeyboardData(PKBDLLHOOKSTRUCT ks, WPARAM wParam)
{
    if (!GRecording) return;

    int elapsed = 0;
    if (GInputEvents.size() > 0)
    {
        elapsed = ks->time - GFirstInputEventTime;
    }

    InputEvent e;

    // common input data
    e.type = eInputType::Keyboard;
    e.time = elapsed;
    e.msg = (int)wParam;
    e.flags = (int)(ks->flags);

    // keyboard related
    e.scanCode = (int)ks->scanCode;
    e.vkCode = (int)ks->vkCode;

    // mouse related
    e.x = 0;
    e.y = 0;
    e.mouseData = 0;

    GInputEvents.push_back(e);

    if (GInputEvents.size() == 1)
    {
        GFirstInputEventTime = ks->time;
    }
}

LRESULT __stdcall LowLevelKeyboardProc(UINT nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode < 0)
    {
        return CallNextHookEx(GKeyboardHook, nCode, wParam, lParam);
    }

    if (nCode == HC_ACTION)
    {
        PKBDLLHOOKSTRUCT ks = (PKBDLLHOOKSTRUCT)lParam;
        if (!ks) return CallNextHookEx(GKeyboardHook, nCode, wParam, lParam);


        handleKeyboardMsg(wParam, ks->vkCode);
        recordKeyboardData(ks, wParam);
    }

    return CallNextHookEx(GKeyboardHook, nCode, wParam, lParam);
}

LRESULT __stdcall LowLevelMouseProc(UINT nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode < 0)
    {
        return CallNextHookEx(GMouseHook, nCode, wParam, lParam);
    }

    if (nCode == HC_ACTION)
    {
        PMSLLHOOKSTRUCT ms = (PMSLLHOOKSTRUCT)lParam;
        if (!ms) return CallNextHookEx(GMouseHook, nCode, wParam, lParam);

        handleMouseMsg(ms, wParam);
        recordMouseData(ms, wParam);
    }

    return CallNextHookEx(GMouseHook, nCode, wParam, lParam);
}

__declspec(dllexport) BOOL __cdecl installHook()
{
	GKeyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, (HOOKPROC)LowLevelKeyboardProc, GhInst, 0);
    GMouseHook = SetWindowsHookEx(WH_MOUSE_LL, (HOOKPROC)LowLevelMouseProc, GhInst, 0);

	return TRUE;
}

__declspec(dllexport) BOOL __cdecl unstallHook()
{
	BOOL ret;

	if (GKeyboardHook == NULL) return FALSE;
	ret = UnhookWindowsHookEx(GKeyboardHook);
	GKeyboardHook = NULL;

    if (GMouseHook == NULL) return FALSE;
    ret = UnhookWindowsHookEx(GMouseHook);
    GMouseHook = NULL;

	return ret;
}

__declspec(dllexport) BOOL __cdecl startRecording()
{
    BOOL ret = TRUE;

    GInputEvents.clear();
    GFirstInputEventTime = GetTickCount64();
    GRecording = true;

    return ret;
}

__declspec(dllexport) BOOL __cdecl stopRecording()
{
    BOOL ret = TRUE;

    GRecording = false;

    return ret;
}

__declspec(dllexport) void __cdecl addInputMsgHandler(IInputMsgHandler*handler)
{
    if (handler == NULL) return;
    GInputMsgHandlers.push_back(handler);
}

__declspec(dllexport) void* __cdecl getInputEvents()
{
    return &GInputEvents;
}