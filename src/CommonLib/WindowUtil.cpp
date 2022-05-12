#include "WindowUtil.h"
#include <QString>
#include "LogUtil.h"
#include "Constants.h"

WindowUtil* WindowUtil::sInstance = nullptr;

WindowUtil* WindowUtil::getInstance()
{
	if (WindowUtil::sInstance == nullptr)
	{
		WindowUtil::sInstance = new WindowUtil();
	}

	return sInstance;
}

WindowUtil::WindowUtil()
{

}

WindowUtil::~WindowUtil()
{

}

aux::hasset<TinyWindow> WindowUtil::findWindow(sciter::string path)
{
	for (int i = 0; i < _windows.size(); i++)
	{
		aux::hasset<TinyWindow> win = _windows.at(i);
		if (win != nullptr)
		{
			auto url = win->getUrl();
			if (url == path)
			{
				return win;
			}
		}
	}

	return nullptr;
}

unsigned int WindowUtil::createWindow(sciter::string path, int type, bool show)
{
	LOG_INFO("[{:>24}] create page window. path: {}. show it on loaded: {}", "WindowUtil", QString::fromStdWString(path).toStdString(), show);
	
	auto prev = findWindow(path);
	if (prev)
	{
		_windows.removeOne(prev);
	}
	
	aux::hasset<TinyWindow> win = new TinyWindow(SW_ALPHA | SW_ENABLE_DEBUG | type);
	win->setShowOnLoaded(show);
	win->setUrl(path);
	win->load(path.c_str());
	//win->expand();

	_windows.push_back(win);

	return (unsigned int)win->get_hwnd();
}