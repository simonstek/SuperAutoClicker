#pragma once

#include <QObject>
#include <QPointer>
#include <QTimer>
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include "InputHooker.h"

class NativeActor : public QObject, public sciter::om::asset<NativeActor>
{
	Q_OBJECT
public:
	NativeActor(QObject* parent = nullptr);
	~NativeActor();

	static NativeActor* getInstance();

	void setWindow(sciter::window* win);

	void setClickInterval(int v);
	void setClickButton(int v);
	void setClickType(int v);
	void setClickRepeatType(int v);
	void setClickRepeatTimes(int v);
	void setClickLocationType(int v);
	void setClickLocationX(int v);
	void setClickLocationY(int v);
	void startClicking();
	void stopClicking();

private Q_SLOTS:
	void onClickTimer();

private:
	static NativeActor* sInstance;
	sciter::window* _win;
	int _clickInterval;
	int _clickButton;
	int _clickType;
	int _clickRepeatType;
	int _clickRepeatTimes;
	int _clickLocationType;
	int _clickLocationX;
	int _clickLocationY;
	int _clickCount;
	QPointer<QTimer> _clickTimer;

public:
	SOM_PASSPORT_BEGIN(NativeActor)
		SOM_FUNCS(
			SOM_FUNC(setClickInterval),
			SOM_FUNC(setClickInterval),
			SOM_FUNC(setClickButton),
			SOM_FUNC(setClickType),
			SOM_FUNC(setClickRepeatType),
			SOM_FUNC(setClickRepeatTimes),
			SOM_FUNC(setClickLocationType),
			SOM_FUNC(setClickLocationX),
			SOM_FUNC(setClickLocationY),
			SOM_FUNC(startClicking),
			SOM_FUNC(stopClicking)
		)
	SOM_PASSPORT_END
};

