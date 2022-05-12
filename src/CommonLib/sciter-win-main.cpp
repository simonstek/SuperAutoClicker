
#include "sciter-x-window.hpp"
#include "sciter-x-threads.h"
#include <QtCore/QCoreApplication>

#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files:
#include <windows.h>
#include <shellapi.h>

#include <vector>

#include "LogUtil.h"

HINSTANCE ghInstance = THIS_HINSTANCE;

#ifndef SKIP_MAIN

int APIENTRY wWinMain(HINSTANCE hInstance,
                      HINSTANCE hPrevInstance,
                      LPWSTR    lpCmdLine,
                      int       nCmdShow)
{
    LOG_INFO("[{:>24}] win start", "sciter-win-main");

    QString qArgs = QString::fromWCharArray(lpCmdLine);
    char* cstr = new char[qArgs.toStdString().length() + 1];
    strcpy(cstr, qArgs.toStdString().c_str());
    int n = 1;
    QCoreApplication a(n, (char**)(&cstr));
    QCoreApplication* b = &a;

    ghInstance = hInstance;
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(nCmdShow);

    OleInitialize(0); // for system drag-n-drop

    // comment this out if you need system theming
    ::SciterSetOption(NULL,SCITER_SET_UX_THEMING,TRUE);

    auto message_pump = [b]() -> int 
    {
        return b->exec();
    };

    LOG_INFO("[{:>24}] win pre Qt event loop", "sciter-win-main");

    int r = uimain(message_pump);

    LOG_INFO("[{:>24}] win pro Qt event loop", "sciter-win-main");

    OleUninitialize();

    LOG_INFO("[{:>24}] win after ole unit", "sciter-win-main");

    a.quit();

    LOG_INFO("[{:>24}] win quited", "sciter-win-main");

    return r;
}
#endif
namespace sciter {

  namespace application 
  {
    const std::vector<sciter::string>& argv() {
      static std::vector<sciter::string> _argv;
      if( _argv.size() == 0 ) {
        int argc = 0;
        LPWSTR *arglist = CommandLineToArgvW(GetCommandLineW(), &argc);
        if( !arglist )
          return _argv;
        for( int i = 0; i < argc; ++i)
          _argv.push_back(arglist[i]);
        LocalFree(arglist);
      }
      return _argv;
    } 

    HINSTANCE hinstance() {
      return ghInstance;
    }

  }
  
  LRESULT window::on_message( HWINDOW hwnd, UINT msg, WPARAM wParam, LPARAM lParam, SBOOL& pHandled )
  {
      if (msg == WM_SYSCOMMAND && wParam == SC_CLOSE)
      {
          BEHAVIOR_EVENT_PARAMS e = { 0 };
          e.name = WSTR("SYSCOMMAND_WINDOW_CLOSE");
          e.data.set_item("hwnd", (unsigned int)hwnd);
          sciter::window::broadcast_event(e); // this will post the event to all windows in the app
      }
      return 0;
  }

}

