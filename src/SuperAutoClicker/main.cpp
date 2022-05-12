#include <string>

#include <chrono>
#include <functional>
#include <exception>
#include <QPointer>
#include <QTimer>
#include "TinyWindow.h"
#include "NativeUtil.h"
#include "Constants.h"
#include "AppMain.h"

int uimain(std::function<int()> run)
{
	QPointer<AppMain> app = new AppMain(Q_NULLPTR);

	return app->uimain(run);
}