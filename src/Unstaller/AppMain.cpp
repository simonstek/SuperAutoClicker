#include "AppMain.h"
#include <string>

#include <chrono>
#include <functional>
#include <exception>
#include <QPointer>
#include <QTimer>
#include "Constants.h"
#include "NativeUtil.h"
#include "LogUtil.h"
#include "VirtualKey.h"

#include "resources.cpp"

AppMain::AppMain(QObject *parent)
	: QObject(parent)
{
	
}

int AppMain::uimain(std::function<int()> run)
{
	LOG_INFO("[{:>24}] \n\n\n\n", "AppMain");
	LOG_INFO("[{:>24}] PowerClicker Unstaller initialiazing...................................", "AppMain");

	// resources archive 
	sciter::archive::instance().open(aux::elements_of(resources)); // bind resources[] (defined in "resources.cpp") with the archive

	SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES, ALLOW_SOCKET_IO | ALLOW_FILE_IO | ALLOW_EVAL | ALLOW_SYSINFO);
	SciterSetOption(NULL, SCITER_SET_DEBUG_MODE, TRUE);
	SciterSetOption(NULL, SCITER_FONT_SMOOTHING, 3);
	SciterSetOption(NULL, SCITER_SET_MAX_HTTP_DATA_LENGTH, 1024);
	SciterSetOption(NULL, SCITER_SET_UX_THEMING, TRUE);

	_win = new TinyWindow(SW_ALPHA | SW_MAIN | SW_ENABLE_DEBUG);

	SciterSetGlobalAsset(new NativeUtil());
	SciterSetGlobalAsset(new VirtualKey());

	//win->load(WSTR("this://app/unstaller.html"));
	
	if (1)
	{
		loadUIPage();
	}
	else
	{
		// load ui page periodly
		QPointer<QTimer> timer = new QTimer();
		connect(timer, SIGNAL(timeout()), this, SLOT(timeout()));
		timer->start(1000);
	}

	return run();
}

AppMain::~AppMain()
{
}

void AppMain::timeout()
{
	loadUIPage();
}

void AppMain::loadUIPage()
{
	_win->load(gUnstallerWindowPath.toStdWString().c_str());
	//_win->load(L"http://localhost/app/update.html");
	//_win->expand();
}