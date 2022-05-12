#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include "TinyWindow.h"
#include <QList>

class WindowUtil : public sciter::om::asset<WindowUtil>
{
public:
	WindowUtil();
	~WindowUtil();

	static WindowUtil* getInstance();

	unsigned int createWindow(sciter::string path, int type, bool show);

private:
	aux::hasset<TinyWindow> findWindow(sciter::string path);

private:
	static WindowUtil* sInstance;
	QList<aux::hasset<TinyWindow>> _windows;

public:
	SOM_PASSPORT_BEGIN(WindowUtil)
		SOM_FUNCS(
			SOM_FUNC(createWindow)
		)

	SOM_PASSPORT_END
};

