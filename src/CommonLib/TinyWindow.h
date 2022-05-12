#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"

struct ShellExecuteParams
{
	std::wstring file;
	std::wstring param;
	std::wstring callback;
	std::wstring workdir = L".";
	bool show = false;
	HWND hwnd;
};

class TinyWindow : public sciter::window
{
public:
	TinyWindow(int flags);
	~TinyWindow();

	bool hideFromTaskBar();
	unsigned int hwnd();

	void setShowOnLoaded(bool show);
	void setTitle(sciter::string text);

	sciter::string getUrl();
	void setUrl(sciter::string url);

private:
	bool showOnLoaded;
	sciter::string _url;

public:

	SOM_PASSPORT_BEGIN_EX(N, TinyWindow)
		SOM_FUNCS(
			SOM_FUNC(hideFromTaskBar),
			SOM_FUNC(hwnd),
			SOM_FUNC(setTitle)
		)
		SOM_PROPS(
			SOM_RO_PROP(showOnLoaded)
		)
	SOM_PASSPORT_END
};