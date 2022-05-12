#include "TinyWindow.h"
#include "LogUtil.h"
#include <VersionHelpers.h>
#include <shellapi.h>
#include <QCoreApplication>

using namespace std;

TinyWindow::TinyWindow(int flags)
	: sciter::window(flags)
	, showOnLoaded(true)
{
	LOG_INFO("[{:>24}] TinyWindow construct", "TinyWindow");
}

TinyWindow::~TinyWindow()
{
	LOG_INFO("[{:>24}] TinyWindow destruct", "TinyWindow");
}

void TinyWindow::setShowOnLoaded(bool show)
{
	showOnLoaded = show;
}

static void ThreadExecute(LPVOID p)
{
	ShellExecuteParams* params = (ShellExecuteParams*)p;

	LOG_INFO("[{:>24}] ThreadExecute", "TinyWindow");

	SHELLEXECUTEINFO info = { 0 };
	info.cbSize = sizeof(SHELLEXECUTEINFO);
	info.fMask = SEE_MASK_NOCLOSEPROCESS;
	info.hwnd = NULL;
	info.lpVerb = NULL;
	info.lpFile = params->file.c_str();
	info.lpParameters = params->param.c_str();
	info.lpDirectory = params->workdir.c_str();
	info.nShow = params->show;
	info.hInstApp = NULL;

	ShellExecuteEx(&info);
	::WaitForSingleObject(info.hProcess, INFINITE);

	if (!params->callback.empty())
	{
		LOG_INFO("[{:>24}] callback NOT empty: {}", "TinyWindow", QString::fromStdWString(params->callback).toStdString());
		SciterCall(params->hwnd, QString::fromStdWString(params->callback).toStdString().c_str(), 0, NULL, 0);
	}

	delete params;
}

bool TinyWindow::hideFromTaskBar()
{
	LOG_INFO("[{:>24}] hide from taskbar", "TinyWindow");

	auto hWnd = get_hwnd();
	DWORD dwExStyle = GetWindowLong(hWnd, GWL_STYLE);
	dwExStyle &= ~(WS_VISIBLE);
	dwExStyle |= WS_EX_TOOLWINDOW;
	dwExStyle &= ~(WS_EX_APPWINDOW);
	SetWindowLong(hWnd, GWL_STYLE, dwExStyle);
	ShowWindow(hWnd, SW_SHOW);
	ShowWindow(hWnd, SW_HIDE);
	UpdateWindow(hWnd);

	return true;
}

unsigned int TinyWindow::hwnd()
{
	return (unsigned int)get_hwnd();
}

void TinyWindow::setTitle(sciter::string text)
{
	SetWindowText(get_hwnd(), text.c_str());
}

sciter::string TinyWindow::getUrl()
{
	return _url;
}

void TinyWindow::setUrl(sciter::string url)
{
	_url = url;
}