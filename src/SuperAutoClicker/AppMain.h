#pragma once

#include <QObject>
#include <functional>
#include "TinyWindow.h"

class AppMain : public QObject
{
	Q_OBJECT

public:
	AppMain(QObject *parent);
	~AppMain();

	int uimain(std::function<int()> run);

private:
	void loadUIPage();

private Q_SLOTS:
	void timeout();

private:
	aux::hasset<TinyWindow> _loadingWindow;
	aux::hasset<TinyWindow> _trayWindow;
};
