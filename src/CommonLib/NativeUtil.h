#pragma once
#include "sciter-x.h"
#include "sciter-x-window.hpp"
#include <QList>
#include <QPointer>
#include <QSharedMemory>
#include <mutex>

typedef struct tIntervalAction
{
	int id;
	sciter::value fn;
	int interval; // in milliseconds
	bool infinite;
	unsigned long long lastActionTime;
}IntervalAction;

class NativeUtil : public sciter::om::asset<NativeUtil>
{
public:
	static NativeUtil* getInstance();

	NativeUtil();
	~NativeUtil();

	int log(sciter::string str, sciter::string filter);
	bool is64BitOS();
	bool isWindows7();
	bool isInternetAvailable();
	sciter::string getRegistryStringValue(int root, sciter::string dir, sciter::string key);
	bool createDesktopShortcut(sciter::string appName, sciter::string exePath, sciter::string cmdLine, sciter::string appIcon);
	sciter::string getDesktopPath();
	sciter::string getCommandLine();
	bool isProcessRunning(sciter::string exeName);
	sciter::string getProcessIDList(sciter::string exeName);
	sciter::string getProcessNameList();
	bool killProcess(sciter::string exeName);
	int getSecondsSinceEpoch();

	sciter::string OS();
	sciter::string cpuArchitecture();
	sciter::string kernelType();
	sciter::string kernelVersion();

	bool mkdir(sciter::string path);
	sciter::string programsPath();
	sciter::string appDataPath();

	sciter::string selectFolder(sciter::string title, sciter::string initialFolder);
	bool copyFile(sciter::string from, sciter::string to, bool overwrite);
	bool launch(sciter::string exeFullPath, sciter::string workDir, sciter::string command);

	bool isNetworkConnected();

	bool setSharedMemoryValue(sciter::string key, sciter::string value);
	sciter::string getSharedMemoryValue(sciter::string key);

	sciter::string language();

	sciter::string arguments();

	sciter::string getDiskList();

	float getMemeryBits();
	float getSystemDriveFreeBits();

	sciter::string getFileSha256(sciter::string path);

	bool setRegistryString(sciter::string entry, sciter::string key, sciter::string value);
	bool setRegistryIntValue(sciter::string entry, sciter::string key, int value);
	bool removeRegistry(sciter::string entry, sciter::string key);
	bool removeFile(sciter::string path);
	bool removeDir(sciter::string path);
	sciter::string getTempPath();

	sciter::string toBase64Str(sciter::string str);

	int getCursorX();
	int getCursorY();
	int getMonitorCount();

	sciter::string processFolder();

	int setInterval(sciter::value fn, int milliseconds);
	bool clearInterval(int id);
	int setTimeout(sciter::value fn, int milliseconds);
	bool clearTimeout(int id);
	QList<IntervalAction>& getIntervalActions();
	std::shared_ptr<std::mutex> getTimerMutex();

private:
	QPointer<QSharedMemory> getSharedMemory(QString key);

private:
	static NativeUtil* sInstance;
	bool isDebug;
	bool isAutoReload;
	bool canMainWindowTopmost;
	sciter::string nativeVersion;
	sciter::string mainWindowPath;
	sciter::string updateWindowPath;
	sciter::string hotkeyWindowPath;
	QList<QPointer<QSharedMemory>> _sms;
	bool _timer_thread_started;
	QList<IntervalAction> _ias;
	int _timerId;
	std::shared_ptr<std::mutex> _timerMutex;

public:
	SOM_PASSPORT_BEGIN(NativeUtil)
		SOM_FUNCS(
			SOM_FUNC(log),
			SOM_FUNC(is64BitOS),
			SOM_FUNC(isWindows7),
			SOM_FUNC(isInternetAvailable),
			SOM_FUNC(getRegistryStringValue),
			SOM_FUNC(createDesktopShortcut),
			SOM_FUNC(getDesktopPath),
			SOM_FUNC(getCommandLine),
			SOM_FUNC(isProcessRunning),
			SOM_FUNC(getProcessIDList),
			SOM_FUNC(getProcessNameList),
			SOM_FUNC(killProcess),
			SOM_FUNC(getSecondsSinceEpoch),
			SOM_FUNC(OS),
			SOM_FUNC(cpuArchitecture),
			SOM_FUNC(kernelType),
			SOM_FUNC(kernelVersion),
			SOM_FUNC(appDataPath),
			SOM_FUNC(programsPath),
			SOM_FUNC(selectFolder),
			SOM_FUNC(isNetworkConnected),
			SOM_FUNC(copyFile),
			SOM_FUNC(launch),
			SOM_FUNC(setSharedMemoryValue),
			SOM_FUNC(getSharedMemoryValue),
			SOM_FUNC(language),
			SOM_FUNC(mkdir),
			SOM_FUNC(arguments),
			SOM_FUNC(getDiskList),
			SOM_FUNC(getMemeryBits),
			SOM_FUNC(getSystemDriveFreeBits),
			SOM_FUNC(getFileSha256),
			SOM_FUNC(setRegistryString),
			SOM_FUNC(setRegistryIntValue),
			SOM_FUNC(removeRegistry),
			SOM_FUNC(removeFile),
			SOM_FUNC(removeDir),
			SOM_FUNC(getTempPath),
			SOM_FUNC(toBase64Str),
			SOM_FUNC(getCursorX),
			SOM_FUNC(getCursorY),
			SOM_FUNC(getMonitorCount),
			SOM_FUNC(processFolder),
			SOM_FUNC(setInterval),
			SOM_FUNC(clearInterval),
			SOM_FUNC(setTimeout),
			SOM_FUNC(clearTimeout)
		)
		SOM_PROPS(
			SOM_RO_PROP(isDebug),
			SOM_RO_PROP(isAutoReload),
			SOM_RO_PROP(canMainWindowTopmost),
			SOM_RO_PROP(nativeVersion),
			SOM_RO_PROP(mainWindowPath),
			SOM_RO_PROP(updateWindowPath),
			SOM_RO_PROP(hotkeyWindowPath)
		)
	SOM_PASSPORT_END
};