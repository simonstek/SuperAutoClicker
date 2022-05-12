#include "NativeUtil.h"

#include <Windows.h>
#include <VersionHelpers.h>
#include <shellapi.h>
#include <iphlpapi.h>
#include <tlhelp32.h>
#include <chrono>
#include <Netlistmgr.h>

#include <thread>

#include <QLibrary>
#include <QSysInfo>
#include <QBuffer>
#include <QDataStream>
#include <QLocale>
#include <QProcess>
#include <QJsonDocument>
#include <QJsonObject>
#include <QCoreApplication>
#include <QCryptographicHash>
#include <QRegExp>
#include <QJsonArray>
#include <QSettings>
#include <QFile>
#include <QDir>
#include <QDebug>

#include "LogUtil.h"
#include "RegUtil.h"
#include "Constants.h"
#include "SysUtil.h"
#include "StringUtil.h"
#include "PathUtil.h"
#include "SysUtil.h"
#include "Version.h"
#include "Company.h"
#include "AppId.h"

#pragma comment(lib, "iphlpapi")

using namespace std;

NativeUtil::NativeUtil()
	: mainWindowPath(gMainWindowPath.toStdWString())
	, updateWindowPath(gUpdateWindowPath.toStdWString())
	, hotkeyWindowPath(gHotkeyWindowPath.toStdWString())
	, nativeVersion(gNativeVersion.toStdWString())
	, canMainWindowTopmost(!gMainWindowNoTopmost)
	, _timer_thread_started(false)
	, _timerMutex(new std::mutex)
	, _timerId(1)
#ifdef _DEBUG
	, isDebug(true)
#else
	, isDebug(false)
#endif // _DEBUG
{
	isAutoReload = gIsAutoReload;
}

NativeUtil::~NativeUtil()
{
}

NativeUtil* NativeUtil::sInstance = nullptr;

NativeUtil* NativeUtil::getInstance()
{
	if (NativeUtil::sInstance == nullptr)
	{
		NativeUtil::sInstance = new NativeUtil();
	}

	return sInstance;
}

int NativeUtil::log(sciter::string str, sciter::string filter)
{
	qDebug() << "[" << QString::fromStdWString(filter) << "]: \t" << QString::fromStdWString(str);
	LOG_INFO("[{:>12}] {}", wstring2string(filter), wstring2string(str));
	return 0;
}

bool NativeUtil::is64BitOS()
{
	SYSTEM_INFO si;
	GetNativeSystemInfo(&si);

	LOG_INFO("[{:>24}] si.wProcessorArchitecture={}", "NativeUtil", si.wProcessorArchitecture);
	if (si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64)
	{
		//64 位操作系统
		return true;
	}
	else
	{
		// 32 位操作系统
		return false;
	}
}

VERSIONHELPERAPI
IsWindowsVersion(WORD wMajorVersion, WORD wMinorVersion, WORD wServicePackMajor)
{
	OSVERSIONINFOEXW osvi = { sizeof(osvi), 0, 0, 0, 0, {0}, 0, 0 };
	DWORDLONG        const dwlConditionMask = VerSetConditionMask(
		VerSetConditionMask(
			VerSetConditionMask(
				0, VER_MAJORVERSION, VER_EQUAL),
			VER_MINORVERSION, VER_EQUAL),
		VER_SERVICEPACKMAJOR, VER_GREATER_EQUAL);

	osvi.dwMajorVersion = wMajorVersion;
	osvi.dwMinorVersion = wMinorVersion;
	osvi.wServicePackMajor = wServicePackMajor;

	return VerifyVersionInfoW(&osvi, VER_MAJORVERSION | VER_MINORVERSION | VER_SERVICEPACKMAJOR, dwlConditionMask) != FALSE;
}

VERSIONHELPERAPI
IsWindows7()
{
	return IsWindowsVersion(HIBYTE(_WIN32_WINNT_WIN7), LOBYTE(_WIN32_WINNT_WIN7), 0);
}

bool NativeUtil::isWindows7()
{
	return IsWindows7();
}

bool NativeUtil::isInternetAvailable()
{
	bool bIsInternetAvailable = false;
	// Get the required buffer size
	DWORD dwBufferSize = 0;
	if (ERROR_INSUFFICIENT_BUFFER == GetIpForwardTable(NULL, &dwBufferSize, false))
	{
		BYTE* pByte = new BYTE[dwBufferSize];
		if (pByte)
		{
			PMIB_IPFORWARDTABLE pRoutingTable = reinterpret_cast<PMIB_IPFORWARDTABLE>(pByte);
			// Attempt to fill buffer with routing table information
			if (NO_ERROR == GetIpForwardTable(pRoutingTable, &dwBufferSize, false))
			{
				DWORD dwRowCount = pRoutingTable->dwNumEntries; // Get row count
				// Look for default route to gateway
				for (DWORD dwIndex = 0; dwIndex < dwRowCount; ++dwIndex)
				{
					if (pRoutingTable->table[dwIndex].dwForwardDest == 0)
					{ // Default route designated by 0.0.0.0 in table
						bIsInternetAvailable = true; // Found it
						break; // Short circuit loop
					}
				}
			}
			delete[] pByte; // Clean up. Just say "No" to memory leaks
		}
	}
	return bIsInternetAvailable;
}

sciter::string NativeUtil::getRegistryStringValue(int root, sciter::string dir, sciter::string key)
{
	auto s = RegUtil::readString((HKEY)root, dir, key);
	if (!s.empty())
	{
		LOG_INFO("[{:>24}] get registry string value. dir={} key={} val={}", "NativeUtil", wstring2string(dir), wstring2string(key), wstring2string(s));
	}
	return s;
}

bool NativeUtil::createDesktopShortcut(sciter::string appName, sciter::string exePath, sciter::string cmdLine, sciter::string appIcon)
{
	CreateDesktopShortcut(appName, exePath, cmdLine, appIcon);

	return true;
}

sciter::string NativeUtil::getDesktopPath()
{
	auto str = GetDesktopPath();
	return str;
}

sciter::string NativeUtil::getCommandLine()
{
	return GetCommandLine();;
}

bool NativeUtil::isProcessRunning(sciter::string exeName)
{
	bool ret = false;

	PROCESSENTRY32 entry;
	entry.dwSize = sizeof(PROCESSENTRY32);

	HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);

	if (Process32First(snapshot, &entry) == TRUE)
	{
		while (Process32Next(snapshot, &entry) == TRUE)
		{
			if (wcscmp(entry.szExeFile, exeName.c_str()) == 0)
			{
				HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, entry.th32ProcessID);

				DWORD exitCode = 0;
				if (0 != GetExitCodeProcess(hProcess, &exitCode))
				{
					ret = (STILL_ACTIVE == exitCode);
				}

				CloseHandle(hProcess);
			}
		}
	}

	CloseHandle(snapshot);

	return ret;
}

sciter::string NativeUtil::getProcessIDList(sciter::string exeName)
{
	QStringList pids;

	PROCESSENTRY32 entry;
	entry.dwSize = sizeof(PROCESSENTRY32);

	HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);

	if (Process32First(snapshot, &entry) == TRUE)
	{
		while (Process32Next(snapshot, &entry) == TRUE)
		{
			if (wcscmp(entry.szExeFile, exeName.c_str()) == 0)
			{
				HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, entry.th32ProcessID);

				DWORD exitCode = 0;
				if (0 != GetExitCodeProcess(hProcess, &exitCode))
				{
					if (STILL_ACTIVE == exitCode)
					{
						pids.append(QString::number(entry.th32ProcessID));
					}
				}

				CloseHandle(hProcess);
			}
		}
	}

	CloseHandle(snapshot);

	return pids.join(',').toStdWString();
}

static const std::wstring SystemProcess[] = 
{
	L"explorer.exe",
	L"ntoskrnl.exe",
	L"WerFault.exe",
	L"backgroundTaskHost.exe",
	L"backgroundTransferHost.exe",
	L"winlogon.exe",
	L"wininit.exe",
	L"csrss.exe",
	L"lsass.exe",
	L"smss.exe",
	L"services.exe",
	L"taskeng.exe",
	L"taskhost.exe",
	L"dwm.exe",
	L"conhost.exe",
	L"svchost.exe",
	L"sihost.exe",
	L"uihost.exe",
	L"taskhostw.exe",
	L"igfxEM.exe",
	L"ctfmon.exe",
	L"StartMenuExperienceHost.exe",
	L"RuntimeBroker.exe",
	L"dllhost.exe",
	L"SearchApp.exe",
	L"YourPhone.exe",
	L"SettingSyncHost.exe",
	L"TextInputHost.exe",
	L"SecurityHealthSystray.exe",
	L"Cortana.exe",
	L"UserOOBEBroker.exe",
	L"Video.UI.exe",
	L"Microsoft.Photos.exe",
	L"smartscreen.exe",
	L"SearchFilterHost.exe",
	L"spacedeskServiceTray.exe",
	L"GameBar.exe",
	L"GameBarFTServer.exe",
	L"GameBarPresenceWriter.exe",
	L"javaw.exe",
	L"CefSharp.BrowserSubprocess.exe",
	L"LocationNotificationWindows.exe",
	L"WWAHost.exe",
	L"NVIDIA Web Helper.exe",
	L"WindowsInternal.ComposableShell.Experiences.TextInput.InputApp.exe",
	L"RtkAudUService64.exe",
	L"IGCC.exe",
	L"IGCCTray.exe",
	L"cmd.exe",
	L"ApplicationFrameHost.exe"
	L"prevhost.exe",
	L"nvcontainer.exe",
	L"WUDFHost.exe",
	L"fontdrvhost.exe",
	L"IntelCpHDCPSvc.exe",
	L"IntelCpHeciSvc.exe",
	L"igfxCUIService.exe",
	L"WmiPrvSE.exe",
	L"dasHost.exe",
	L"spoolsv.exe",
	L"CxAudioSvc.exe",
	L"CxUIUSvc64.exe",
	L"CxUtilSvc.exe",
	L"FlashHelperService.exe",
	L"OneApp.IGCC.WinService.exe",
	L"hydra_service.exe",
	L"jhi_service.exe",
	L"IpOverUsbSvc.exe",
	L"Locator.exe",
	L"LMS.exe",
	L"sqlservr.exe",
	L"RstMwService.exe",
	L"SECOMN64.exe",
	L"svc.exe",
	L"sqlwriter.exe",
	L"unsecapp.exe",
	L"winrdlv3.exe",
	L"SearchIndexer.exe",
	L"SearchUI.exe",
	L"SearchHost.exe",
	L"ShellExperienceHost.exe",
	L"SecurityHealthHost.exe",
	L"StandardCollector.Service.exe"
};

sciter::string NativeUtil::getProcessNameList()
{
	QStringList pnames;

	PROCESSENTRY32 entry;
	entry.dwSize = sizeof(PROCESSENTRY32);

	HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);

	if (Process32First(snapshot, &entry) == TRUE)
	{
		while (Process32Next(snapshot, &entry) == TRUE)
		{
			HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, entry.th32ProcessID);

			DWORD exitCode = 0;
			if (0 != GetExitCodeProcess(hProcess, &exitCode))
			{
				if (STILL_ACTIVE == exitCode)
				{
					auto pname = QString::fromStdWString(entry.szExeFile);
					if (!pnames.contains(pname))
					{
						if (std::find(std::begin(SystemProcess), std::end(SystemProcess), entry.szExeFile) == std::end(SystemProcess))
						{
							pnames.append(pname);
						}
					}
				}
			}

			CloseHandle(hProcess);
		}
	}

	CloseHandle(snapshot);

	return pnames.join(',').toStdWString();
}


bool NativeUtil::killProcess(sciter::string exeName)
{
	LOG_INFO("[{:>24}] try to kill process {}", "NativeUtil", wstring2string(exeName));
	bool ret = false;

	PROCESSENTRY32 entry;
	entry.dwSize = sizeof(PROCESSENTRY32);

	HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);

	if (Process32First(snapshot, &entry) == TRUE)
	{
		while (Process32Next(snapshot, &entry) == TRUE)
		{
			if (wcscmp(entry.szExeFile, exeName.c_str()) == 0)
			{
				LOG_INFO("[{:>24}] found matched exe {} open process", "NativeUtil", wstring2string(entry.szExeFile));

				HANDLE opendPHandle = OpenProcess(PROCESS_ALL_ACCESS, FALSE, entry.th32ProcessID);

				LOG_INFO("[{:>24}] hProcess={:x}", "NativeUtil", opendPHandle);

				DWORD exitCode = 0;
				auto ec = GetExitCodeProcess(opendPHandle, &exitCode);
				LOG_INFO("[{:>24}] exit code for this process is {}", "NativeUtil", exitCode);
				if (0 != ec)
				{
					LOG_INFO("[{:>24}] before terminate process", "NativeUtil");
					ret = TerminateProcess(opendPHandle, exitCode);
					LOG_INFO("[{:>24}] after terminate process", "NativeUtil");
				}

				CloseHandle(opendPHandle);
				LOG_INFO("[{:>24}] after close handle for hprocess", "NativeUtil");

				break;
			}
		}
	}

	LOG_INFO("[{:>24}] before close snapshot handle and exit this function", "NativeUtil");
	CloseHandle(snapshot);
	LOG_INFO("[{:>24}] after close snapshot handle and exit this function", "NativeUtil");

	return ret;
}

int NativeUtil::getSecondsSinceEpoch()
{
	auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch());
	auto c = ms.count() / 1000;
	return c;
}

sciter::string NativeUtil::OS()
{
	auto t = QSysInfo::prettyProductName();
	return t.toStdWString();
}

sciter::string NativeUtil::cpuArchitecture()
{
	auto t = QSysInfo::currentCpuArchitecture();
	return t.toStdWString();
}

sciter::string NativeUtil::kernelType()
{
	auto t = QSysInfo::kernelType();
	return t.toStdWString();
}

sciter::string NativeUtil::kernelVersion()
{
	auto t = QSysInfo::kernelVersion();
	return t.toStdWString();
}

bool NativeUtil::mkdir(sciter::string path)
{
	QString t = QString::fromStdWString(path);
	QDir dir(t);
	if (!dir.exists())
	{
		auto success = dir.mkpath(".");
		LOG_INFO("[{:>24}] mkdir dir {} success: {}", t.toStdString(), success);
		return success;
	}

	return true;
}

sciter::string NativeUtil::programsPath()
{
	auto t = PathUtil::getProgramsPath();
	return t.toStdWString();
}

sciter::string NativeUtil::appDataPath()
{
	auto t = PathUtil::getAppDataPath();
	return t.toStdWString();
}

sciter::string NativeUtil::selectFolder(sciter::string title, sciter::string initialFolder)
{
	QString qTitle = QString::fromStdWString(title);
	QString qInitialFolder = QString::fromStdWString(initialFolder);
	LOG_INFO("[{:>24}] select folder. title={} path={}", "NativeUtil", qTitle.toStdString(), qInitialFolder.toStdString());

	auto r = MySelectFolder();
	return r;
}

bool NativeUtil::isNetworkConnected()
{
	bool result = false;
	
	HRESULT hr = E_FAIL;
	IUnknown* pUnknown = NULL;
	INetworkListManager* pNetworkListManager = NULL;

	hr = CoInitialize(NULL);
	do 
	{
		if (FAILED(hr)) break;

		//  通过NLA接口获取网络状态
		BOOL   bOnline = TRUE;//是否在线  
		hr = CoCreateInstance(CLSID_NetworkListManager, NULL, CLSCTX_ALL, IID_IUnknown, (void**)&pUnknown);
		if (FAILED(hr)) break;
		if (pUnknown == NULL) break;

		
		hr = pUnknown->QueryInterface(IID_INetworkListManager, (void**)&pNetworkListManager);
		if (FAILED(hr)) break;
		if (pNetworkListManager == NULL) break;

		VARIANT_BOOL IsConnect = VARIANT_FALSE;
		hr = pNetworkListManager->get_IsConnectedToInternet(&IsConnect);
		if (FAILED(hr)) break;
		
		result = (IsConnect == VARIANT_TRUE);

	} while (false);

	if (pNetworkListManager) pNetworkListManager->Release();
	if (pUnknown) pUnknown->Release();
	CoUninitialize();

	LOG_INFO("[{:>24}] check network connection. connected: {}", "Network", result);

	return result;
}

bool NativeUtil::copyFile(sciter::string from, sciter::string to, bool overwrite)
{
	LOG_INFO("[{:>24}] copy file from {} to {}. overwrite: {}", "NativeUtil", QString::fromStdWString(from).toStdString(), QString::fromStdWString(to).toStdString(), overwrite);

	auto qFrom = QString::fromStdWString(from);
	QFile f1(qFrom);
	if (!f1.exists())
	{
		LOG_INFO("[{:>24}] copy file failed. file {} does NOT exists!", "NativeUtil", qFrom.toStdString());
		return false;
	}

	auto qTo = QString::fromStdWString(to);
	QFile f2(qTo);
	if (overwrite && f2.exists())
	{
		LOG_INFO("[{:>24}] destination file {} exists. try to remove it first", "NativeUtil", qTo.toStdString());
		if (!f2.remove())
		{
			LOG_INFO("[{:>24}] cannot remove destination file {}", "NativeUtil", qTo.toStdString());
		}
	}
	
	auto success = f1.copy(qTo);
	LOG_INFO("[{:>24}] copy file result: {}", "NativeUtil", success);

	return success;
}

bool NativeUtil::launch(sciter::string exeFullPath, sciter::string workDir, sciter::string command)
{
	auto qExeFullPath	= QString::fromStdWString(exeFullPath);
	auto qWorkDir		= QString::fromStdWString(workDir);
	auto qCommand		= QString::fromStdWString(command);
	LOG_INFO("[{:>24}] try to launch: {}, work dir: {}, command: {}", "NativeUtil", qExeFullPath.toStdString(), qWorkDir.toStdString(), qCommand.toStdString());

	bool started = QProcess::startDetached(qExeFullPath, qCommand.split(','), qWorkDir);
	LOG_INFO("[{:>24}] launch result: {}. pid: {}", "NativeUtil", started);


	return started;
}

QPointer<QSharedMemory> NativeUtil::getSharedMemory(QString key)
{
	QString keyPrefix = "QSharedMemory_For_PowerClicker_";
	QString fullKey = keyPrefix + key;

	QPointer<QSharedMemory> sm = nullptr;
	for (int i = 0; i < _sms.size(); i++)
	{
		sm = _sms.at(i);
		if (sm->key() == fullKey)
		{
			return sm;
		}
	}

	sm = new QSharedMemory();
	sm->setKey(fullKey);
	_sms.push_back(sm);

	return sm;
}

bool NativeUtil::setSharedMemoryValue(sciter::string key, sciter::string value)
{
	QString qKey = QString::fromStdWString(key);
	QString qVal = QString::fromStdWString(value);
	LOG_INFO("[{:>24}] try to set shared memory data. key: {}. value: {}", "SharedMemory", qKey.toStdString(), qVal.toStdString());

	QPointer<QSharedMemory> sm = getSharedMemory(qKey);

	// see: https://doc.qt.io/qt-5/qtcore-ipc-sharedmemory-example.html
	// tests whether the shared memory segment is already attached to the process. 
	// If so, that segment is detached from the process, so we can be assured of starting off the example correctly.
	if (sm->isAttached()) sm->detach();

	QJsonObject obj;
	obj.insert(qKey, qVal);
	QJsonDocument doc;
	doc.setObject(obj);
	QString json = doc.toJson();

	QBuffer buffer;
	buffer.open(QBuffer::ReadWrite);
	QDataStream out(&buffer);
	out << json;
	int size = buffer.size();
	if (!sm->create(size))
	{
		LOG_INFO("[{:>24}] failed to create shared memory. error: {}--{}. key: {}. value: {}", "SharedMemory", sm->error(), sm->errorString().toStdString(), qKey.toStdString(), qVal.toStdString());
		
		// 如果该共享内存已经存在，则不必退出，继续往下写入
		if (sm->error() != QSharedMemory::AlreadyExists)
		{
			return false;
		}
	}

	sm->lock();
	char* to = (char*)sm->data();
	const char* from = buffer.data().data();
	memcpy(to, from, qMin(sm->size(), size));
	sm->unlock();

	_sms.push_back(sm);

	return true;
}

sciter::string NativeUtil::getSharedMemoryValue(sciter::string key)
{
	QString qKey = QString::fromStdWString(key);
	//LOG_INFO("[{:>24}] try to get shared memory data. key: {}", "SharedMemory", qKey.toStdString());

	QPointer<QSharedMemory> sm = getSharedMemory(qKey);

	if (!sm->attach(QSharedMemory::ReadOnly))
	{
		//LOG_INFO("[{:>24}] get shared memory data failed to attach. error: {}--{}. key: {}", "SharedMemory", sm->error(), sm->errorString().toStdString(), qKey.toStdString());
		return L"";
	}

	QBuffer buffer;
	QDataStream in(&buffer);
	QString result = "";

	sm->lock();
	buffer.setData((char*)sm->constData(), sm->size());
	buffer.open(QBuffer::ReadOnly);
	in >> result;
	sm->unlock();

	QJsonDocument doc = QJsonDocument::fromJson(result.toUtf8());
	QJsonObject obj = doc.object();
	QString qVal = obj.value(qKey).toString();

	sm->detach();
	_sms.push_back(sm);

	//LOG_INFO("[{:>24}] get shared memory data success!. key: {}. value: {}", "SharedMemory", qKey.toStdString(), result.toStdString());
	return qVal.toStdWString();
}

sciter::string NativeUtil::language()
{
	auto lang = QLocale::system().uiLanguages().first();
	LOG_INFO("[{:>24}] detected lang: {}", "LANG", lang.toStdString());

	auto qa = QCoreApplication::arguments();
	QStringList args = qa.at(0).split(' ');
	QRegExp r("LANG=([a-zA-Z]{2}\\-[a-zA-Z]{2})");
	if (r.indexIn(qa.at(0)) >= 0)
	{
		auto c = r.capturedTexts();
		lang = c.last();
		LOG_INFO("[{:>24}] debug param lang: {}", "LANG", lang.toStdString());
	}

	return lang.toStdWString();
}

sciter::string NativeUtil::arguments()
{
	auto a = QCoreApplication::arguments().join(' ');
	return a.toStdWString();
}


typedef struct tDiskInfo
{
	QString model;
	QString sn;
	double size;
	int appId;

	bool operator == (const tDiskInfo& other)
	{
		auto equal = (this->appId == other.appId && this->model == other.model && this->sn == other.sn && this->size == other.size);
		return equal;
	}

	QJsonObject toJson() const
	{
		return { {"diskModel", model}, {"diskSerialNumber", sn}, {"diskSize", size}, {"appId", appId} };
	}

}DiskInfo;

QList<DiskInfo> get_disk_list()
{
	QProcess process;
	process.start("wmic diskdrive get Model, SerialNumber, Size");
	process.waitForFinished(-1); // will wait forever until finished

	auto list = QString::fromLocal8Bit(process.readAllStandardOutput()).split("\n");

	QRegExp empty("^\\s*$");
	QList<DiskInfo> actual;
	for(int i = 0; i < list.size(); i++)
	{
		QString desc = list.at(i);
		if (!empty.exactMatch(desc))
		{
			auto ll = desc.split(QRegExp("\\s{2,}"));
			if (ll.size() > 2)
			{
				if (ll[0] != "Model" && ll[1] != "SerialNumber")
				{
					DiskInfo info = { ll[0], ll[1], ll[2].toDouble(), gAppId};
					actual.append(info);
				}
			}
		}
	}

	return actual;
}

QJsonArray toJson(const QList<DiskInfo>& list)
{
	QJsonArray array;
	for (auto& disk : list)
	{
		array.append(disk.toJson());
	}
	return array;
}


sciter::string NativeUtil::getDiskList()
{
	auto list = get_disk_list();
	QJsonDocument doc;
	QJsonObject obj;
	obj.insert("list", toJson(list));
	doc.setObject(obj);
	auto data = doc.toJson();
	auto str = QString::fromLatin1(data);
	return str.toStdWString();
}

quint64 getDriveFreeBits(QString drive)
{
	LPCWSTR lpcwstrDrive = (LPCWSTR)drive.utf16();

	ULARGE_INTEGER liFreeBytesAvailable, liTotalBytes, liTotalFreeBytes;

	if (!GetDiskFreeSpaceEx(lpcwstrDrive, &liFreeBytesAvailable, &liTotalBytes, &liTotalFreeBytes))
	{
		LOG_INFO("[{:>24}] ERROR: Call to GetDiskFreeSpaceEx() failed.", "NativeUtil");
		return 1;
	}

	return (quint64)liTotalFreeBytes.QuadPart;
}

float NativeUtil::getMemeryBits()
{
	MEMORYSTATUSEX statex;
	statex.dwLength = sizeof(statex);
	GlobalMemoryStatusEx(&statex);
	auto r = statex.ullTotalPhys;
	return r;
}

float NativeUtil::getSystemDriveFreeBits()
{
	auto r = getDriveFreeBits(QDir::rootPath());
	return r;
}

// Returns empty QByteArray() on failure.
QByteArray getFileChecksum(const QString& fileName, QCryptographicHash::Algorithm hashAlgorithm)
{
	QFile f(fileName);
	if (f.open(QFile::ReadOnly))
	{
		QCryptographicHash hash(hashAlgorithm);
		if (hash.addData(&f)) 
		{
			return hash.result();
		}
	}
	return QByteArray();
}

sciter::string NativeUtil::getFileSha256(sciter::string path)
{
	QString qPath = QString::fromStdWString(path);
	LOG_INFO("[{:>24}] try to get file {} sha256", "NativeUtil", qPath.toStdString());
	auto checksum = getFileChecksum(qPath, QCryptographicHash::Sha256);
	auto finger = QString::fromUtf8(checksum.toHex());
	return finger.toStdWString();
}

bool NativeUtil::setRegistryString(sciter::string entry, sciter::string key, sciter::string value)
{
	QString qEntry = QString::fromStdWString(entry);
	QString qKey = QString::fromStdWString(key);
	QString qVal = QString::fromStdWString(value);
	QSettings settings(qEntry, QSettings::NativeFormat);
	settings.setValue(qKey, qVal);

	return true;
}

bool NativeUtil::setRegistryIntValue(sciter::string entry, sciter::string key, int value)
{
	QString qEntry = QString::fromStdWString(entry);
	QString qKey = QString::fromStdWString(key);
	QSettings settings(qEntry, QSettings::NativeFormat);
	settings.setValue(qKey, value);

	return true;
}

bool NativeUtil::removeRegistry(sciter::string entry, sciter::string key)
{
	QString qEntry = QString::fromStdWString(entry);
	QString qKey = QString::fromStdWString(key);
	QSettings settings(qEntry, QSettings::NativeFormat);
	settings.remove(qKey);
	return true;
}

bool NativeUtil::removeFile(sciter::string path)
{
	QString qPath = QString::fromStdWString(path);
	QFile file(qPath);
	bool ret = file.remove();

	LOG_INFO("[{:>24}] remove file {} result: {}", "NativeUtil", qPath.toStdString(), ret);

	return ret;
}

bool NativeUtil::removeDir(sciter::string path)
{
	QString qPath = QString::fromStdWString(path);
	QDir dir(qPath);
	bool ret = dir.removeRecursively();

	LOG_INFO("[{:>24}] remove dir {} result: {}", "NativeUtil", qPath.toStdString(), ret);

	return ret;
}

sciter::string NativeUtil::getTempPath()
{
	auto p = PathUtil::getTempPath();
	return p.toStdWString();
}

sciter::string NativeUtil::toBase64Str(sciter::string str)
{
	QString s = QString::fromStdWString(str);
	auto b = s.toUtf8().toBase64(QByteArray::Base64UrlEncoding);
	QString q = QString(b);
	return q.toStdWString();
}

int NativeUtil::getCursorX()
{
	POINT p;
	GetCursorPos(&p);
	return p.x;
}

int NativeUtil::getCursorY()
{
	POINT p;
	GetCursorPos(&p);
	return p.y;
}

int NativeUtil::getMonitorCount()
{
	auto count = GetSystemMetrics(SM_CMONITORS);
	return count;
}

sciter::string NativeUtil::processFolder()
{
	auto dir = QCoreApplication::applicationDirPath().utf16();
	sciter::string s = (wchar_t*)dir;
	return s;
}


QList<IntervalAction>& NativeUtil::getIntervalActions()
{
	return _ias;
}

std::shared_ptr<std::mutex> NativeUtil::getTimerMutex()
{
	return _timerMutex;
}

void timer_thread(void *me)
{
	LOG_INFO("[{:>24}] timer thread started", "NativeUtil");

	NativeUtil* n = (NativeUtil*)me;
	auto m = n->getTimerMutex();
	while (true)
	{
		m->lock();
		// do interval actions
		QList<IntervalAction> to_removes;
		auto &ias = n->getIntervalActions();
		auto curr = ::GetTickCount64();
		for (int i = 0; i < ias.size(); i++)
		{
			IntervalAction &ia = ias[i];
			auto elapsed = curr - ia.lastActionTime;
			if (elapsed >= ia.interval)
			{
				ia.fn.call();
				ia.lastActionTime = curr;
			}

			if (!ia.infinite)
			{
				to_removes.append(ia);
			}
		}

		// clear one-time actions
		for (int i = 0; i < to_removes.size(); i++)
		{
			IntervalAction &ia1 = to_removes[i];
			for (int j = 0; j < ias.size(); j++)
			{
				IntervalAction& ia2 = ias[j];
				if (ia1.id == ia2.id)
				{
					ias.removeAt(j);
				}
			}
		}
		m->unlock();

		//::Sleep(1);
	}
}

int NativeUtil::setInterval(sciter::value fn, int milliseconds)
{
	if (!_timer_thread_started)
	{
		_timer_thread_started = true;
		std::thread t(timer_thread, this);
		t.detach();
	}

	_timerMutex->lock();
	_ias.append(IntervalAction{ _timerId, fn, milliseconds, true, 0 });
	_timerMutex->unlock();

	return  _timerId++;
}

bool NativeUtil::clearInterval(int id)
{
	_timerMutex->lock();
	for (int i = 0; i < _ias.size(); i++)
	{
		IntervalAction& ia = _ias[i];
		if (ia.id == id)
		{
			_ias.removeAt(i);
		}
	}
	_timerMutex->unlock();
	return true;
}


int NativeUtil::setTimeout(sciter::value fn, int milliseconds)
{
	if (!_timer_thread_started)
	{
		_timer_thread_started = true;
		std::thread t(timer_thread, this);
		t.detach();
	}

	_timerMutex->lock();
	_ias.append(IntervalAction{ _timerId, fn, milliseconds, false, 0 });
	_timerMutex->unlock();

	return  _timerId++;
}

bool NativeUtil::clearTimeout(int id)
{
	_timerMutex->lock();
	for (int i = 0; i < _ias.size(); i++)
	{
		IntervalAction& ia = _ias[i];
		if (ia.id == id)
		{
			_ias.removeAt(i);
		}
	}
	_timerMutex->unlock();
	return true;
}
