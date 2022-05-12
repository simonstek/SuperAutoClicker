#include "SysUtil.h"
#include<Windows.h>
#include <string>
#include <shellapi.h>
#include <shlobj.h>
#include <new>
#include "LogUtil.h"
#pragma  comment(lib, "shell32.lib")

std::wstring GetProcessName()
{
	TCHAR szFileName[MAX_PATH + 1];
	GetModuleFileName(NULL, szFileName, MAX_PATH + 1);
	std::wstring mname = szFileName;
	mname = mname.substr(mname.find_last_of('\\') + 1);
	return mname;
}

long long GetPid()
{
	return (long long)::GetCurrentProcessId();
}

/*
//获取相关系统路径
HRESULT SHGetSpecialFolderLocation(
    HWND hwndOwner, int nFolder, PIDLIST_ABSOLUTE *ppidl
);

第一个参数表示所有者窗口句柄，一般传入NULL就可以了。
第二个参数要示是一个整数id，决定哪个目录是待查找目录, 它的取值可能是
CSIDL_BITBUCKET            回收站
CSIDL_CONTROLS            控制面板
CSIDL_DESKTOP              Windows桌面desktop;

CSIDL_DESKTOPDIRECTORY   desktop的目录；
CSIDL_DRIVES                我的电脑
CSIDL_FONTS                 字体目录
CSIDL_NETHOOD             网上邻居
CSIDL_NETWORK             网上邻居virtual folder

CSIDL_PERSONAL             我的文档
CSIDL_PRINTERS              打印机
CSIDL_PROGRAMS             程序组
CSIDL_RECENT                最近打开文档
CSIDL_SENDTO                发送到菜单项
CSIDL_STARTMENU            快速启动菜单
CSIDL_STARTUP               启动目录
CSIDL_TEMPLATES            临时文档
第三个参数表示一个条目标识符列表指针，可以传入一个LPITEMIDLIST类型变量，再从这个变量中得到表示路径的字符串。使用完后，要用void CoTaskMemFree(void * pv)来释放资源。
*/



//封装的创建快捷方式API
// szStartAppPath : 点击后启动的程序
// szAddCmdLine : 传给main函数的lpCmdLine
// szDestLnkPath : 快捷方式的保存路径
// szIconPath : 快捷方式显示的图标
bool CreateLinkFile(LPCTSTR szStartAppPath, LPCTSTR szAddCmdLine, LPCOLESTR szDestLnkPath, LPCTSTR szIconPath)
{
    LOG_INFO("[{:>24}] CreateLinkFile. szStartAppPath={} szAddCmdLine={} szDestLnkPath={} szIconPath={}", "SysUtil", wstring2string(szStartAppPath), wstring2string(szAddCmdLine), wstring2string(szDestLnkPath), wstring2string(szIconPath));
    HRESULT hr = CoInitialize(NULL);
    if (SUCCEEDED(hr))
    {
        IShellLink* pShellLink;
        hr = CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (void**)&pShellLink);
        if (SUCCEEDED(hr))
        {
            pShellLink->SetPath(szStartAppPath);
            wstring strTmp = szStartAppPath;
            int nStart = strTmp.find_last_of(L"\\");
            auto subs = strTmp.substr(0, nStart);
            auto workDir = subs.c_str();
            LOG_INFO("[{:>24}] work dir={}", "SysUtil", wstring2string(workDir));
            pShellLink->SetWorkingDirectory(workDir);
            pShellLink->SetArguments(szAddCmdLine);
            pShellLink->SetIconLocation(szStartAppPath, 0);
            IPersistFile* pPersistFile;
            hr = pShellLink->QueryInterface(IID_IPersistFile, (void**)&pPersistFile);
            if (SUCCEEDED(hr))
            {
                hr = pPersistFile->Save((szDestLnkPath), FALSE);
                if (SUCCEEDED(hr))
                {
                    return true;
                }
                pPersistFile->Release();
            }
            pShellLink->Release();
        }
        CoUninitialize();
    }
    return false;
}
//百度的string转换wstring
std::wstring s2ws(const std::string& s)
{
    int len;
    int slength = (int)s.length() + 1;
    len = MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, 0, 0);
    wchar_t* buf = new wchar_t[len];
    MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, buf, len);
    std::wstring r(buf);
    delete[] buf;
    return r;
}

void CreateDesktopShortcut(const std::wstring& appName, const std::wstring& exePath, const std::wstring& cmdLine, const std::wstring& appIcon)
{
    LOG_INFO("[{:>24}] CreateDesktopShortcut. appName={} exePath={} cmdLine={} appIcon={}", "SysUtil", wstring2string(appName), wstring2string(exePath), wstring2string(cmdLine), wstring2string(appIcon));

    LPITEMIDLIST lp;
    HRESULT hr = SHGetSpecialFolderLocation(0, CSIDL_DESKTOP, &lp);
    LOG_INFO("[{:>24}] SHGetSpecialFolderLocation result={:x}", "SysUtil", hr);

    WCHAR lstr[MAX_PATH] = L"";
    BOOL ret = SHGetPathFromIDList(lp, lstr);
    LOG_INFO("[{:>24}] SHGetPathFromIDList result={}", "SysUtil", ret);
    wstring lnkPath = lstr;
    LOG_INFO("[{:>24}] lnkPath={}", "SysUtil", wstring2string(lnkPath));

    lnkPath += L"\\";
    lnkPath += appName;
    lnkPath += L".lnk";
    LOG_INFO("[{:>24}] concated lnkPath={}", "SysUtil", wstring2string(lnkPath));
    CreateLinkFile(exePath.c_str(), cmdLine.c_str(), lnkPath.c_str(), appIcon.c_str());
}

std::wstring GetDesktopPath()
{

    LPITEMIDLIST lp;
    HRESULT hr = SHGetSpecialFolderLocation(0, CSIDL_DESKTOP, &lp);
    LOG_INFO("[{:>24}] SHGetSpecialFolderLocation result={:x}", "SysUtil", hr);

    WCHAR lstr[MAX_PATH] = L"";
    BOOL ret = SHGetPathFromIDList(lp, lstr);
    LOG_INFO("[{:>24}] SHGetPathFromIDList result={}", "SysUtil", ret);
    wstring desktopPath = lstr;
    LOG_INFO("[{:>24}] GetDesktopPath={}", "SysUtil", wstring2string(desktopPath));

    return desktopPath;
}

std::wstring getAppDataDir()
{
    std::wstring dir = L"nonedir";
    char* buf = nullptr;
    size_t sz = 0;
    if (_dupenv_s(&buf, &sz, "APPDATA") == 0 && buf != nullptr)
    {
        printf("EnvVarName = %s\n", buf);
        dir = string2wstring(buf);
        free(buf);
    }

    return dir;
}

static int CALLBACK BrowseCallbackProc(HWND hwnd, UINT uMsg, LPARAM lParam, LPARAM lpData)
{

    if (uMsg == BFFM_INITIALIZED)
    {
        std::string tmp = (const char*)lpData;
        std::cout << "path: " << tmp << std::endl;
        SendMessage(hwnd, BFFM_SETSELECTION, TRUE, lpData);
    }

    return 0;
}

std::wstring BrowseFolder(std::string saved_path)
{
    TCHAR path[MAX_PATH];

    const char* path_param = saved_path.c_str();

    BROWSEINFO bi = { 0 };
    bi.lpszTitle = (L"Browse for folder...");
    bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE;
    bi.lpfn = BrowseCallbackProc;
    bi.lParam = (LPARAM)path_param;

    LPITEMIDLIST pidl = SHBrowseForFolder(&bi);

    if (pidl != 0)
    {
        //get the name of the folder and put it in path
        SHGetPathFromIDList(pidl, path);

        //free memory used
        IMalloc* imalloc = 0;
        if (SUCCEEDED(SHGetMalloc(&imalloc)))
        {
            imalloc->Free(pidl);
            imalloc->Release();
        }

        return path;
    }

    return L"";
}

std::wstring MySelectFolder()
{
    std::wstring result = L"";

    // CoCreate the File Open Dialog object.
    IFileDialog* pfd = NULL;
    HRESULT hr = E_FAIL;

    do
    {
        HRESULT hr = CoCreateInstance(CLSID_FileOpenDialog, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&pfd));
        if (FAILED(hr)) break;

        // Set the options on the dialog.
        DWORD dwFlags;

        // Before setting, always get the options first in order 
        // not to override existing options.
        hr = pfd->GetOptions(&dwFlags);
        if (FAILED(hr)) break;

        // In this case, get shell items only for file system items.
        hr = pfd->SetOptions(dwFlags | FOS_PICKFOLDERS);
        if (FAILED(hr)) break;

        // Show the dialog
        hr = pfd->Show(NULL);
        if (FAILED(hr)) break;

        // Obtain the result once the user clicks 
        // the 'Open' button.
        // The result is an IShellItem object.
        IShellItem* psiResult;
        hr = pfd->GetResult(&psiResult);
        if (FAILED(hr)) break;

        //hr = pfd->SetDefaultFolder(psiResult);

        // We are just going to print out the 
        // name of the file for sample sake.
        PWSTR pszFilePath = NULL;
        hr = psiResult->GetDisplayName(SIGDN_FILESYSPATH, &pszFilePath);
        if (SUCCEEDED(hr))
        {
            result = pszFilePath;
            CoTaskMemFree(pszFilePath);
        }
        psiResult->Release();

    } while (false);

    if (pfd != NULL) pfd->Release();

    return result;
}