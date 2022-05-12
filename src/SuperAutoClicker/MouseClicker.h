#pragma once

#include <QObject>
#include <QPointer>
#include <QTimer>
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include "InputHooker.h"
#include "ClickButton.h"
#include "MacroFile.h"

using namespace sciter;

class MouseClicker : public QObject, public sciter::om::asset<MouseClicker>, public InputHooker
{
	Q_OBJECT
public:
	MouseClicker(QObject* parent = nullptr);
	~MouseClicker();

	static MouseClicker* getInstance();

	void setWindow(sciter::window* win);

	bool installInputHook();
	bool unstallInputHook();
	bool startRecording();
	bool stopRecording();
	sciter::value saveMacro(sciter::string name, sciter::string path);
	bool startPlaying(sciter::string path);
	bool stopPlaying();
	bool renameMacro(sciter::string oldPath, sciter::string newPath, sciter::string newName);
	sciter::value getMacroFile(sciter::string path);

	void broadcastKeyDownMsg(unsigned int vkCode);
	void broadcastMouseDownMsg(unsigned int vkBtn);
	void broadcastMousePos(int x, int y);

	void simulateClick(int btn, bool dbClick, int x, int y);
	void simulateMouseMove(int x, int y);

public:
	virtual void onKeyboardMsg(unsigned int msg, unsigned long long vkCode);
	virtual void onMouseMsg(unsigned int msg, int btn, unsigned int x, unsigned int y);

private Q_SLOTS:
	void onPlayingTimer();

private:
	void simulateInputs(int currTime);
	void simulateSingleInput(const InputEvent &e);

private:
	static MouseClicker*			sInstance;
	sciter::window*					_win;
	bool							ctrlPressed;
	bool							shiftPressed;
	bool							altPressed;
	QTimer*							_playTimer;
	MacroFile*						_macro;
	unsigned long					_playStartTime;
	unsigned long					_lastSimulatedTime;
	unsigned long					_currPlayEventIndex;
	int								_numSimulatedEvents;

public:
	SOM_PASSPORT_BEGIN(MouseClicker)
		SOM_FUNCS(
			SOM_FUNC(installInputHook),
			SOM_FUNC(unstallInputHook),
			SOM_FUNC(startRecording),
			SOM_FUNC(stopRecording),
			SOM_FUNC(saveMacro),
			SOM_FUNC(startPlaying),
			SOM_FUNC(stopPlaying),
			SOM_FUNC(renameMacro),
			SOM_FUNC(getMacroFile),
			SOM_FUNC(simulateClick),
			SOM_FUNC(simulateMouseMove)
		)

		SOM_PROPS(
			SOM_RO_PROP(ctrlPressed),
			SOM_RO_PROP(shiftPressed),
			SOM_RO_PROP(altPressed)
		)
	SOM_PASSPORT_END
};

