#pragma once
#include <Windows.h>
#include <iostream>
#include <string>

using namespace std;

class RegUtil
{
public:
    static wstring readString(HKEY root, wstring dir, wstring key)//读取操作表,其类型为DWORD
    {
        HKEY hKEY;
        auto ret = ::RegOpenKeyEx(root, dir.c_str(), 0, KEY_READ | KEY_WOW64_64KEY, & hKEY);
        if (ret == ERROR_SUCCESS)
        {
            DWORD dwSize = sizeof(DWORD);
            DWORD dwType = REG_SZ;

            ret = ::RegQueryValueEx(hKEY, key.c_str(), NULL, &dwType, NULL, &dwSize);
            if (ret != ERROR_SUCCESS)
            {
                //std::cout << "错误：无法查询有关的注册表信息1" << std::endl;
                return L"";
            }

            WCHAR val[1024];//长整型数据，如果是字符串数据用char数组
            ret = ::RegQueryValueEx(hKEY, key.c_str(), NULL, &dwType, (LPBYTE)(val), &dwSize);
            if (ret != ERROR_SUCCESS)
            {
                //cout << "错误：无法查询有关的注册表信息2" << std::endl;
                return L"";
            }

            //std::cout << val << std::endl;
            return val;
        }
        ::RegCloseKey(hKEY);

        return L"";
    }
};