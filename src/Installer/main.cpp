#include <QPointer>
#include "Constants.h"
#include "AppMain.h"
#include "LogUtil.h"
//#include "CrashReportExport.h"

int uimain(std::function<int()> run)
{
	//InitBugReport((LPCTSTR)gProductId.c_str(), (LPCTSTR)gProductVer.c_str(), (LPCTSTR)gAppName.c_str());

	QPointer<AppMain> app = new AppMain(Q_NULLPTR);

	return app->uimain(run);
}