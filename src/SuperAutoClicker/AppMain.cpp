#include "AppMain.h"
#include <string>

#include <chrono>
#include <functional>
#include <exception>
#include <QCoreApplication>
#include <QPointer>
#include <QTimer>
#include <QRegExp>
#include "Constants.h"
#include "NativeUtil.h"
#include "NativeActor.h"
#include "MouseClicker.h"
#include "ClickButton.h"
#include "ClickType.h"
#include "ClickRepeatType.h"
#include "ClickLocationType.h"
#include "VirtualKey.h"
#include "LogUtil.h"
#include "WindowUtil.h"

#include "resources.cpp"

AppMain::AppMain(QObject *parent)
	: QObject(parent)
	, _loadingWindow(nullptr)
	, _trayWindow(nullptr)
{
	
}

int AppMain::uimain(std::function<int()> run)
{
	LOG_INFO("[{:>24}] \n\n\n\n", "AppMain");
	LOG_INFO("[{:>24}] SuperAutoClicker initialiazing...................................", "AppMain");

	auto qa = QCoreApplication::arguments();
	if (qa.size() > 0)
	{
		QStringList args = qa.at(0).split(' ');
		LOG_INFO("[{:>24}] args: {}", "AppMain", args.join(' ').toStdString());

		QRegExp r("DebugPage=\"(.*)?\"");
		if (r.indexIn(qa.at(0)) >= 0)
		{
			auto c = r.capturedTexts();
			gDebugPage = c.last();
			gIsAutoReload = true;
		}

		if (args.indexOf("DisableInputHook") >= 0)
		{
			gDisableInputHook = true;
		}

		if (args.indexOf("MainWindowNoTopmost") >= 0)
		{
			gMainWindowNoTopmost = true;
		}
	}

	// resources archive 
	sciter::archive::instance().open(aux::elements_of(resources)); // bind resources[] (defined in "resources.cpp") with the archive

	SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES, ALLOW_SOCKET_IO | ALLOW_FILE_IO | ALLOW_EVAL | ALLOW_SYSINFO);
#ifdef _DEBUG
	SciterSetOption(NULL, SCITER_SET_DEBUG_MODE, TRUE);
#endif
	SciterSetOption(NULL, SCITER_FONT_SMOOTHING, 3);
	SciterSetOption(NULL, SCITER_SET_MAX_HTTP_DATA_LENGTH, 1024);
	SciterSetOption(NULL, SCITER_SET_UX_THEMING, TRUE);

	SciterSetGlobalAsset(WindowUtil::getInstance());
	SciterSetGlobalAsset(MouseClicker::getInstance());
	SciterSetGlobalAsset(NativeActor::getInstance());
	SciterSetGlobalAsset(NativeUtil::getInstance());
	SciterSetGlobalAsset(new ClickButton());
	SciterSetGlobalAsset(new ClickType());
	SciterSetGlobalAsset(new ClickRepeatType());
	SciterSetGlobalAsset(new ClickLocationType());
	SciterSetGlobalAsset(new VirtualKey());

	_loadingWindow = new TinyWindow(SW_ALPHA | SW_TOOL | SW_ENABLE_DEBUG);

	_trayWindow = new TinyWindow(SW_ALPHA | SW_MAIN | SW_ENABLE_DEBUG);
	MouseClicker::getInstance()->setWindow(_trayWindow);
	NativeActor::getInstance()->setWindow(_trayWindow);
	
	//win->load(WSTR("this://app/index.html"));

	loadUIPage();
	if (gIsAutoReload)
	{
		// load ui page periodly
		QPointer<QTimer> timer = new QTimer();
		connect(timer, SIGNAL(timeout()), this, SLOT(timeout()));
		timer->start(3000);
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
	if (gDebugPage != "")
	{
		_loadingWindow->load(gDebugPage.toStdWString().c_str());
	}
	else
	{
		_loadingWindow->load(gLoadingWindowPath.toStdWString().c_str());
		//_loadingWindow->expand();

		_trayWindow->load(gTrayWindowPath.toStdWString().c_str());
		//_trayWindow->expand();
	}
}