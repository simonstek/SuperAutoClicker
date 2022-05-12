#pragma once
#include <sciter-x.h>
#include <string>
#include <QString>
#include "Domain.h"

static const QString gLoadingEntrance = "this://app";

static const QString gMainWindowPath = QString("%1/app/app.html").arg(gLoadingEntrance);
static const QString gLoadingWindowPath = QString("%1/app/loading.html").arg(gLoadingEntrance);
static const QString gTrayWindowPath = QString("%1/app/tray.html").arg(gLoadingEntrance);
static const QString gPickWindowPath = QString("%1/app/pick.html").arg(gLoadingEntrance);
static const QString gUpdateWindowPath = QString("%1/app/update.html").arg(gLoadingEntrance);
static const QString gHotkeyWindowPath = QString("%1/app/hotkey.html").arg(gLoadingEntrance);
static const QString gInstallerWindowPath = QString("%1/installer/installer.html").arg(gLoadingEntrance);
static const QString gUnstallerWindowPath = QString("%1/unstaller/unstaller.html").arg(gLoadingEntrance);

static const QString gMacroFileMagic = "PowerClicker Macro File {DD4FF017-AF7D-4DA5-8CA9-337DB6D8BFF8}";
static const int KSimulatingInput = 123321;

extern QString gDebugPage;
extern bool gIsAutoReload;
extern bool gDisableInputHook;
extern bool gMainWindowNoTopmost;